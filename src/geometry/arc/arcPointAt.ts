import type { Point } from '../../core/types';
import type { ArcGeom } from './arcGeom';

/** Point at parametric position `s` (0 at the start of the sweep, 1 at the end). */
export function arcPointAt(g: ArcGeom, s: number): Point {
  const a = g.a1 + g.sweep * s;
  return { x: g.cx + g.r * Math.cos(a), y: g.cy + g.r * Math.sin(a) };
}
