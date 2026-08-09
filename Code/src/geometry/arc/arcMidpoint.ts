import type { Point } from '../../core/types';
import type { ArcGeom } from './arcGeom';
import { arcPointAt } from './arcPointAt';

/** Point halfway along the sweep — the arc's snap midpoint. */
export function arcMidpoint(g: ArcGeom): Point {
  return arcPointAt(g, 0.5);
}
