import type { Units } from '../../core/types';
import { pair } from './pair';

/** HEADER section, carrying the drawing units so CAM software reads it right. */
export function dxfHeader(units: Units): string {
  const insunits = units === 'mm' ? 4 : 1;
  const measurement = units === 'mm' ? 1 : 0;
  return (
    pair('  0', 'SECTION') +
    pair('  2', 'HEADER') +
    pair('  9', '$ACADVER') +
    pair('  1', 'AC1015') +
    pair('  9', '$INSUNITS') +
    pair(' 70', insunits) +
    pair('  9', '$MEASUREMENT') +
    pair(' 70', measurement) +
    pair('  9', '$LUNITS') +
    pair(' 70', 2) +
    pair('  0', 'ENDSEC')
  );
}
