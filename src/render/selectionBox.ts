import type { BBox, Point } from '../core/types';
import type { Viewport } from '../viewport/Viewport';

/** Gap in pixels between the selected geometry and the selection net. */
export const SELECTION_PAD_PX = 8;
/** Drawn size of a corner grab handle, in pixels. */
export const CORNER_PX = 8;
/** Click tolerance around a corner grab handle, in pixels. */
export const CORNER_HIT_PX = 9;

/** Grow a world bbox by a pixel margin so the net clears the geometry at any zoom. */
export function paddedBounds(view: Viewport, b: BBox, padPx = SELECTION_PAD_PX): BBox {
  const p = view.pxToWorld(padPx);
  return { x1: b.x1 - p, y1: b.y1 - p, x2: b.x2 + p, y2: b.y2 + p };
}

/**
 * Corners in world space, ordered so the opposite corner of `i` is `(i + 2) % 4`.
 * That pairing is what anchors a corner drag to the far corner.
 */
export function cornerPoints(b: BBox): Point[] {
  return [
    { x: b.x1, y: b.y1 },
    { x: b.x2, y: b.y1 },
    { x: b.x2, y: b.y2 },
    { x: b.x1, y: b.y2 },
  ];
}

export function oppositeCorner(b: BBox, index: number): Point {
  return cornerPoints(b)[(index + 2) % 4];
}

/** Index of the corner handle under a screen point, or null when the cursor is clear of all four. */
export function hitCorner(
  view: Viewport,
  b: BBox,
  screen: Point,
  hitPx = CORNER_HIT_PX,
): number | null {
  const corners = cornerPoints(b);
  for (let i = 0; i < corners.length; i++) {
    const s = view.toScreen(corners[i].x, corners[i].y);
    if (Math.abs(s.x - screen.x) <= hitPx && Math.abs(s.y - screen.y) <= hitPx) return i;
  }
  return null;
}

/** Diagonal resize cursor matching a corner: 0/2 run one way, 1/3 the other. */
export function cornerCursor(index: number): string {
  return index % 2 === 0 ? 'nwse-resize' : 'nesw-resize';
}
