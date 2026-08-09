import { HIT_PX } from '../../core/constants';
import type { Doc } from '../Doc';

/** Nearest edge within `maxPx` screen pixels at the given zoom, else null. */
export function hitEdgeAt(doc: Doc, wx: number, wy: number, zoom: number, maxPx = HIT_PX): number | null {
  let best: number | null = null;
  let bestD = maxPx / zoom;
  for (const e of doc.edges.values()) {
    const d = doc.distToEdge(wx, wy, e);
    if (d < bestD) {
      bestD = d;
      best = e.id;
    }
  }
  return best;
}
