/** Shared domain types for the drawing board. */

export type Units = 'in' | 'mm';

export interface Point {
  x: number;
  y: number;
}

export interface Vertex extends Point {
  id: number;
}

export interface BBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Layer {
  id: string;
  name: string;
  color: string; // Hex color e.g. '#3b82f6'
  dxfColorIndex?: number; // AutoCAD Color Index (ACI 1-255)
  visible: boolean;
}

interface EdgeBase {
  id: number;
  /** Start vertex id. */
  v1: number;
  /** End vertex id. */
  v2: number;
  /** Id of the drawing operation that produced this edge (0 = none). */
  groupId: number;
  /** Layer identifier (defaults to '0'). */
  layerId: string;
}

export interface LineEdge extends EdgeBase {
  type: 'line';
}

/** An arc always runs counter-clockwise from `v1` to `v2` about (cx, cy). */
export interface ArcEdge extends EdgeBase {
  type: 'arc';
  cx: number;
  cy: number;
  r: number;
}

export type Edge = LineEdge | ArcEdge;

/**
 * A group's original construction primitive, kept so that shapes which are
 * still untouched can be exported losslessly (a circle stays a DXF CIRCLE
 * rather than two ARCs).
 */
export interface CirclePrimitive {
  type: 'circle';
  cx: number;
  cy: number;
  r: number;
}

export type GroupPrimitive = CirclePrimitive;

export type ToolId =
  | 'select'
  | 'line'
  | 'parallel'
  | 'lineAngle'
  | 'lineOrthogonal'
  | 'rotate'
  | 'polyline'
  | 'spline'
  | 'rect'
  | 'circle'
  | 'circle2p'
  | 'circle3p'
  | 'tangent'
  | 'ellipse'
  | 'break'
  | 'measure';

export interface ValidationResult {
  valid: boolean;
  errs: string[];
}
