import type { Point, Units, GridMode } from '../core/types';
import type { Doc } from '../model/Doc';
import type { Viewport } from '../viewport/Viewport';

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
