import type { Point } from '../../core/types';
import type { Doc } from '../Doc';

/** Add a line from two world points, creating or reusing their vertices. */
export function addLine(doc: Doc, p1: Point, p2: Point, groupId = 0, layerId = '0'): number | null {
  const v1 = doc.addVertex(p1.x, p1.y);
  const v2 = doc.addVertex(p2.x, p2.y);
  return doc.addLineEdge(v1, v2, groupId, layerId);
}
