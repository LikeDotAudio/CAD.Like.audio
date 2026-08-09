import type { Scene } from './Scene';
import { CANVAS } from './palette';

/** Background, grid lines, and the world axes. */
export function drawGrid({ ctx, view, gridSize }: Scene): void {
  const { width: W, height: H } = view;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = CANVAS.background;
  ctx.fillRect(0, 0, W, H);

  const step = gridSize * view.zoom;
  // Below ~5px the grid is visual noise, so it fades out entirely.
  if (step >= 5) {
    ctx.strokeStyle = CANVAS.grid;
    ctx.lineWidth = 1;
    const ox = ((view.panX % step) + step) % step;
    const oy = ((view.panY % step) + step) % step;
    ctx.beginPath();
    for (let x = ox; x < W; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
    }
    for (let y = oy; y < H; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
    }
    ctx.stroke();
  }

  ctx.strokeStyle = CANVAS.axis;
  ctx.lineWidth = 1;
  const origin = view.toScreen(0, 0);
  ctx.beginPath();
  ctx.moveTo(origin.x, 0);
  ctx.lineTo(origin.x, H);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, origin.y);
  ctx.lineTo(W, origin.y);
  ctx.stroke();
}
