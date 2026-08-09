import type { Doc } from '../Doc';

/** Empty the document and reset every id counter. */
export function clearDoc(doc: Doc): void {
  doc.vertices.clear();
  doc.edges.clear();
  doc.groupPrimitives.clear();
  doc.groupIntact.clear();
  doc.nextVertexId = 1;
  doc.nextEdgeId = 1;
  doc.nextGroupId = 1;
}
