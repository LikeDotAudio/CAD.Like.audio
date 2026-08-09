import type { BBox } from '../../core/types';
import type { Doc } from '../Doc';

/** Bounding box of the whole drawing, or null when nothing is drawn. */
export function bounds(doc: Doc): BBox | null {
  return doc.edges.size ? doc.boundsOf(doc.edges.keys()) : null;
}
