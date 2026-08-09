import type { Doc } from '../Doc';
import { pruneOrphanVertex } from './pruneOrphanVertex';

/** Delete an edge and any vertex it leaves stranded. */
export function removeEdge(doc: Doc, id: number): void {
  const e = doc.edges.get(id);
  if (!e) return;
  if (e.groupId) doc.groupIntact.delete(e.groupId);
  doc.edges.delete(id);
  pruneOrphanVertex(doc, e.v1);
  pruneOrphanVertex(doc, e.v2);
}
