import { CANVAS } from '../palette';

/** Solid arrowhead pointing along Y. `dir` is +1 for down, -1 for up. */
export function arrowV(ctx: CanvasRenderingContext2D, x: number, y: number, dir: number): void {
  ctx.save();
  ctx.fillStyle = CANVAS.dimLine;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - 3, y + dir * 7);
  ctx.lineTo(x + 3, y + dir * 7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
