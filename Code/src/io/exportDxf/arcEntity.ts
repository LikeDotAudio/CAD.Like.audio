import type { Edge } from '../../core/types';
import type { Doc } from '../../model/Doc';
import { pair } from './pair';

/** One ARC entity. */
export function arcEntity(doc: Doc, e: Extract<Edge, { type: 'arc' }>): string {
  const [a, b] = doc.endpointsOf(e);
  // DXF arcs are always CCW from start angle to end angle, which matches how
  // arcs are stored here, so the angles map across directly.
  const a1 = ((Math.atan2(a.y - e.cy, a.x - e.cx) * 180) / Math.PI + 360) % 360;
  const a2 = ((Math.atan2(b.y - e.cy, b.x - e.cx) * 180) / Math.PI + 360) % 360;
  return (
    pair('  0', 'ARC') +
    pair('  8', e.layerId || '0') +
    pair(' 10', e.cx.toFixed(8)) +
    pair(' 20', e.cy.toFixed(8)) +
    pair(' 30', '0.0') +
    pair(' 40', e.r.toFixed(8)) +
    pair(' 50', a1.toFixed(6)) +
    pair(' 51', a2.toFixed(6))
  );
}
