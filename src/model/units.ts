import type { Units } from '../core/types';

export const MM_PER_INCH = 25.4;

export const MM_PER_UNIT: Record<Units, number> = {
  mm: 1.0,
  cm: 10.0,
  m: 1000.0,
  in: 25.4,
  ft: 304.8,
};

/** Multiplier that takes a length in `from` units to `to` units. */
export function unitFactor(from: Units, to: Units): number {
  if (from === to) return 1;
  const fromMM = MM_PER_UNIT[from] ?? 1;
  const toMM = MM_PER_UNIT[to] ?? 1;
  return fromMM / toMM;
}

/** Status-bar / dimension formatting. */
export function formatLength(v: number, units: Units): string {
  if (units === 'mm' || units === 'cm') return v.toFixed(1);
  if (units === 'm') return v.toFixed(3);
  return v.toFixed(3);
}

/** Tighter formatting for editable fields — trailing zeros stripped. */
export function formatField(v: number, units: Units): string {
  const decimals = units === 'mm' || units === 'cm' ? 2 : 3;
  const s = v.toFixed(decimals);
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
}

/** Round a converted grid size to something a human would have typed. */
export function convertGridSize(gridSize: number, to: Units): number {
  if (to === 'mm') return parseFloat((gridSize * 1.0).toFixed(2));
  if (to === 'cm') return parseFloat((gridSize * 1.0).toFixed(2));
  if (to === 'm') return parseFloat((gridSize * 1.0).toFixed(3));
  return parseFloat((gridSize * 1.0).toFixed(4));
}
