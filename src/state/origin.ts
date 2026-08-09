import type { Point } from '../core/types';

/** World origin, reused so pointer state never allocates a fresh zero point. */
export const ORIGIN: Point = { x: 0, y: 0 };
