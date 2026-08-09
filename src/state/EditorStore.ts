import type { Layer, Point, ToolId, Units, ValidationResult } from '../core/types';
import { aciToHex } from '../core/dxfColors';
import { parseMathExpression } from '../core/mathParser';
import { calibrationFactor, idleCalibration, type CalibrationState } from '../image/calibration';
import { isOverImage, type TracingImage } from '../image/TracingImage';
import { saveDxf } from '../io/exportDxf';
import { parseDxf, loadDxfIntoDoc } from '../io/importDxf';
import { loadImageFile } from '../io/importImage';
import { addRecentFile, type RecentFileEntry } from '../io/recentFiles';
import { saveSessionToBrowser, loadSessionFromBrowser, type SavedSession } from '../io/browserStorage';
import { Doc } from '../model/Doc';
import { History } from '../model/history';
import { convertGridSize, unitFactor } from '../model/units';
import { validateGeometry } from '../model/validate';
import { renderScene } from '../render/renderScene';
import type { Scene } from '../render/Scene';
import { getTool, SHORTCUTS } from '../tools/registry';
import type { AnyTool, PointerInput, ToolApi } from '../tools/types';
import { applyOrtho, findSnap, type Snap } from '../viewport/snap';
import { Viewport } from '../viewport/Viewport';

export interface DynFieldUi {
  key: string;
  label: string;
  placeholder: string;
  value: string;
}

export interface ClipboardItem {
  type: 'line' | 'arc';
  p1: Point;
  p2: Point;
  cx?: number;
  cy?: number;
  r?: number;
  layerId?: string;
}

export interface DynUi {
  /** Client-space point the box is positioned near. */
  anchor: Point;
  fields: DynFieldUi[];
  /** Current mode when the tool offers a toggle (circle radius vs diameter). */
  mode: string | null;
  modeLabel: string | null;
}

export interface TracingUi {
  visible: boolean;
  opacity: number;
  worldWidth: number;
}

/** The immutable view of editor state that React components render from. */
export interface UiState {
  toolId: ToolId;
  units: Units;
  gridSize: number;
  snapToGrid: boolean;
  cursor: Point;
  edgeCount: number;
  validation: ValidationResult;
  shapeMode: boolean;
  canExport: boolean;
  hint: { text: string; visible: boolean };
  measurement: string | null;
  tracing: TracingUi | null;
  calibrationActive: boolean;
  /** Canvas-space anchor for the "enter real distance" dialog. */
  calibrationBox: Point | null;
  dyn: DynUi | null;
  layers: Layer[];
  activeLayerId: string;
  selectionSize: number;
}

const ORIGIN: Point = { x: 0, y: 0 };

/**
 * Owns all editor state and wires the DOM to the tools. React reads a
 * derived, immutable `UiState`; the canvas is painted imperatively so that
 * pointer motion never depends on a React render.
 */
export class EditorStore {
  readonly doc = new Doc();
  readonly view = new Viewport();
  readonly selection = new Set<number>();
  private readonly history = new History();

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  private toolId: ToolId = 'line';
  private tool: AnyTool = getTool('line');
  private toolState: object = this.tool.createState();

  private units: Units = 'in';
  private gridSize = 0.25;
  private snapToGrid = true;

  private layers: Map<string, Layer> = new Map([
    ['0', { id: '0', name: '0', color: '#ffffff', dxfColorIndex: 7, visible: true }],
  ]);
  private activeLayerId = '0';

  private hoverId: number | null = null;
  private snap: Snap | null = null;
  private pointer = { world: ORIGIN, rawWorld: ORIGIN, screen: ORIGIN };

  private panning = false;
  private panStart = ORIGIN;
  private panOrigin = ORIGIN;
  private spaceDown = false;

  private tracing: TracingImage | null = null;
  private imageDrag: { startScreen: Point; startPos: Point } | null = null;

  private calibration: CalibrationState = idleCalibration();
  private calibrationBox: Point | null = null;

  private hintText = '';
  private hintVisible = false;
  private hintTimer: ReturnType<typeof setTimeout> | null = null;
  private measurement: string | null = null;

  /** Snapped cursor before any typed dimension override — the dyn box's reference. */
  private dynCursor: Point = ORIGIN;
  private dynAnchor: Point | null = null;
  private dynValues: Record<string, string> = {};
  private dynMode = '';

  private docVersion = 0;
  private validationCache: { version: number; result: ValidationResult } | null = null;
  private shapeMode = false;
  private clipboard: ClipboardItem[] = [];

  private frameHandle = 0;
  private listeners = new Set<() => void>();
  private uiSnapshot: UiState;

  private readonly api: ToolApi;

  constructor() {
    // `units` and `gridSize` are getters so tools always read live values.
    const store = this;
    this.api = {
      doc: this.doc,
      view: this.view,
      selection: this.selection,
      get units() {
        return store.units;
      },
      get gridSize() {
        return store.gridSize;
      },
      get activeLayerId() {
        return store.activeLayerId;
      },
      edit: (mutate) => this.edit(mutate),
      showHint: (msg, dur) => this.showHint(msg, dur),
      setHoverEdge: (id) => this.setHoverEdge(id),
      setMeasurement: (text) => this.setMeasurement(text),
      setCursor: (cursor) => this.setCursor(cursor),
      openDynInput: (anchor) => this.openDynInput(anchor),
      closeDynInput: () => this.closeDynInput(),
      redraw: () => {
        this.requestDraw();
        this.emit();
      },
    };
    this.uiSnapshot = this.buildUi();
    void this.restoreBrowserSession();
    this.showHint(
      'True arcs: circles stay curved when cut · B = Break tool · Shift = ortho · Snap to endpoints/midpoints',
      8000,
    );
  }

