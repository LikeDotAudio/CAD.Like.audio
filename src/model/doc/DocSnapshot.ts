import type { Edge, GroupPrimitive, Vertex } from '../../core/types';

/** A deep copy of the document, cheap enough to push on every edit. */
export interface DocSnapshot {
  vertices: Vertex[];
  edges: Edge[];
  groupPrimitives: [number, GroupPrimitive][];
  groupIntact: number[];
  nextVertexId: number;
  nextEdgeId: number;
  nextGroupId: number;
}
