import type { Viewport } from '../viewport/Viewport';
import type { TracingImage } from './TracingImage';

export interface ScreenRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Where the tracing image lands on screen at the current pan and zoom. */
export function imageScreenRect(view: Viewport, t: TracingImage): ScreenRect {
  const centre = view.toScreen(t.x, t.y);
  const w = t.worldWidth * view.zoom;
  const h = w * (t.img.naturalHeight / t.img.naturalWidth);
  return { x: centre.x - w / 2, y: centre.y - h / 2, w, h };
}
