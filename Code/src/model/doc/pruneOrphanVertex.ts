import type { Doc } from '../Doc';

/** Drop a vertex once nothing references it. */
export function pruneOrphanVertex(doc: Doc, vId: number): void {
  for (const e of doc.edges.values()) if (e.v1 === vId || e.v2 === vId) return;
  doc.vertices.delete(vId);
}