  // ------------------------------------------------------------- subscription

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): UiState => this.uiSnapshot;

  private emit(): void {
    this.uiSnapshot = this.buildUi();
    for (const listener of this.listeners) listener();
  }

  private buildUi(): UiState {
    const validation = this.validation();
    return {
      toolId: this.toolId,
      units: this.units,
      gridSize: this.gridSize,
      snapToGrid: this.snapToGrid,
      cursor: this.pointer.world,
      edgeCount: this.doc.edgeCount,
      validation,
      shapeMode: this.shapeMode,
      canExport: !this.doc.isEmpty && (!this.shapeMode || validation.valid),
      hint: { text: this.hintText, visible: this.hintVisible },
      measurement: this.measurement,
      tracing: this.tracing
        ? {
            visible: this.tracing.visible,
            opacity: this.tracing.opacity,
            worldWidth: this.tracing.worldWidth,
          }
        : null,
      calibrationActive: this.calibration.active,
      calibrationBox: this.calibrationBox,
      dyn: this.buildDynUi(),
      layers: Array.from(this.layers.values()),
      activeLayerId: this.activeLayerId,
      selectionSize: this.selection.size,
    };
  }

  // --------------------------------------------------------------- validation

  private autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

  private markDocChanged(): void {
    this.docVersion++;
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => {
      void this.autoSaveSession();
    }, 500);
  }

  private async autoSaveSession(): Promise<void> {
    const session: SavedSession = {
      version: 1,
      timestamp: Date.now(),
      docSnapshot: this.doc.snapshot(),
      units: this.units,
      gridSize: this.gridSize,
      snapToGrid: this.snapToGrid,
      shapeMode: this.shapeMode,
      activeLayerId: this.activeLayerId,
      layers: Array.from(this.layers.values()),
      tracing: this.tracing
        ? {
            dataUrl: this.tracing.img.src,
            x: this.tracing.x,
            y: this.tracing.y,
            worldWidth: this.tracing.worldWidth,
            opacity: this.tracing.opacity,
            visible: this.tracing.visible,
          }
        : null,
    };
    await saveSessionToBrowser(session);
  }

  private async restoreBrowserSession(): Promise<void> {
    const session = await loadSessionFromBrowser();
    if (!session || !session.docSnapshot || session.docSnapshot.edges.length === 0) return;

    this.doc.restore(session.docSnapshot);
    this.units = session.units || 'in';
    this.gridSize = session.gridSize || 0.25;
    this.snapToGrid = session.snapToGrid ?? true;
    this.shapeMode = session.shapeMode ?? false;

    if (session.layers && session.layers.length > 0) {
      this.layers = new Map(session.layers.map((l) => [l.id, { ...l }]));
      this.activeLayerId = session.activeLayerId || session.layers[0]!.id;
    }

    if (session.tracing && session.tracing.dataUrl) {
      const img = new Image();
      img.src = session.tracing.dataUrl;
      await new Promise((res) => {
        img.onload = res;
      });
      this.tracing = {
        img,
        x: session.tracing.x,
        y: session.tracing.y,
        worldWidth: session.tracing.worldWidth,
        opacity: session.tracing.opacity,
        visible: session.tracing.visible,
      };
    }

    this.markDocChanged();
    this.view.zoomToFit(this.doc.bounds());
    this.requestDraw();
    this.emit();
    this.showHint('Restored previous session from browser memory.', 4000);
  }

  private validation(): ValidationResult {
    if (this.validationCache?.version === this.docVersion) return this.validationCache.result;
    const result = validateGeometry(this.doc);
    this.validationCache = { version: this.docVersion, result };
    return result;
  }

  // ------------------------------------------------------------------ drawing

  private requestDraw(): void {
    if (this.frameHandle) return;
    this.frameHandle = requestAnimationFrame(() => {
      this.frameHandle = 0;
      this.render();
    });
  }

  private render(): void {
    if (!this.ctx) return;
    const scene: Scene = {
      ctx: this.ctx,
      view: this.view,
      doc: this.doc,
      units: this.units,
      gridSize: this.gridSize,
      pointer: this.pointer,
      selection: this.selection,
    };
    renderScene(scene, {
      tool: this.tool,
      toolState: this.toolState,
      selection: this.selection,
      hoverId: this.hoverId,
      snap: this.snap,
      tracing: this.tracing,
      calibration: this.calibration,
      validation: this.validation(),
      shapeMode: this.shapeMode,
      layers: this.layers,
    });
  }

  // ------------------------------------------------------------------ tool api

  private edit(mutate: () => boolean): void {
    const before = this.doc.snapshot();
    if (mutate()) {
      this.history.push(before);
      this.markDocChanged();
    }
    this.requestDraw();
    this.emit();
  }

  private setHoverEdge(id: number | null): void {
    if (this.hoverId === id) return;
    this.hoverId = id;
    this.requestDraw();
  }

  private setMeasurement(text: string | null): void {
    if (this.measurement === text) return;
    this.measurement = text;
    this.emit();
  }

  private setCursor(cursor: string): void {
    if (this.canvas) this.canvas.style.cursor = cursor;
  }

  showHint(message: string, durationMs = 5000): void {
    this.hintText = message;
    this.hintVisible = true;
    if (this.hintTimer) clearTimeout(this.hintTimer);
    this.hintTimer = null;
    if (durationMs > 0) {
      this.hintTimer = setTimeout(() => {
        this.hintVisible = false;
        this.emit();
      }, durationMs);
    }
    this.emit();
  }

  // --------------------------------------------------------------- attachment

  attach(canvas: HTMLCanvasElement): () => void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.setCursor(this.tool.cursor);

    const onMove = (e: MouseEvent) => this.handlePointerMove(e);
    const onDown = (e: MouseEvent) => this.handlePointerDown(e);
    const onUp = (e: MouseEvent) => this.handlePointerUp(e);
    const onDouble = (e: MouseEvent) => this.handleDoubleClick(e);
    const onWheel = (e: WheelEvent) => this.handleWheel(e);
    const onAux = (e: MouseEvent) => {
      if (e.button === 1) e.preventDefault();
    };
    const onKeyDown = (e: KeyboardEvent) => this.handleKeyDown(e);
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') this.spaceDown = false;
    };

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('dblclick', onDouble);
    canvas.addEventListener('auxclick', onAux);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mousedown', onDown);
      canvas.removeEventListener('dblclick', onDouble);
      canvas.removeEventListener('auxclick', onAux);
      canvas.removeEventListener('wheel', onWheel);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (this.frameHandle) cancelAnimationFrame(this.frameHandle);
      this.frameHandle = 0;
      this.canvas = null;
      this.ctx = null;
    };
  }

  resize(width: number, height: number): void {
    if (!this.canvas) return;
    this.canvas.width = width;
    this.canvas.height = height;
    this.view.resize(width, height);
    this.requestDraw();
  }

  // ------------------------------------------------------------------- input

  private canvasPoint(e: MouseEvent): Point {
    if (!this.canvas) return ORIGIN;
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  /** Recompute snapped/raw cursor positions and any typed-dimension override. */
  private updatePointer(e: MouseEvent, screen: Point): void {
    const rawWorld = this.view.toWorld(screen.x, screen.y);
    let world = rawWorld;
    let snap: Snap | null = null;

    if (!this.calibration.active && this.tool.snaps) {
      snap = findSnap(this.doc, this.view, rawWorld.x, rawWorld.y, {
        gridSize: this.gridSize,
        snapToGrid: this.snapToGrid,
      });
      world = { x: snap.x, y: snap.y };
      if (e.shiftKey) {
        const ref = this.tool.orthoRef?.(this.toolState);
        if (ref) world = applyOrtho(world, ref);
      }
    }

    this.snap = snap;
    this.dynCursor = world;
    const typed = this.resolveDyn();
    this.pointer = { world: typed ?? world, rawWorld, screen };
  }

  private input(e: MouseEvent): PointerInput {
    return {
      world: this.pointer.world,
      rawWorld: this.pointer.rawWorld,
      screen: this.pointer.screen,
      client: { x: e.clientX, y: e.clientY },
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
    };
  }

  private handlePointerMove(e: MouseEvent): void {
    const screen = this.canvasPoint(e);

    if (this.panning) {
      this.view.panX = this.panOrigin.x + (screen.x - this.panStart.x);
      this.view.panY = this.panOrigin.y + (screen.y - this.panStart.y);
      this.requestDraw();
      return;
    }

    if (this.imageDrag && this.tracing) {
      this.tracing.x =
        this.imageDrag.startPos.x + (screen.x - this.imageDrag.startScreen.x) / this.view.zoom;
      this.tracing.y =
        this.imageDrag.startPos.y - (screen.y - this.imageDrag.startScreen.y) / this.view.zoom;
      this.requestDraw();
      return;
    }

    this.updatePointer(e, screen);

    if (!this.calibration.active) {
      this.tool.onPointerMove?.(this.toolState, this.input(e), this.api);
      if (
        this.tool.id === 'select' &&
        this.tracing?.visible &&
        isOverImage(this.view, this.tracing, screen.x, screen.y)
      ) {
        this.setCursor('move');
      }
    }

    this.requestDraw();
    this.emit();
  }

  private handlePointerDown(e: MouseEvent): void {
    const screen = this.canvasPoint(e);

    if (e.button === 1 || this.spaceDown) {
      if (e.button === 1) e.preventDefault();
      this.panning = true;
      this.panStart = screen;
      this.panOrigin = { x: this.view.panX, y: this.view.panY };
      this.setCursor('grabbing');
      return;
    }
    if (e.button !== 0) return;

    this.updatePointer(e, screen);

    if (this.calibration.active) {
      this.handleCalibrationClick(screen);
      return;
    }

    if (
      this.tool.id === 'select' &&
      this.tracing?.visible &&
      isOverImage(this.view, this.tracing, screen.x, screen.y)
    ) {
      this.imageDrag = { startScreen: screen, startPos: { x: this.tracing.x, y: this.tracing.y } };
      return;
    }

    this.tool.onPointerDown?.(this.toolState, this.input(e), this.api);
    this.requestDraw();
    this.emit();
  }

  private handlePointerUp(e: MouseEvent): void {
    if (this.imageDrag) {
      this.imageDrag = null;
      this.emit();
    }
    if (this.panning) {
      this.panning = false;
      this.setCursor(this.tool.cursor);
    }
    this.tool.onPointerUp?.(this.toolState, this.input(e), this.api);
    this.requestDraw();
    this.emit();
  }

  private handleDoubleClick(e: MouseEvent): void {
    if (this.calibration.active) return;
    this.updatePointer(e, this.canvasPoint(e));
    this.tool.onDoubleClick?.(this.toolState, this.input(e), this.api);
    this.requestDraw();
    this.emit();
  }

  private handleWheel(e: WheelEvent): void {
    e.preventDefault();
    const screen = this.canvasPoint(e);
    this.view.zoomAt(screen.x, screen.y, e.deltaY < 0 ? 1.12 : 0.89);
    this.updatePointer(e, screen);
    this.requestDraw();
    this.emit();
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const target = e.target as HTMLElement | null;
    const inField = !!target?.closest?.('input, select, textarea');

    if (e.code === 'Space' && !inField) this.spaceDown = true;

    if (e.key === 'Escape') {
      if (this.calibration.active) {
        this.cancelCalibration();
        return;
      }
      this.tool.onEscape?.(this.toolState, this.api);
      this.closeDynInput();
      this.requestDraw();
      this.emit();
      return;
    }

    if (inField) return;

    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (this.tool.onDelete) {
        e.preventDefault();
        this.tool.onDelete(this.toolState, this.api);
      }
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      const key = e.key.toLowerCase();
      if (key === 'a') {
        e.preventDefault();
        this.selectAll();
      } else if (key === 'z') {
        e.preventDefault();
        this.undo();
      } else if (key === 'c') {
        e.preventDefault();
        this.copySelection();
      } else if (key === 'x') {
        e.preventDefault();
        this.cutSelection();
      } else if (key === 'v') {
        e.preventDefault();
        this.pasteClipboard();
      }
      return;
    }

    const toolId = SHORTCUTS[e.key.toLowerCase()];
    if (toolId) this.setTool(toolId);
  }

  // -------------------------------------------------------------- tool/units

  setTool(id: ToolId): void {
    if (id === this.toolId) return;
    this.tool.onEscape?.(this.toolState, this.api);
    this.toolId = id;
    this.tool = getTool(id);
    this.toolState = this.tool.createState();
    this.selection.clear();
    this.hoverId = null;
    this.measurement = null;
    this.closeDynInput();
    this.setCursor(this.tool.cursor);
    this.showHint(this.tool.hint);
    this.requestDraw();
    this.emit();
  }

  setUnits(units: Units): void {
    if (units === this.units) return;
    const f = unitFactor(this.units, units);
    this.doc.scaleAll(f);
    this.view.scaleBy(f);
    this.tool.scaleState?.(this.toolState, f);
    if (this.tracing) {
      this.tracing.x *= f;
      this.tracing.y *= f;
      this.tracing.worldWidth *= f;
    }
    if (this.calibration.p1) {
      this.calibration.p1 = { x: this.calibration.p1.x * f, y: this.calibration.p1.y * f };
    }
    if (this.calibration.p2) {
      this.calibration.p2 = { x: this.calibration.p2.x * f, y: this.calibration.p2.y * f };
    }
    this.gridSize = convertGridSize(this.gridSize, units);
    this.units = units;
    this.dynCursor = { x: this.dynCursor.x * f, y: this.dynCursor.y * f };
    this.markDocChanged();
    this.requestDraw();
    this.emit();
  }

  setGridSize(size: number): void {
    this.gridSize = size > 0 ? size : 0.1;
    this.requestDraw();
    this.emit();
  }

  setSnapToGrid(enabled: boolean): void {
    this.snapToGrid = enabled;
    this.requestDraw();
    this.emit();
  }

  setShapeMode(enabled: boolean): void {
    this.shapeMode = enabled;
    this.requestDraw();
    this.emit();
  }

  toggleShapeMode(): void {
    this.shapeMode = !this.shapeMode;
    this.requestDraw();
    this.emit();
  }

  // ----------------------------------------------------------------- editing

  selectAll(): void {
    this.selection.clear();
    for (const id of this.doc.edges.keys()) this.selection.add(id);
    this.requestDraw();
    this.emit();
  }

  deselectAll(): void {
    this.selection.clear();
    this.hoverId = null;
    this.requestDraw();
    this.emit();
  }

  copySelection(): void {
    if (this.selection.size === 0) return;
    const items: ClipboardItem[] = [];

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const id of this.selection) {
      const e = this.doc.edge(id);
      if (!e) continue;
      const [a, b] = this.doc.endpointsOf(e);
      minX = Math.min(minX, a.x, b.x);
      minY = Math.min(minY, a.y, b.y);
      maxX = Math.max(maxX, a.x, b.x);
      maxY = Math.max(maxY, a.y, b.y);
    }

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    for (const id of this.selection) {
      const e = this.doc.edge(id);
      if (!e) continue;
      const [a, b] = this.doc.endpointsOf(e);
      const item: ClipboardItem = {
        type: e.type,
        p1: { x: a.x - cx, y: a.y - cy },
        p2: { x: b.x - cx, y: b.y - cy },
        layerId: e.layerId,
      };
      if (e.type === 'arc') {
        item.cx = e.cx - cx;
        item.cy = e.cy - cy;
        item.r = e.r;
      }
      items.push(item);
    }

    this.clipboard = items;
    this.showHint(`Copied ${items.length} element(s) to clipboard.`, 3000);
  }

  cutSelection(): void {
    if (this.selection.size === 0) return;
    const count = this.selection.size;
    this.copySelection();
    this.history.push(this.doc.snapshot());
    for (const id of this.selection) {
      this.doc.removeEdge(id);
    }
    this.selection.clear();
    this.hoverId = null;
    this.markDocChanged();
    this.requestDraw();
    this.emit();
    this.showHint(`Cut ${count} element(s).`, 3000);
  }

  pasteClipboard(): void {
    if (this.clipboard.length === 0) return;
    this.history.push(this.doc.snapshot());

    const center = this.pointer.world || { x: 0, y: 0 };
    const groupId = this.doc.newGroupId();
    const newEdgeIds: number[] = [];

    for (const item of this.clipboard) {
      const p1x = center.x + item.p1.x;
      const p1y = center.y + item.p1.y;
      const p2x = center.x + item.p2.x;
      const p2y = center.y + item.p2.y;

      const v1 = this.doc.addVertex(p1x, p1y);
      const v2 = this.doc.addVertex(p2x, p2y);

      let edgeId: number | null = null;
      if (item.type === 'line') {
        edgeId = this.doc.addLineEdge(v1, v2, groupId, item.layerId || this.activeLayerId);
      } else if (item.type === 'arc' && item.cx !== undefined && item.cy !== undefined && item.r !== undefined) {
        const cx = center.x + item.cx;
        const cy = center.y + item.cy;
        edgeId = this.doc.addArcEdge(v1, v2, cx, cy, item.r, groupId, item.layerId || this.activeLayerId);
      }
      if (edgeId !== null) newEdgeIds.push(edgeId);
    }

    this.selection.clear();
    for (const id of newEdgeIds) {
      this.selection.add(id);
    }

    this.markDocChanged();
    this.requestDraw();
    this.emit();
    this.showHint(`Pasted ${newEdgeIds.length} element(s).`, 3000);
  }

  deleteSelection(): void {
    if (this.selection.size === 0) return;
    const count = this.selection.size;
    this.history.push(this.doc.snapshot());
    for (const id of this.selection) {
      this.doc.removeEdge(id);
    }
    this.selection.clear();
    this.hoverId = null;
    this.markDocChanged();
    this.requestDraw();
    this.emit();
    this.showHint(`Deleted ${count} element(s).`, 3000);
  }

  undo(): void {
    const snapshot = this.history.pop();
    if (!snapshot) return;
    this.doc.restore(snapshot);
    this.selection.clear();
    this.hoverId = null;
    this.toolState = this.tool.createState();
    this.closeDynInput();
    this.markDocChanged();
    this.requestDraw();
    this.emit();
  }

  clearAll(): void {
    if (this.doc.isEmpty && !this.tool.isDrawing?.(this.toolState)) return;
    this.history.push(this.doc.snapshot());
    this.doc.clear();
    this.selection.clear();
    this.hoverId = null;
    this.toolState = this.tool.createState();
    this.closeDynInput();
    this.markDocChanged();
    this.requestDraw();
    this.emit();
    this.showHint('Cleared canvas.', 2000);
  }

  rotateSelectionPrompt(): void {
    if (this.selection.size === 0) {
      this.showHint('Select elements to rotate first.', 3000);
      return;
    }
    const degStr = window.prompt('Enter rotation angle in degrees (e.g. 45 or -90):', '45');
    if (!degStr) return;
    const deg = parseFloat(degStr);
    if (isNaN(deg)) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const id of this.selection) {
      const e = this.doc.edge(id);
      if (!e) continue;
      const [a, b] = this.doc.endpointsOf(e);
      minX = Math.min(minX, a.x, b.x);
      minY = Math.min(minY, a.y, b.y);
      maxX = Math.max(maxX, a.x, b.x);
      maxY = Math.max(maxY, a.y, b.y);
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const rad = (deg * Math.PI) / 180;

    this.history.push(this.doc.snapshot());
    this.doc.rotateEdges(this.selection, cx, cy, rad);
    this.markDocChanged();
    this.requestDraw();
    this.emit();
    this.showHint(`Rotated ${this.selection.size} element(s) by ${deg}°.`, 3000);
  }

  scaleSelectionPrompt(): void {
    if (this.selection.size === 0) {
      this.showHint('Select elements to scale first.', 3000);
      return;
    }
    const scaleStr = window.prompt('Enter scale factor (e.g. 2.0 to double, 0.5 to halve):', '2.0');
    if (!scaleStr) return;
    const factor = parseFloat(scaleStr);
    if (isNaN(factor) || factor <= 0) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const id of this.selection) {
      const e = this.doc.edge(id);
      if (!e) continue;
      const [a, b] = this.doc.endpointsOf(e);
      minX = Math.min(minX, a.x, b.x);
      minY = Math.min(minY, a.y, b.y);
      maxX = Math.max(maxX, a.x, b.x);
      maxY = Math.max(maxY, a.y, b.y);
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    this.history.push(this.doc.snapshot());
    this.doc.scaleEdges(this.selection, cx, cy, factor);
    this.markDocChanged();
    this.requestDraw();
    this.emit();
    this.showHint(`Scaled ${this.selection.size} element(s) by ${factor}x.`, 3000);
  }

  flipHorizontalSelection(): void {
    if (this.selection.size === 0) return;
    this.history.push(this.doc.snapshot());
    this.doc.flipHorizontal(this.selection);
    this.markDocChanged();
    this.requestDraw();
    this.emit();
    this.showHint(`Flipped ${this.selection.size} element(s) horizontally.`, 3000);
  }

  flipVerticalSelection(): void {
    if (this.selection.size === 0) return;
    this.history.push(this.doc.snapshot());
    this.doc.flipVertical(this.selection);
    this.markDocChanged();
    this.requestDraw();
    this.emit();
    this.showHint(`Flipped ${this.selection.size} element(s) vertically.`, 3000);
  }

  explodeSelection(): void {
    if (this.selection.size === 0) return;
    this.history.push(this.doc.snapshot());
    const count = this.doc.explodeSelected(this.selection);
    this.markDocChanged();
    this.requestDraw();
    this.emit();
    this.showHint(`Exploded ${count} element group(s).`, 3000);
  }

  async exportDxf(): Promise<void> {
    if (this.shapeMode) {
      const result = this.validation();
      if (!result.valid) {
        window.alert(
          `Cannot export yet:\n\n${result.errs.map((e) => `  • ${e}`).join('\n')}\n\nFix the highlighted issues and try again.`,
        );
        return;
      }
    }
    await saveDxf(this.doc, this.units);
  }

  async importDxf(file: File): Promise<void> {
    const text = await file.text();
    await this.loadDxfText(text, file.name);
  }

  async loadDxfText(
    text: string,
    filename = 'drawing.dxf',
    sourceUnit?: Units,
    targetUnit?: Units,
  ): Promise<void> {
    const result = parseDxf(text);
    if (result.entities.length === 0) {
      window.alert('No supported geometry (LINE, CIRCLE, ARC, LWPOLYLINE) found in DXF file.');
      return;
    }

    addRecentFile({ name: filename, type: 'dxf', data: text });

    this.history.push(this.doc.snapshot());

    const fromUnit = sourceUnit || result.units || 'mm';
    const toUnit = targetUnit || this.units;
    const factor = unitFactor(fromUnit, toUnit);

    if (toUnit !== this.units) {
      this.setUnits(toUnit);
    }

    // Scale geometry entities if source unit != base workspace unit
    if (factor !== 1) {
      for (const ent of result.entities) {
        if (
          ent.type === 'line' &&
          ent.x1 !== undefined &&
          ent.y1 !== undefined &&
          ent.x2 !== undefined &&
          ent.y2 !== undefined
        ) {
          ent.x1 *= factor;
          ent.y1 *= factor;
          ent.x2 *= factor;
          ent.y2 *= factor;
        } else if (
          (ent.type === 'circle' || ent.type === 'arc') &&
          ent.cx !== undefined &&
          ent.cy !== undefined &&
          ent.r !== undefined
        ) {
          ent.cx *= factor;
          ent.cy *= factor;
          ent.r *= factor;
        } else if (ent.type === 'polyline' && ent.points) {
          for (const pt of ent.points) {
            pt.x *= factor;
            pt.y *= factor;
          }
        }
      }
    }

    // Populate DXF layers into layer store
    if (result.layers && result.layers.length > 0) {
      for (const dxfLayer of result.layers) {
        const hexColor = aciToHex(dxfLayer.colorIndex);
        this.layers.set(dxfLayer.name, {
          id: dxfLayer.name,
          name: dxfLayer.name,
          color: hexColor,
          dxfColorIndex: dxfLayer.colorIndex || 7,
          visible: !dxfLayer.isFrozen,
        });
      }
    }

    loadDxfIntoDoc(this.doc, result);

    this.selection.clear();
    this.hoverId = null;
    this.toolState = this.tool.createState();
    this.closeDynInput();
    this.view.zoomToFit(this.doc.bounds());
    this.markDocChanged();
    this.requestDraw();
    this.emit();
    this.showHint(`Opened DXF: imported ${result.entities.length} entities across ${this.layers.size} layers.`, 5000);
  }

  zoomToFit(): void {
    const bounds = this.doc.bounds();
    if (bounds) {
      this.view.zoomToFit(bounds);
      this.requestDraw();
      this.emit();
      this.showHint('Zoomed to fit drawing extent.', 2000);
    }
  }

  zoomIn(): void {
    const cx = this.view.width ? this.view.width / 2 : 0;
    const cy = this.view.height ? this.view.height / 2 : 0;
    this.view.zoomAt(cx, cy, 1.3);
    this.requestDraw();
    this.emit();
  }

  zoomOut(): void {
    const cx = this.view.width ? this.view.width / 2 : 0;
    const cy = this.view.height ? this.view.height / 2 : 0;
    this.view.zoomAt(cx, cy, 0.77);
    this.requestDraw();
    this.emit();
  }

  // ------------------------------------------------------------------- layers

  setActiveLayer(id: string): void {
    if (this.layers.has(id)) {
      this.activeLayerId = id;
      this.emit();
    }
  }

  addLayer(name: string, color = '#3b82f6'): void {
    const cleanName = name.trim();
    if (!cleanName || this.layers.has(cleanName)) return;
    const layer: Layer = {
      id: cleanName,
      name: cleanName,
      color,
      visible: true,
    };
    this.layers.set(cleanName, layer);
    this.activeLayerId = cleanName;
    this.requestDraw();
    this.emit();
  }

  toggleLayerVisibility(id: string): void {
    const layer = this.layers.get(id);
    if (!layer) return;
    layer.visible = !layer.visible;
    this.requestDraw();
    this.emit();
  }

  toggleLayerLock(id: string): void {
    const layer = this.layers.get(id);
    if (!layer) return;
    layer.locked = !layer.locked;
    this.requestDraw();
    this.emit();
  }

  showOnlyActiveLayer(): void {
    for (const layer of this.layers.values()) {
      layer.visible = layer.id === this.activeLayerId;
    }
    this.requestDraw();
    this.emit();
  }

  showAllLayers(): void {
    for (const layer of this.layers.values()) {
      layer.visible = true;
    }
    this.requestDraw();
    this.emit();
  }

  hideAllLayers(): void {
    for (const layer of this.layers.values()) {
      if (layer.id !== this.activeLayerId) {
        layer.visible = false;
      }
    }
    this.requestDraw();
    this.emit();
  }

  lockAllLayers(): void {
    for (const layer of this.layers.values()) {
      layer.locked = true;
    }
    this.requestDraw();
    this.emit();
  }

  unlockAllLayers(): void {
    for (const layer of this.layers.values()) {
      layer.locked = false;
    }
    this.requestDraw();
    this.emit();
  }

  deleteLayer(id: string): void {
    if (this.layers.size <= 1 || !this.layers.has(id)) return;

    this.history.push(this.doc.snapshot());
    this.layers.delete(id);

    const fallbackLayerId = Array.from(this.layers.keys())[0] || '0';
    if (this.activeLayerId === id) {
      this.activeLayerId = fallbackLayerId;
    }

    for (const e of this.doc.edges.values()) {
      if (e.layerId === id) {
        e.layerId = fallbackLayerId;
      }
    }

    this.markDocChanged();
    this.requestDraw();
    this.emit();
    this.showHint(`Deleted layer "${id}".`, 3000);
  }

  selectLayerEntities(id: string): void {
    this.selection.clear();
    for (const e of this.doc.edges.values()) {
      if (e.layerId === id) {
        this.selection.add(e.id);
      }
    }
    this.requestDraw();
    this.emit();
    this.showHint(`Selected ${this.selection.size} entity(ies) on layer "${id}".`, 3000);
  }

  deselectLayerEntities(id: string): void {
    for (const e of this.doc.edges.values()) {
      if (e.layerId === id) {
        this.selection.delete(e.id);
      }
    }
    this.requestDraw();
    this.emit();
  }

  setLayerColor(id: string, color: string): void {
    const layer = this.layers.get(id);
    if (!layer) return;
    layer.color = color;
    this.requestDraw();
    this.emit();
  }

  renameLayer(id: string, newName: string): void {
    const clean = newName.trim();
    if (!clean || clean === id || this.layers.has(clean)) return;
    const layer = this.layers.get(id);
    if (!layer) return;

    this.layers.delete(id);
    layer.id = clean;
    layer.name = clean;
    this.layers.set(clean, layer);

    if (this.activeLayerId === id) {
      this.activeLayerId = clean;
    }

    // Update layerId on all edges referencing old layer id
    for (const e of this.doc.edges.values()) {
      if (e.layerId === id) e.layerId = clean;
    }

    this.requestDraw();
    this.emit();
  }

  setSelectionLayer(layerId: string): void {
    if (!this.layers.has(layerId) || this.selection.size === 0) return;
    for (const edgeId of this.selection) {
      const e = this.doc.edges.get(edgeId);
      if (e) e.layerId = layerId;
    }
    this.requestDraw();
    this.emit();
  }

  // ------------------------------------------------------------------- image

  async importImage(file: File): Promise<void> {
    const img = await loadImageFile(file);
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    addRecentFile({ name: file.name, type: 'image', data: dataUrl });
    this.applyLoadedImage(img);
  }

  async loadRecentImage(dataUrl: string): Promise<void> {
    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve) => {
      img.onload = resolve;
    });
    this.applyLoadedImage(img);
  }

  private applyLoadedImage(img: HTMLImageElement): void {
    this.tracing = {
      img,
      x: 0,
      y: 0,
      worldWidth: this.units === 'mm' ? 254 : 10,
      opacity: 0.4,
      visible: true,
    };
    this.startCalibration();
    this.showHint(
      'Image loaded — click two points on it whose real distance you know, then enter that distance.',
      0,
    );
  }

  async loadRecentFile(entry: RecentFileEntry): Promise<void> {
    if (entry.type === 'dxf') {
      await this.loadDxfText(entry.data, entry.name);
    } else if (entry.type === 'image') {
      await this.loadRecentImage(entry.data);
    }
  }

  removeImage(): void {
    this.tracing = null;
    this.imageDrag = null;
    if (this.calibration.active) this.cancelCalibration();
    this.requestDraw();
    this.emit();
  }

  toggleImageVisible(): void {
    if (!this.tracing) return;
    this.tracing.visible = !this.tracing.visible;
    this.requestDraw();
    this.emit();
  }

  setImageOpacity(opacity: number): void {
    if (!this.tracing) return;
    this.tracing.opacity = opacity;
    this.requestDraw();
    this.emit();
  }

  setImageWorldWidth(width: number): void {
    if (!this.tracing) return;
    this.tracing.worldWidth = width > 0 ? width : 0.1;
    this.requestDraw();
    this.emit();
  }

  // ------------------------------------------------------------- calibration

  startCalibration(): void {
    this.calibration = { active: true, p1: null, p2: null };
    this.calibrationBox = null;
    this.setCursor('crosshair');
    this.showHint('Click the first point on the image for scale calibration.', 0);
    this.requestDraw();
    this.emit();
  }

  cancelCalibration(): void {
    this.calibration = idleCalibration();
    this.calibrationBox = null;
    this.setCursor(this.tool.cursor);
    this.hintVisible = false;
    this.requestDraw();
    this.emit();
  }

  private handleCalibrationClick(screen: Point): void {
    const world = this.view.toWorld(screen.x, screen.y);
    if (!this.calibration.p1) {
      this.calibration.p1 = world;
      this.showHint('Now click the second point.', 0);
    } else if (!this.calibration.p2) {
      this.calibration.p2 = world;
      const first = this.view.toScreen(this.calibration.p1.x, this.calibration.p1.y);
      this.calibrationBox = { x: (first.x + screen.x) / 2, y: (first.y + screen.y) / 2 };
      this.hintVisible = false;
    }
    this.requestDraw();
    this.emit();
  }

  /** Rescale everything so the two picked points are `distance` units apart. */
  applyCalibration(distance: number): boolean {
    const factor = calibrationFactor(this.calibration, distance);
    if (factor === null) return false;
    this.doc.scaleAll(factor);
    // Keep the drawing the same size on screen while its units change.
    this.view.zoom /= factor;
    if (this.tracing) {
      this.tracing.x *= factor;
      this.tracing.y *= factor;
      this.tracing.worldWidth *= factor;
    }
    this.cancelCalibration();
    this.markDocChanged();
    this.showHint(`Scale set: ${distance} ${this.units} between points.`, 4000);
    return true;
  }

  // --------------------------------------------------------- type-to-size box

  private openDynInput(anchor: Point): void {
    if (!this.tool.dyn) return;
    this.dynAnchor = anchor;
    this.dynValues = {};
    this.dynMode = this.tool.dyn.modes?.[0] ?? '';
    this.emit();
  }

  private closeDynInput(): void {
    if (!this.dynAnchor) return;
    this.dynAnchor = null;
    this.dynValues = {};
    this.emit();
  }

  private dynNumbers(): Record<string, number | null> {
    const out: Record<string, number | null> = {};
    for (const [key, raw] of Object.entries(this.dynValues)) {
      const n = parseMathExpression(raw);
      out[key] = n;
    }
    return out;
  }

  /** The end point implied by whatever is typed, or null when nothing usable is. */
  private resolveDyn(): Point | null {
    const dyn = this.tool.dyn;
    if (!dyn || !this.dynAnchor) return null;
    return dyn.resolve(this.toolState, this.dynNumbers(), this.dynMode, this.dynCursor);
  }

  private buildDynUi(): DynUi | null {
    const dyn = this.tool.dyn;
    if (!dyn || !this.dynAnchor) return null;
    return {
      anchor: this.dynAnchor,
      fields: dyn.fields(this.toolState).map((f) => ({
        key: f.key,
        label: f.label,
        placeholder: dyn.placeholder(this.toolState, f.key, this.dynMode, this.dynCursor, this.units),
        value: this.dynValues[f.key] ?? '',
      })),
      mode: dyn.modes ? this.dynMode : null,
      modeLabel: dyn.modeLabel ? dyn.modeLabel(this.dynMode) : null,
    };
  }

  setDynValue(key: string, raw: string): void {
    this.dynValues[key] = raw;
    const typed = this.resolveDyn();
    this.pointer = { ...this.pointer, world: typed ?? this.dynCursor };
    this.requestDraw();
    this.emit();
  }

  cycleDynMode(): void {
    const modes = this.tool.dyn?.modes;
    if (!modes?.length) return;
    const i = modes.indexOf(this.dynMode);
    this.dynMode = modes[(i + 1) % modes.length]!;
    const typed = this.resolveDyn();
    this.pointer = { ...this.pointer, world: typed ?? this.dynCursor };
    this.requestDraw();
    this.emit();
  }

  /** Enter in the dyn box: finish the shape at the typed size. */
  commitDyn(): void {
    const dyn = this.tool.dyn;
    if (!dyn || !this.dynAnchor) return;
    const point = this.resolveDyn();
    // Nothing usable typed — let a click place the shape instead.
    if (!point) return;
    dyn.commit(this.toolState, point, this.api);
    this.requestDraw();
    this.emit();
  }

  cancelDyn(): void {
    this.tool.onEscape?.(this.toolState, this.api);
    this.closeDynInput();
    this.requestDraw();
    this.emit();
  }
}
