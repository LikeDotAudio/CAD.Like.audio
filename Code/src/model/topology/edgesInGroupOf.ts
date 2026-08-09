import type { Doc } from '../Doc';

/** Every edge created by the same draw operation. */
export function edgesInGroupOf(doc: Doc, edgeId: number): Set<number> {
  const e0 = doc.edge(edgeId);
  if (!e0) return new Set();
  const out = new Set<number>();
  for (const e of doc.edges.values()) if (e.groupId === e0.groupId) out.add(e.id);
  return out;
}
