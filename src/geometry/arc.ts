import { TAU, clamp01 } from '../core/constants';
import type { BBox, Point } from '../core/types';

/**
 * A resolved arc: centre, radius and the CCW span from `a1` to `a2`.
 * `sweep` is always positive — arcs in this model only ever run CCW.
 */
export interface ArcGeom {
  cx: number;
  cy: number;
  r: number;
  a1: number;
  a2: number;
  sweep: number;
}

/** Build an ArcGeom from a centre/radius and the two endpoints on it. */
export function arcGeom(cx: number, cy: number, r: number, from: Point, to: Point): ArcGeom {
  const a1 = Math.atan2(from.y - cy, from.x - cx);
  const a2 = Math.atan2(to.y - cy, to.x - cx);
  let sweep = a2 - a1;
  while (sweep <= 1e-12) sweep += TAU;
  return { cx, cy, r, a1, a2, sweep };
}

export function arcPointAt(g: ArcGeom, s: number): Point {
  const a = g.a1 + g.sweep * s;
  return { x: g.cx + g.r * Math.cos(a), y: g.cy + g.r * Math.sin(a) };
}

export function arcMidpoint(g: ArcGeom): Point {
  return arcPointAt(g, 0.5);
}

/**
 * Parametric position (0..1) of a point that lies on the arc's circle, or
 * null when the point falls outside the swept span.
 */
export function arcParamFor(g: ArcGeom, px: number, py: number): number | null {
  const ang = Math.atan2(py - g.cy, px - g.cx);
  let d = ang - g.a1;
  while (d < -1e-9) d += TAU;
  while (d >= TAU - 1e-9) d -= TAU;
  if (d < -1e-9 || d > g.sweep + 1e-9) return null;
  return clamp01(d / g.sweep);
}

/** True bounding box, including any axis extremes the sweep passes through. */
export function arcBBox(g: ArcGeom, from: Point, to: Point): BBox {
  let x1 = Math.min(from.x, to.x);
  let y1 = Math.min(from.y, to.y);
  let x2 = Math.max(from.x, to.x);
  let y2 = Math.max(from.y, to.y);
  for (const c of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
    let d = c - g.a1;
    while (d < 0) d += TAU;
    while (d >= TAU) d -= TAU;
    if (d <= g.sweep) {
      const px = g.cx + g.r * Math.cos(c);
      const py = g.cy + g.r * Math.sin(c);
      if (px < x1) x1 = px;
      if (py < y1) y1 = py;
      if (px > x2) x2 = px;
      if (py > y2) y2 = py;
    }
  }
  return { x1, y1, x2, y2 };
}

/** Distance from a point to the arc (radially inside the sweep, else to an endpoint). */
export function arcDistance(g: ArcGeom, from: Point, to: Point, px: number, py: number): number {
  const d = Math.hypot(px - g.cx, py - g.cy);
  const ang = Math.atan2(py - g.cy, px - g.cx);
  let delta = ang - g.a1;
  while (delta < 0) delta += TAU;
  while (delta >= TAU) delta -= TAU;
  if (delta <= g.sweep) return Math.abs(d - g.r);
  return Math.min(Math.hypot(px - from.x, py - from.y), Math.hypot(px - to.x, py - to.y));
}

/** Flatten an arc into a polyline, excluding the final point. */
export function arcToPolyline(
  cx: number,
  cy: number,
  r: number,
  aFrom: number,
  sweep: number,
  maxStep = Math.PI / 8,
): Point[] {
  const steps = Math.max(6, Math.ceil(Math.abs(sweep) / maxStep));
  const out: Point[] = [];
  for (let j = 1; j < steps; j++) {
    const a = aFrom + sweep * (j / steps);
    out.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return out;
}
