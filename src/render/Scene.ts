import type { Point, Units, GridMode } from '../core/types';
import type { Doc } from '../model/Doc';
import type { Viewport } from '../viewport/Viewport';
import { CANVAS } from './palette';

/** Everything a render module needs. Passed to each drawing function. */
export interface Scene {
  ctx: CanvasRenderingContext2D;
  view: Viewport;
  doc: Doc;
  units: Units;
  gridSize: number;
  gridMode?: GridMode;
  pointer: {
    /** Snapped world position (equal to `rawWorld` for non-snapping tools). */
    world: Point;
    /** Unsnapped world position. */
    rawWorld: Point;
    /** Canvas-relative pixel position. */
    screen: Point;
  };
  selection?: ReadonlySet<number>;
}

/** Draw a text label with a translucent backdrop so it stays legible over geometry. */
export function labelWithBackdrop(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  padX = 3,
  halfHeight = 8,
): void {
  const tw = ctx.measureText(text).width;
  ctx.fillStyle = CANVAS.labelBackdrop;
  ctx.fillRect(x - tw / 2 - padX, y - halfHeight, tw + padX * 2, halfHeight * 2);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}
