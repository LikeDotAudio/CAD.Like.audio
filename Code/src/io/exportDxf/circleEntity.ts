import { pair } from './pair';

/** A whole circle, written when its group was never cut. */
export function circleEntity(cx: number, cy: number, r: number, layer = '0'): string {
  return (
    pair('  0', 'CIRCLE') +
    pair('  8', layer) +
    pair(' 10', cx.toFixed(8)) +
    pair(' 20', cy.toFixed(8)) +
    pair(' 30', '0.0') +
    pair(' 40', r.toFixed(8))
  );
}
