import { MAX_ZOOM, MIN_ZOOM, clamp } from '../core/constants';
import type { Point } from '../core/types';

/**
 * World ↔ screen mapping. World Y points up (CAD convention), screen Y points
 * down, so the transform flips Y.
 */
export class Viewport {
  /** Screen pixels per world unit. */
  zoom = 80;
  panX = 0;
  panY = 0;
  width = 0;
  height = 0;

  toScreen(wx: number, wy: number): Point {
    return { x: wx * this.zoom + this.panX, y: -wy * this.zoom + this.panY };
  }

  toWorld(sx: number, sy: number): Point {
    return { x: (sx - this.panX) / this.zoom, y: -(sy - this.panY) / this.zoom };
  }

  /** Zoom about a screen point, keeping the world point under it fixed. */
  zoomAt(sx: number, sy: number, factor: number): void {
    const wx = (sx - this.panX) / this.zoom;
    const wy = -(sy - this.panY) / this.zoom;
    this.zoom = clamp(this.zoom * factor, MIN_ZOOM, MAX_ZOOM);
    this.panX = sx - wx * this.zoom;
    this.panY = sy + wy * this.zoom;
  }

  /** Rescale the view when the drawing itself is rescaled (unit switch). */
  scaleBy(f: number): void {
    this.zoom = clamp(this.zoom / f, MIN_ZOOM, MAX_ZOOM);
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    if (!this.panX && !this.panY) {
      this.panX = width / 2;
      this.panY = height / 2;
    }
  }

  /** Convert a screen-pixel distance to world units at the current zoom. */
  pxToWorld(px: number): number {
    return px / this.zoom;
  }
}
