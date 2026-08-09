import type { BBox, Point } from '../../core/types';
import { cornerPoints } from './cornerPoints';

/** The corner diagonally across the box — the anchor a corner drag scales about. */
export function oppositeCorner(b: BBox, index: number): Point {
  return cornerPoints(b)[(index + 2) % 4];
}
