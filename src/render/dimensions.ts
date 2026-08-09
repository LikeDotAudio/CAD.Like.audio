import { TAU } from '../core/constants';
import { formatLength } from '../model/units';
import { labelWithBackdrop, type Scene } from './Scene';
import { CANVAS, FONT } from './palette';

/**
 * Live dimension annotations drawn beside the shape being sketched. All
 * coordinates here are screen pixels — callers convert first.
 */

function arrowH(ctx: CanvasRenderingContext2D, x: number, y: number, dir: number): void {
  ctx.save();
  ctx.fillStyle = CANVAS.dimLine;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + dir * 7, y - 3);
  ctx.lineTo(x + dir * 7, y + 3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function arrowV(ctx: CanvasRenderingContext2D, x: number, y: number, dir: number): void {
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

/** Horizontal dimension between two screen X positions on baseline `sy`. */
export function dimH(
  ctx: CanvasRenderingContext2D,
  sx1: number,
  sy: number,
  sx2: number,
  label: string,
  above = true,
): void {
  if (Math.abs(sx2 - sx1) < 12) return;
  const y = sy + (above ? -20 : 20);
  ctx.save();
  ctx.strokeStyle = CANVAS.dimLine;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(sx1, sy);
  ctx.lineTo(sx1, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(sx2, sy);
  ctx.lineTo(sx2, y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(sx1, y);
  ctx.lineTo(sx2, y);
  ctx.stroke();
  arrowH(ctx, sx1, y, 1);
  arrowH(ctx, sx2, y, -1);
  ctx.font = FONT.dimension;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  labelWithBackdrop(ctx, label, (sx1 + sx2) / 2, y, CANVAS.dimText);
  ctx.restore();
}

/** Vertical dimension between two screen Y positions, offset right of `sx`. */
export function dimV(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy1: number,
  sy2: number,
  label: string,
): void {
  if (Math.abs(sy2 - sy1) < 12) return;
  const x = sx + 24;
  ctx.save();
  ctx.strokeStyle = CANVAS.dimLine;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(sx, sy1);
  ctx.lineTo(x, sy1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(sx, sy2);
  ctx.lineTo(x, sy2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(x, sy1);
  ctx.lineTo(x, sy2);
  ctx.stroke();
  arrowV(ctx, x, sy1, 1);
  arrowV(ctx, x, sy2, -1);

  ctx.save();
  ctx.translate(x + 14, (sy1 + sy2) / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.font = FONT.dimension;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  labelWithBackdrop(ctx, label, 0, 0, CANVAS.dimText);
  ctx.restore();
  ctx.restore();
}

/** Dimension parallel to an arbitrary segment, offset along its normal. */
export function dimDiag(
  ctx: CanvasRenderingContext2D,
  sx1: number,
  sy1: number,
  sx2: number,
  sy2: number,
  label: string,
): void {
  const len = Math.hypot(sx2 - sx1, sy2 - sy1);
  if (len < 12) return;
  const nx = (-(sy2 - sy1) / len) * 22;
  const ny = ((sx2 - sx1) / len) * 22;
  ctx.save();
  ctx.strokeStyle = CANVAS.dimLine;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(sx1, sy1);
  ctx.lineTo(sx1 + nx, sy1 + ny);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(sx2, sy2);
  ctx.lineTo(sx2 + nx, sy2 + ny);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(sx1 + nx, sy1 + ny);
  ctx.lineTo(sx2 + nx, sy2 + ny);
  ctx.stroke();
  ctx.font = FONT.dimension;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  labelWithBackdrop(ctx, label, (sx1 + sx2) / 2 + nx, (sy1 + sy2) / 2 + ny, CANVAS.dimText);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// World-space wrappers — these pick the right dimension style for the shape.
// ---------------------------------------------------------------------------

export function annotateSegment(
  scene: Scene,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): void {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 1e-6) return;
  const { ctx, view, units } = scene;
  const sa = view.toScreen(x1, y1);
  const sb = view.toScreen(x2, y2);
  const label = formatLength(len, units);
  const isHorizontal = Math.abs(y2 - y1) < 0.001 * len;
  const isVertical = Math.abs(x2 - x1) < 0.001 * len;
  if (isHorizontal) dimH(ctx, sa.x, (sa.y + sb.y) / 2, sb.x, label);
  else if (isVertical) dimV(ctx, (sa.x + sb.x) / 2, sa.y, sb.y, label);
  else dimDiag(ctx, sa.x, sa.y, sb.x, sb.y, label);
}

export function annotateRect(scene: Scene, x1: number, y1: number, x2: number, y2: number): void {
  const w = Math.abs(x2 - x1);
  const h = Math.abs(y2 - y1);
  if (!w && !h) return;
  const { ctx, view, units } = scene;
  const sxLeft = view.toScreen(Math.min(x1, x2), 0).x;
  const sxRight = view.toScreen(Math.max(x1, x2), 0).x;
  const syTop = view.toScreen(0, Math.max(y1, y2)).y;
  const syBottom = view.toScreen(0, Math.min(y1, y2)).y;
  if (w > 1e-6) dimH(ctx, sxLeft, syTop, sxRight, formatLength(w, units), true);
  if (h > 1e-6) dimV(ctx, sxRight, syTop, syBottom, formatLength(h, units));
}

export function annotateCircle(scene: Scene, cx: number, cy: number, r: number): void {
  if (r < 1e-6) return;
  const { ctx, view, units } = scene;
  const c = view.toScreen(cx, cy);
  const rs = r * view.zoom;
  const label = `⌀${formatLength(r * 2, units)}`;
  ctx.save();
  ctx.strokeStyle = CANVAS.dimLine;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(c.x - rs - 8, c.y);
  ctx.lineTo(c.x + rs + 8, c.y);
  ctx.stroke();
  ctx.setLineDash([]);
  for (const x of [c.x - rs, c.x + rs]) {
    ctx.beginPath();
    ctx.moveTo(x, c.y - 5);
    ctx.lineTo(x, c.y + 5);
    ctx.stroke();
  }
  ctx.font = FONT.dimension;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  const tw = ctx.measureText(label).width;
  ctx.fillStyle = CANVAS.labelBackdrop;
  ctx.fillRect(c.x - tw / 2 - 3, c.y - rs - 20, tw + 6, 16);
  ctx.fillStyle = CANVAS.dimText;
  ctx.fillText(label, c.x, c.y - rs - 4);
  ctx.restore();
}

export function annotateEllipse(
  scene: Scene,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
): void {
  if (rx < 1e-6 && ry < 1e-6) return;
  const { ctx, view, units } = scene;
  const sx1 = view.toScreen(cx - rx, 0).x;
  const sx2 = view.toScreen(cx + rx, 0).x;
  const sy1 = view.toScreen(0, cy + ry).y;
  const sy2 = view.toScreen(0, cy - ry).y;
  const scx = view.toScreen(cx, 0).x;
  const scy = view.toScreen(0, cy).y;
  if (rx > 1e-6) dimH(ctx, sx1, scy, sx2, formatLength(rx * 2, units), false);
  if (ry > 1e-6) dimV(ctx, scx, sy1, sy2, formatLength(ry * 2, units));
}

/** Draw a small filled dot — used for the plain cursor and preview vertices. */
export function dot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/** Dashed ring around the first polyline point, showing where a click closes the loop. */
export function closeLoopTarget(scene: Scene, wx: number, wy: number): void {
  const { ctx, view } = scene;
  const s = view.toScreen(wx, wy);
  ctx.save();
  ctx.strokeStyle = 'rgba(249,115,22,.5)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.arc(s.x, s.y, 11, 0, TAU);
  ctx.stroke();
  ctx.restore();
}
