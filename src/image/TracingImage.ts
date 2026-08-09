import type { Viewport } from '../viewport/Viewport';

/** A reference photo/screenshot placed under the drawing to trace over. */
export interface TracingImage {
  img: HTMLImageElement;
  /** World coordinates of the image centre. */
  x: number;
  y: number;
  /** How wide the image is in world units; height follows the aspect ratio. */
  worldWidth: number;
  opacity: number;
  visible: boolean;
}

export interface ScreenRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function imageScreenRect(view: Viewport, t: TracingImage): ScreenRect {
  const centre = view.toScreen(t.x, t.y);
  const w = t.worldWidth * view.zoom;
  const h = w * (t.img.naturalHeight / t.img.naturalWidth);
  return { x: centre.x - w / 2, y: centre.y - h / 2, w, h };
}

export function isOverImage(view: Viewport, t: TracingImage, sx: number, sy: number): boolean {
  const r = imageScreenRect(view, t);
  return sx >= r.x && sx <= r.x + r.w && sy >= r.y && sy <= r.y + r.h;
}
