import type { Doc } from '../Doc';

/** How many edge ends meet at a vertex. 1 is a loose end, 3+ a crossing. */
export function vertexDegree(doc: Doc, vId: number): number {
  let c = 0;
  for (const e of doc.edges.values()) {
    if (e.v1 === vId) c++;
    if (e.v2 === vId) c++;
  }
  return c;
}
