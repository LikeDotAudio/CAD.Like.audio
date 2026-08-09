import type { Layer, Point, ToolId, Units, GridMode, ValidationResult } from '../core/types';

export interface DynFieldUi {
  key: string;
  label: string;
  placeholder: string;
  value: string;
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
  gridMode: GridMode;
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
  selectionProtected: boolean;
}
