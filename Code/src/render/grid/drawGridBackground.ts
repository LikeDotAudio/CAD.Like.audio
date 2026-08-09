import { CANVAS } from '../palette';
import type { Scene } from '../Scene';

/** Wipe the canvas and lay down the paper colour. Runs before anything else. */
export function drawGridBackground({ ctx, view }: Scene): void {
  ctx.clearRect(0, 0, view.width, view.height);
  ctx.fillStyle = CANVAS.background;
  ctx.fillRect(0, 0, view.width, view.height);
}
