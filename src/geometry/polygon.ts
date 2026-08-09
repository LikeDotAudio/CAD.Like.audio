import type { BBox, Point } from '../core/types';

/** Even-odd ray cast. */
export function pointInPolygon(px: number, py: number, poly: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]!;
    const b = poly[j]!;
    if (a.y > py !== b.y > py && px < ((b.x - a.x) * (py - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

export function polyBBox(poly: Point[]): BBox {
  let x1 = Infinity;
  let y1 = Infinity;
  let x2 = -Infinity;
  let y2 = -Infinity;
  for (const p of poly) {
    if (p.x < x1) x1 = p.x;
    if (p.y < y1) y1 = p.y;
    if (p.x > x2) x2 = p.x;
    if (p.y > y2) y2 = p.y;
  }
  return { x1, y1, x2, y2 };
}

/** True when `inner`'s box sits entirely within `outer`'s (a cheap containment reject). */
export function bboxContains(outer: BBox, inner: BBox, eps = 1e-9): boolean {
  return (
    inner.x1 >= outer.x1 - eps &&
    inner.y1 >= outer.y1 - eps &&
    inner.x2 <= outer.x2 + eps &&
    inner.y2 <= outer.y2 + eps
  );
}

export function unionBBox(a: BBox, b: BBox): BBox {
  return {
    x1: Math.min(a.x1, b.x1),
    y1: Math.min(a.y1, b.y1),
    x2: Math.max(a.x2, b.x2),
    y2: Math.max(a.y2, b.y2),
  };
}
