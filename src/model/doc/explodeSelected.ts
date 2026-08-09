import type { Doc } from '../Doc';

/** Strip group membership so each edge selects on its own. */
export function explodeSelected(doc: Doc, edgeIds: Iterable<number>): number {
  let count = 0;
  for (const id of edgeIds) {
    const e = doc.edges.get(id);
    if (e && e.groupId) {
      doc.groupIntact.delete(e.groupId);
      e.groupId = 0;
      count++;
    }
  }
  return count;
}
