import type { Units } from '../core/types';

export const MM_PER_INCH = 25.4;

/** Multiplier that takes a length in `from` units to `to` units. */
export function unitFactor(from: Units, to: Units): number {
  if (from === to) return 1;
  return to === 'mm' ? MM_PER_INCH : 1 / MM_PER_INCH;
}

/** Status-bar / dimension formatting: mm to one decimal, inches to three. */
export function formatLength(v: number, units: Units): string {
  return units === 'mm' ? v.toFixed(1) : v.toFixed(3);
}

/** Tighter formatting for editable fields — trailing zeros stripped. */
export function formatField(v: number, units: Units): string {
  const s = units === 'mm' ? v.toFixed(2) : v.toFixed(3);
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
}

/** Round a converted grid size to something a human would have typed. */
export function convertGridSize(gridSize: number, to: Units): number {
  return to === 'mm'
    ? parseFloat((gridSize * MM_PER_INCH).toFixed(2))
    : parseFloat((gridSize / MM_PER_INCH).toFixed(4));
}
