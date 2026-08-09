import { TAU } from '../core/constants';
import type { Edge, Layer } from '../core/types';
import type { Scene } from './Scene';
import { CANVAS, FONT } from './palette';
import { CORNER_PX, cornerPoints, paddedBounds } from './selectionBox';

/** Stroke a single edge. Arcs are drawn as real canvas arcs, never tessellated. */
export function renderEdge(scene: Scene, e: Edge, stroke: string, lineWidth: number): void {
  const { ctx, doc, view } = scene;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash([]);

  const [a, b] = doc.endpointsOf(e);
  if (e.type === 'line') {
    const sa = view.toScreen(a.x, a.y);
    const sb = view.toScreen(b.x, b.y);
    ctx.beginPath();
    ctx.moveTo(sa.x, sa.y);
    ctx.lineTo(sb.x, sb.y);
    ctx.stroke();
    return;
  }

  const a1 = Math.atan2(a.y - e.cy, a.x - e.cx);
  const a2 = Math.atan2(b.y - e.cy, b.x - e.cx);
  const sc = view.toScreen(e.cx, e.cy);
  // Screen Y is flipped, so a world-CCW arc is drawn clockwise-negated here.
  ctx.beginPath();
  ctx.arc(sc.x, sc.y, e.r * view.zoom, -a1, -a2, true);
  ctx.stroke();
}

export interface EdgeStyleState {
  selected: ReadonlySet<number>;
  hoverId: number | null;
  hoverEnabled: boolean;
  layers?: ReadonlyMap<string, Layer>;
}

function isDarkColor(color?: string): boolean {
  if (!color) return true;
  const hex = color.toLowerCase().replace('#', '');
  if (hex === '000000' || hex === '000' || hex === '1a1a1a' || hex === '1e293b' || hex === '15181b') return true;
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    if (r + g + b < 60) return true;
  }
  return false;
}

export function drawEdges(scene: Scene, state: EdgeStyleState): void {
  const { ctx, doc, view } = scene;
  const selectedEndpoints: Array<{ x: number; y: number }> = [];
  const selectedIds: number[] = [];

  for (const e of doc.edges.values()) {
    const layer = state.layers?.get(e.layerId ?? '0');
    // Hide edge if its assigned layer is hidden
    if (layer && !layer.visible) continue;

    const baseColor = isDarkColor(layer?.color) ? CANVAS.edge : layer!.color;
    const isSelected = state.selected.has(e.id);

    if (isSelected) {
      renderEdge(scene, e, CANVAS.edgeSelected, 2.8);
      selectedIds.push(e.id);

      // Collect endpoints and midpoints for selected element handles
      const [a, b] = doc.endpointsOf(e);
      selectedEndpoints.push(view.toScreen(a.x, a.y), view.toScreen(b.x, b.y));

      const mid = doc.edgeMidpoint(e);
      selectedEndpoints.push(view.toScreen(mid.x, mid.y));
    } else if (state.hoverEnabled && e.id === state.hoverId) {
      renderEdge(scene, e, CANVAS.edgeHover, 2.2);
    } else {
      renderEdge(scene, e, baseColor, 1.5);
    }
  }

  // 1. Orange square handles on every endpoint and midpoint of the selection
  if (selectedEndpoints.length > 0) {
    ctx.save();
    ctx.fillStyle = CANVAS.handle;
    ctx.strokeStyle = CANVAS.white;
    ctx.lineWidth = 1;
    const handleSize = 7;
    for (const p of selectedEndpoints) {
      ctx.beginPath();
      ctx.rect(
        Math.round(p.x) - handleSize / 2,
        Math.round(p.y) - handleSize / 2,
        handleSize,
        handleSize,
      );
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  // 2. Selection net plus its four grabbable corners, once 2+ elements are selected
  const bounds = state.selected.size > 1 ? doc.boundsOf(selectedIds) : null;
  if (bounds) {
    const b = paddedBounds(view, bounds);
    const tl = view.toScreen(b.x1, b.y2);
    const br = view.toScreen(b.x2, b.y1);

    ctx.save();
    ctx.strokeStyle = CANVAS.selectionNet;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
    ctx.setLineDash([]);

    ctx.fillStyle = CANVAS.handle;
    ctx.strokeStyle = CANVAS.white;
    ctx.lineWidth = 1.2;
    for (const c of cornerPoints(b)) {
      const s = view.toScreen(c.x, c.y);
      ctx.beginPath();
      ctx.rect(
        Math.round(s.x) - CORNER_PX / 2,
        Math.round(s.y) - CORNER_PX / 2,
        CORNER_PX,
        CORNER_PX,
      );
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
}

/**
 * Flag vertices that make the drawing uncuttable: degree 1 is a loose end,
 * degree 3+ is a crossing. Degree 0 and 2 are healthy and stay unmarked.
 */
export function drawBadVertexMarkers({ ctx, doc, view }: Scene): void {
  for (const v of doc.vertices.values()) {
    const deg = doc.vertexDegree(v.id);
    if (deg === 0 || deg === 2) continue;

    const s = view.toScreen(v.x, v.y);
    const isLooseEnd = deg === 1;
    ctx.save();
    ctx.fillStyle = isLooseEnd ? CANVAS.danger : CANVAS.warning;
    ctx.strokeStyle = CANVAS.white;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(s.x, s.y, isLooseEnd ? 6 : 7, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = CANVAS.white;
    ctx.font = FONT.marker;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isLooseEnd ? '!' : String(deg), s.x, s.y);
    ctx.restore();
  }
}
