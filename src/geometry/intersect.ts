import { PARAM_EPS } from '../core/constants';
import type { Point } from '../core/types';
import { arcParamFor, type ArcGeom } from './arc';

/** Intersection strictly interior to both entities (shared endpoints are ignored). */
export interface LineLineHit {
  /** Parameter along the first segment. */
  t: number;
  /** Parameter along the second segment. */
  s: number;
  x: number;
  y: number;
}

export function lineLineIntersect(a1: Point, a2: Point, b1: Point, b2: Point): LineLineHit[] {
  const dax = a2.x - a1.x;
  const day = a2.y - a1.y;
  const dbx = b2.x - b1.x;
  const dby = b2.y - b1.y;
  const denom = dax * dby - day * dbx;
  if (Math.abs(denom) < 1e-12) return [];
  const t = ((b1.x - a1.x) * dby - (b1.y - a1.y) * dbx) / denom;
  const s = ((b1.x - a1.x) * day - (b1.y - a1.y) * dax) / denom;
  const e = PARAM_EPS;
  if (t <= e || t >= 1 - e || s <= e || s >= 1 - e) return [];
  return [{ t, s, x: a1.x + t * dax, y: a1.y + t * day }];
}

/** `t` is along the segment, `s` is along the arc. */
export function lineArcIntersect(la1: Point, la2: Point, arc: ArcGeom): LineLineHit[] {
  const dx = la2.x - la1.x;
  const dy = la2.y - la1.y;
  const fx = la1.x - arc.cx;
  const fy = la1.y - arc.cy;
  const A = dx * dx + dy * dy;
  if (A < 1e-20) return [];
  const B = 2 * (fx * dx + fy * dy);
  const C = fx * fx + fy * fy - arc.r * arc.r;
  const disc = B * B - 4 * A * C;
  if (disc < -1e-12) return [];
  const sq = Math.sqrt(Math.max(0, disc));
  const e = PARAM_EPS;
  const out: LineLineHit[] = [];
  for (const t of [(-B - sq) / (2 * A), (-B + sq) / (2 * A)]) {
    if (t <= e || t >= 1 - e) continue;
    const px = la1.x + t * dx;
    const py = la1.y + t * dy;
    const s = arcParamFor(arc, px, py);
    if (s !== null && s > e && s < 1 - e) out.push({ t, s, x: px, y: py });
  }
  return out;
}

export interface ArcArcHit {
  s1: number;
  s2: number;
  x: number;
  y: number;
}

export function arcArcIntersect(a1: ArcGeom, a2: ArcGeom): ArcArcHit[] {
  const dx = a2.cx - a1.cx;
  const dy = a2.cy - a1.cy;
  const d = Math.hypot(dx, dy);
  if (d < 1e-12 || d > a1.r + a2.r + 1e-9 || d < Math.abs(a1.r - a2.r) - 1e-9) return [];
  const a = (a1.r * a1.r - a2.r * a2.r + d * d) / (2 * d);
  const h2 = a1.r * a1.r - a * a;
  if (h2 < -1e-12) return [];
  const h = Math.sqrt(Math.max(0, h2));
  const mx = a1.cx + (a * dx) / d;
  const my = a1.cy + (a * dy) / d;
  const hx = (-dy / d) * h;
  const hy = (dx / d) * h;
  const cand: Point[] = [{ x: mx + hx, y: my + hy }];
  if (h > 1e-10) cand.push({ x: mx - hx, y: my - hy });
  const e = PARAM_EPS;
  const out: ArcArcHit[] = [];
  for (const p of cand) {
    const s1 = arcParamFor(a1, p.x, p.y);
    const s2 = arcParamFor(a2, p.x, p.y);
    if (s1 !== null && s2 !== null && s1 > e && s1 < 1 - e && s2 > e && s2 < 1 - e) {
      out.push({ s1, s2, x: p.x, y: p.y });
    }
  }
  return out;
}
