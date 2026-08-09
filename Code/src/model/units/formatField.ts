import type { Units } from '../../core/types';

/** Tighter formatting for editable fields — trailing zeros stripped. */
export function formatField(v: number, units: Units): string {
  const decimals = units === 'mm' || units === 'cm' ? 2 : 3;
  const s = v.toFixed(decimals);
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
}
