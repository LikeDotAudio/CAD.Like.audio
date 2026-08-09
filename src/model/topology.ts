import { TAU } from '../core/constants';
import type { Edge, Point } from '../core/types';
import { arcToPolyline } from '../geometry/arc';
import type { Doc } from './Doc';

/** vertex id → the edges touching it. */
export function vertexEdgeIndex(doc: Doc, edgeIds?: Iterable<number>): Map<number, Edge[]> {
  const index = new Map<number, Edge[]>();
  const add = (v: number, e: Edge) => {
    const list = index.get(v);
    if (list) list.push(e);
    else index.set(v, [e]);
  };
  if (edgeIds) {
    for (const id of edgeIds) {
      const e = doc.edge(id);
      if (!e) continue;
      add(e.v1, e);
      add(e.v2, e);
    }
  } else {
    for (const e of doc.edges.values()) {
      add(e.v1, e);
      add(e.v2, e);
    }
  }
  return index;
}

/**
 * All edges reachable from `edgeId` by walking through degree-2 vertices —
 * i.e. the continuous run of segments a user perceives as one outline. The
 * walk stops at branches so a T-junction doesn't drag in unrelated geometry.
 */
export function edgesInChainOf(doc: Doc, edgeId: number): Set<number> {
  const start = doc.edge(edgeId);
  if (!start) return new Set();
  const result = new Set([edgeId]);
  const index = vertexEdgeIndex(doc);

  const walk = (fromV: number, viaEdge: Edge) => {
    let prev = viaEdge.id;
    let cur = fromV;
    for (;;) {
      const es = index.get(cur) ?? [];
      if (es.length !== 2) return;
      const next = es[0]!.id === prev ? es[1]! : es[0]!;
      if (result.has(next.id)) return;
      result.add(next.id);
      prev = next.id;
      cur = next.v1 === cur ? next.v2 : next.v1;
    }
  };

  walk(start.v1, start);
  walk(start.v2, start);
  return result;
}

/** Every edge created by the same draw operation. */
export function edgesInGroupOf(doc: Doc, edgeId: number): Set<number> {
  const e0 = doc.edge(edgeId);
  if (!e0) return new Set();
  const out = new Set<number>();
  for (const e of doc.edges.values()) if (e.groupId === e0.groupId) out.add(e.id);
  return out;
}

export interface Component {
  verts: number[];
  edgeIds: number[];
}

/** Connected components of the geometry graph (edge-bearing ones only). */
export function connectedComponents(doc: Doc): Component[] {
  const assigned = new Set<number>();
  const out: Component[] = [];
  for (const vStart of doc.vertices.keys()) {
    if (assigned.has(vStart)) continue;
    const compV = new Set<number>();
    const compE = new Set<number>();
    const queue = [vStart];
    while (queue.length) {
      const v = queue.shift()!;
      if (compV.has(v)) continue;
      compV.add(v);
      assigned.add(v);
      for (const e of doc.edges.values()) {
        if (e.v1 === v || e.v2 === v) {
          compE.add(e.id);
          const other = e.v1 === v ? e.v2 : e.v1;
          if (!compV.has(other)) queue.push(other);
        }
      }
    }
    if (compE.size > 0) out.push({ verts: Array.from(compV), edgeIds: Array.from(compE) });
  }
  return out;
}

export interface CycleWalk {
  edgeSeq: number[];
  vertSeq: number[];
}

/**
 * Walk a component as a single closed loop. Returns null when the component
 * is not one — a dangling end or a branch point both break the walk.
 */
export function cycleWalk(doc: Doc, component: Component): CycleWalk | null {
  const index = vertexEdgeIndex(doc, component.edgeIds);
  const startV = component.verts[0];
  if (startV === undefined) return null;
  if (index.get(startV)?.length !== 2) return null;

  let prev: number | null = null;
  let curV = startV;
  const edgeSeq: number[] = [];
  const vertSeq: number[] = [startV];

  for (;;) {
    const nbrs = index.get(curV);
    if (!nbrs || nbrs.length !== 2) return null;
    const next = nbrs[0]!.id === prev ? nbrs[1]! : nbrs[0]!;
    edgeSeq.push(next.id);
    const nextV = next.v1 === curV ? next.v2 : next.v1;
    if (nextV === startV) break;
    vertSeq.push(nextV);
    prev = next.id;
    curV = nextV;
    if (edgeSeq.length > doc.edgeCount + 5) return null;
  }
  return { edgeSeq, vertSeq };
}

/** Flatten a closed walk into a polygon, tessellating any arcs it contains. */
export function cyclePoints(doc: Doc, walk: CycleWalk): Point[] {
  const poly: Point[] = [];
  for (let i = 0; i < walk.edgeSeq.length; i++) {
    const startVid = walk.vertSeq[i]!;
    const startV = doc.vertexOf(startVid);
    poly.push({ x: startV.x, y: startV.y });

    const edge = doc.edge(walk.edgeSeq[i]!);
    if (!edge || edge.type !== 'arc') continue;

    const endV = doc.vertexOf(edge.v1 === startVid ? edge.v2 : edge.v1);
    const aFrom = Math.atan2(startV.y - edge.cy, startV.x - edge.cx);
    const aTo = Math.atan2(endV.y - edge.cy, endV.x - edge.cx);
    // The walk may traverse the arc against its stored CCW direction.
    const forward = edge.v1 === startVid;
    let sweep: number;
    if (forward) {
      sweep = aTo - aFrom;
      while (sweep <= 0) sweep += TAU;
    } else {
      let back = aFrom - aTo;
      while (back <= 0) back += TAU;
      sweep = -back;
    }
    poly.push(...arcToPolyline(edge.cx, edge.cy, edge.r, aFrom, sweep));
  }
  return poly;
}
