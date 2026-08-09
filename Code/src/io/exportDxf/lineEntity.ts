import type { Edge } from '../../core/types';
import type { Doc } from '../../model/Doc';
import { pair } from './pair';

/** One LINE entity. */
export function lineEntity(doc: Doc, e: Edge): string {
  const [a, b] = doc.endpointsOf(e);
  return (
    pair('  0', 'LINE') +
    pair('  8', e.layerId || '0') +
    pair(' 10', a.x.toFixed(8)) +
    pair(' 20', a.y.toFixed(8)) +
    pair(' 30', '0.0') +
    pair(' 11', b.x.toFixed(8)) +
    pair(' 21', b.y.toFixed(8)) +
    pair(' 31', '0.0')
  );
}
