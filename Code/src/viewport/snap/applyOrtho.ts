import type { Point } from '../../core/types';

/** Constrain a point to the horizontal or vertical axis through `ref`. */
export function applyOrtho(point: Point, ref: Point): Point {
  const dx = point.x - ref.x;
  const dy = point.y - ref.y;
  return Math.abs(dx) >= Math.abs(dy) ? { x: point.x, y: ref.y } : { x: ref.x, y: point.y };
}
