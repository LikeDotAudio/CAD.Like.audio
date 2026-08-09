import { EPS, TAU } from '../core/constants';
import type { Point } from '../core/types';
import { sampleSpline } from '../geometry/spline';
import type { Doc } from './Doc';

/**
 * Shape constructors. Each returns true when it actually changed the drawing,
 * so callers can decide whether the operation is worth an undo entry.
 * Every one of them re-planarises the graph before returning.
 */

export function commitLine(doc: Doc, x1: number, y1: number, x2: number, y2: number): boolean {
  if (Math.hypot(x2 - x1, y2 - y1) < EPS) return false;
  const g = doc.newGroupId();
  doc.addLineEdge(doc.addVertex(x1, y1), doc.addVertex(x2, y2), g);
  doc.resolveAllIntersections();
  return true;
}

export function commitRect(doc: Doc, x1: number, y1: number, x2: number, y2: number): boolean {
  const lx = Math.min(x1, x2);
  const ly = Math.min(y1, y2);
  const hx = Math.max(x1, x2);
  const hy = Math.max(y1, y2);
  if (hx - lx < EPS && hy - ly < EPS) return false;
  const g = doc.newGroupId();
  const a = doc.addVertex(lx, ly);
  const b = doc.addVertex(hx, ly);
  const c = doc.addVertex(hx, hy);
  const d = doc.addVertex(lx, hy);
  doc.addLineEdge(a, b, g);
  doc.addLineEdge(b, c, g);
  doc.addLineEdge(c, d, g);
  doc.addLineEdge(d, a, g);
  doc.resolveAllIntersections();
  return true;
}

/**
 * A circle is stored as two half-arcs sharing the leftmost and rightmost
 * points. Keeping it as true arcs is what lets a cut circle stay curved, and
 * the recorded primitive lets an untouched one export as a DXF CIRCLE.
 */
export function commitCircle(doc: Doc, cx: number, cy: number, r: number): boolean {
  if (r < EPS) return false;
  const g = doc.newGroupId();
  const vRight = doc.addVertex(cx + r, cy);
  const vLeft = doc.addVertex(cx - r, cy);
  doc.addArcEdge(vRight, vLeft, cx, cy, r, g); // top half, CCW
  doc.addArcEdge(vLeft, vRight, cx, cy, r, g); // bottom half, CCW
  doc.groupPrimitives.set(g, { type: 'circle', cx, cy, r });
  doc.groupIntact.add(g);
  doc.resolveAllIntersections();
  return true;
}

/** Ellipses have no true-arc representation here, so they are flattened. */
export function commitEllipse(
  doc: Doc,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  segments = 96,
): boolean {
  if (rx < EPS && ry < EPS) return false;
  const g = doc.newGroupId();
  const vs: number[] = [];
  for (let i = 0; i < segments; i++) {
    const a = (TAU * i) / segments;
    vs.push(doc.addVertex(cx + rx * Math.cos(a), cy + ry * Math.sin(a)));
  }
  for (let i = 0; i < segments; i++) doc.addLineEdge(vs[i]!, vs[(i + 1) % segments]!, g);
  doc.resolveAllIntersections();
  return true;
}

export function commitPolyline(doc: Doc, pts: Point[], closed: boolean): boolean {
  if (pts.length < 2) return false;
  const g = doc.newGroupId();
  const vs = pts.map((p) => doc.addVertex(p.x, p.y));
  for (let i = 0; i < vs.length - 1; i++) doc.addLineEdge(vs[i]!, vs[i + 1]!, g);
  if (closed) doc.addLineEdge(vs[vs.length - 1]!, vs[0]!, g);
  doc.resolveAllIntersections();
  return true;
}

export function commitSpline(doc: Doc, pts: Point[], closed: boolean, samples = 24): boolean {
  if (pts.length < 2) return false;
  return commitPolyline(doc, sampleSpline(pts, closed, samples), closed);
}
