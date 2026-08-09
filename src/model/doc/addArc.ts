import type { Point } from '../../core/types';
import type { Doc } from '../Doc';

/** Add an arc from two world points on it, creating or reusing their vertices. */
export function addArc(
  doc: Doc,
  cx: number,
  cy: number,
  r: number,
  p1: Point,
  p2: Point,
  groupId = 0,
  layerId = '0',
): number | null {
  const v1 = doc.addVertex(p1.x, p1.y);
  const v2 = doc.addVertex(p2.x, p2.y);
  return doc.addArcEdge(v1, v2, cx, cy, r, groupId, layerId);
}
