import { EPS, HIT_PX } from '../core/constants';
import type { ArcEdge, BBox, Edge, GroupPrimitive, LineEdge, Point, Vertex } from '../core/types';
import { arcBBox, arcDistance, arcGeom, arcMidpoint, arcPointAt, type ArcGeom } from '../geometry/arc';
import { distToSegment } from '../geometry/distance';
import { arcArcIntersect, lineArcIntersect, lineLineIntersect } from '../geometry/intersect';

export interface DocSnapshot {
  vertices: Vertex[];
  edges: Edge[];
  groupPrimitives: [number, GroupPrimitive][];
  groupIntact: number[];
  nextVertexId: number;
  nextEdgeId: number;
  nextGroupId: number;
}

function pushTo<K, V>(map: Map<K, V[]>, key: K, value: V): void {
  const list = map.get(key);
  if (list) list.push(value);
  else map.set(key, [value]);
}

/**
 * The drawing's geometry: a graph of vertices joined by line or true-arc edges.
 *
 * Everything that mutates geometry lives here so that undo only has to
 * snapshot one object. Edges carry a `groupId` identifying the draw operation
 * that created them, which drives "select whole shape" and lossless export of
 * untouched circles.
 */
export class Doc {
  vertices = new Map<number, Vertex>();
  edges = new Map<number, Edge>();
  /** Original construction primitive per group, when one exists. */
  groupPrimitives = new Map<number, GroupPrimitive>();
  /** Groups whose primitive has not been cut or split since creation. */
  groupIntact = new Set<number>();

  private nextVertexId = 1;
  private nextEdgeId = 1;
  private nextGroupId = 1;

  // ---------------------------------------------------------------- lookups

  vertex(id: number): Vertex | undefined {
    return this.vertices.get(id);
  }

  /** Vertex lookup that throws on a dangling id — edges always reference live vertices. */
  vertexOf(id: number): Vertex {
    const v = this.vertices.get(id);
    if (!v) throw new Error(`Doc: missing vertex ${id}`);
    return v;
  }

  edge(id: number): Edge | undefined {
    return this.edges.get(id);
  }

  get edgeCount(): number {
    return this.edges.size;
  }

  get isEmpty(): boolean {
    return this.edges.size === 0;
  }

  newGroupId(): number {
    return this.nextGroupId++;
  }

  // ---------------------------------------------------------------- vertices

  findVertexNear(x: number, y: number, eps = EPS): number | null {
    for (const v of this.vertices.values()) {
      if (Math.abs(v.x - x) < eps && Math.abs(v.y - y) < eps && Math.hypot(v.x - x, v.y - y) < eps) {
        return v.id;
      }
    }
    return null;
  }

  /** Returns an existing coincident vertex when there is one, otherwise creates it. */
  addVertex(x: number, y: number): number {
    const existing = this.findVertexNear(x, y);
    if (existing !== null) return existing;
    const id = this.nextVertexId++;
    this.vertices.set(id, { id, x, y });
    return id;
  }

  vertexDegree(vId: number): number {
    let c = 0;
    for (const e of this.edges.values()) {
      if (e.v1 === vId) c++;
      if (e.v2 === vId) c++;
    }
    return c;
  }

  private pruneOrphanVertex(vId: number): void {
    for (const e of this.edges.values()) if (e.v1 === vId || e.v2 === vId) return;
    this.vertices.delete(vId);
  }

  // ------------------------------------------------------------------- edges

  addLineEdge(v1: number, v2: number, groupId: number, layerId = '0'): number | null {
    if (v1 === v2) return null;
    for (const e of this.edges.values()) {
      if (e.type === 'line' && ((e.v1 === v1 && e.v2 === v2) || (e.v1 === v2 && e.v2 === v1))) {
        return e.id;
      }
    }
    const id = this.nextEdgeId++;
    const edge: LineEdge = { id, v1, v2, groupId, layerId, type: 'line' };
    this.edges.set(id, edge);
    return id;
  }

  addArcEdge(
    v1: number,
    v2: number,
    cx: number,
    cy: number,
    r: number,
    groupId: number,
    layerId = '0',
  ): number | null {
    if (v1 === v2) return null;
    for (const e of this.edges.values()) {
      if (
        e.type === 'arc' &&
        e.v1 === v1 &&
        e.v2 === v2 &&
        Math.abs(e.cx - cx) < EPS &&
        Math.abs(e.cy - cy) < EPS &&
        Math.abs(e.r - r) < EPS * 10
      ) {
        return e.id;
      }
    }
    const id = this.nextEdgeId++;
    const edge: ArcEdge = { id, v1, v2, groupId, layerId, type: 'arc', cx, cy, r };
    this.edges.set(id, edge);
    return id;
  }

  addLine(p1: Point, p2: Point, groupId = 0, layerId = '0'): number | null {
    const v1 = this.addVertex(p1.x, p1.y);
    const v2 = this.addVertex(p2.x, p2.y);
    return this.addLineEdge(v1, v2, groupId, layerId);
  }

  addArc(cx: number, cy: number, r: number, p1: Point, p2: Point, groupId = 0, layerId = '0'): number | null {
    const v1 = this.addVertex(p1.x, p1.y);
    const v2 = this.addVertex(p2.x, p2.y);
    return this.addArcEdge(v1, v2, cx, cy, r, groupId, layerId);
  }

  removeEdge(id: number): void {
    const e = this.edges.get(id);
    if (!e) return;
    if (e.groupId) this.groupIntact.delete(e.groupId);
    this.edges.delete(id);
    this.pruneOrphanVertex(e.v1);
    this.pruneOrphanVertex(e.v2);
  }

  // -------------------------------------------------------------- edge shape

  arcOf(e: ArcEdge): ArcGeom {
    return arcGeom(e.cx, e.cy, e.r, this.vertexOf(e.v1), this.vertexOf(e.v2));
  }

  endpointsOf(e: Edge): [Vertex, Vertex] {
    return [this.vertexOf(e.v1), this.vertexOf(e.v2)];
  }

  edgeMidpoint(e: Edge): Point {
    if (e.type === 'arc') return arcMidpoint(this.arcOf(e));
    const [a, b] = this.endpointsOf(e);
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  edgeBBox(e: Edge): BBox {
    const [a, b] = this.endpointsOf(e);
    if (e.type === 'arc') return arcBBox(this.arcOf(e), a, b);
    return {
      x1: Math.min(a.x, b.x),
      y1: Math.min(a.y, b.y),
      x2: Math.max(a.x, b.x),
      y2: Math.max(a.y, b.y),
    };
  }

  /** Bounding box of the whole drawing, or null when nothing is drawn. */
  bounds(): BBox | null {
    if (!this.edges.size) return null;
    let x1 = Infinity;
    let y1 = Infinity;
    let x2 = -Infinity;
    let y2 = -Infinity;
    for (const e of this.edges.values()) {
      const b = this.edgeBBox(e);
      if (b.x1 < x1) x1 = b.x1;
      if (b.y1 < y1) y1 = b.y1;
      if (b.x2 > x2) x2 = b.x2;
      if (b.y2 > y2) y2 = b.y2;
    }
    return { x1, y1, x2, y2 };
  }

  /** Bounding box of the given edges, or null when none of them exist. */
  boundsOf(edgeIds: Iterable<number>): BBox | null {
    let x1 = Infinity;
    let y1 = Infinity;
    let x2 = -Infinity;
    let y2 = -Infinity;
    let any = false;
    for (const id of edgeIds) {
      const e = this.edges.get(id);
      if (!e) continue;
      any = true;
      const b = this.edgeBBox(e);
      if (b.x1 < x1) x1 = b.x1;
      if (b.y1 < y1) y1 = b.y1;
      if (b.x2 > x2) x2 = b.x2;
      if (b.y2 > y2) y2 = b.y2;
    }
    return any ? { x1, y1, x2, y2 } : null;
  }

  // --------------------------------------------------------------- hit tests

  distToEdge(wx: number, wy: number, e: Edge): number {
    const [a, b] = this.endpointsOf(e);
    if (e.type === 'line') return distToSegment(wx, wy, a.x, a.y, b.x, b.y);
    return arcDistance(this.arcOf(e), a, b, wx, wy);
  }

  /** Nearest edge within `maxPx` screen pixels at the given zoom, else null. */
  hitEdgeAt(wx: number, wy: number, zoom: number, maxPx = HIT_PX): number | null {
    let best: number | null = null;
    let bestD = maxPx / zoom;
    for (const e of this.edges.values()) {
      const d = this.distToEdge(wx, wy, e);
      if (d < bestD) {
        bestD = d;
        best = e.id;
      }
    }
    return best;
  }

  // ----------------------------------------------------------------- cutting

  /** Split a line edge at the given parametric positions; returns the new edge ids. */
  splitLineAt(edgeId: number, ts: number[]): number[] {
    const e = this.edges.get(edgeId);
    if (!e || e.type !== 'line') return [];
    if (!ts.length) return [edgeId];
    if (e.groupId) this.groupIntact.delete(e.groupId);
    const [a, b] = this.endpointsOf(e);
    const sorted = [...ts].sort((x, y) => x - y);
    const vIds = [e.v1];
    for (const t of sorted) vIds.push(this.addVertex(a.x + t * (b.x - a.x), a.y + t * (b.y - a.y)));
    vIds.push(e.v2);
    this.edges.delete(edgeId);
    const out: number[] = [];
    for (let i = 0; i < vIds.length - 1; i++) {
      const from = vIds[i]!;
      const to = vIds[i + 1]!;
      if (from !== to) {
        const n = this.addLineEdge(from, to, e.groupId, e.layerId);
        if (n) out.push(n);
      }
    }
    return out;
  }

  /** Split an arc edge at the given parametric positions; returns the new edge ids. */
  splitArcAt(edgeId: number, ss: number[]): number[] {
    const e = this.edges.get(edgeId);
    if (!e || e.type !== 'arc') return [];
    if (!ss.length) return [edgeId];
    if (e.groupId) this.groupIntact.delete(e.groupId);
    const g = this.arcOf(e);
    const sorted = [...ss].sort((x, y) => x - y);
    const vIds = [e.v1];
    for (const s of sorted) {
      const p = arcPointAt(g, s);
      vIds.push(this.addVertex(p.x, p.y));
    }
    vIds.push(e.v2);
    this.edges.delete(edgeId);
    const out: number[] = [];
    for (let i = 0; i < vIds.length - 1; i++) {
      const from = vIds[i]!;
      const to = vIds[i + 1]!;
      if (from !== to) {
        const n = this.addArcEdge(from, to, e.cx, e.cy, e.r, e.groupId, e.layerId);
        if (n) out.push(n);
      }
    }
    return out;
  }

  private static sharesVertex(a: Edge, b: Edge): boolean {
    return a.v1 === b.v1 || a.v1 === b.v2 || a.v2 === b.v1 || a.v2 === b.v2;
  }

  /**
   * Split every pair of crossing edges at their intersections so the drawing
   * stays a proper planar graph. Runs to a fixed point (splits can create new
   * crossings), capped at a handful of passes.
   */
  resolveAllIntersections(): void {
    for (let pass = 0; pass < 8; pass++) {
      const ids = Array.from(this.edges.keys());
      const lineSplits = new Map<number, number[]>();
      const arcSplits = new Map<number, number[]>();
      let found = false;

      for (let i = 0; i < ids.length; i++) {
        const ei = this.edges.get(ids[i]!);
        if (!ei) continue;
        for (let j = i + 1; j < ids.length; j++) {
          const ej = this.edges.get(ids[j]!);
          if (!ej) continue;
          if (Doc.sharesVertex(ei, ej)) continue;

          if (ei.type === 'line' && ej.type === 'line') {
            const [a1, a2] = this.endpointsOf(ei);
            const [b1, b2] = this.endpointsOf(ej);
            for (const h of lineLineIntersect(a1, a2, b1, b2)) {
              pushTo(lineSplits, ei.id, h.t);
              pushTo(lineSplits, ej.id, h.s);
              found = true;
            }
          } else if (ei.type === 'line' && ej.type === 'arc') {
            const [a1, a2] = this.endpointsOf(ei);
            for (const h of lineArcIntersect(a1, a2, this.arcOf(ej))) {
              pushTo(lineSplits, ei.id, h.t);
              pushTo(arcSplits, ej.id, h.s);
              found = true;
            }
          } else if (ei.type === 'arc' && ej.type === 'line') {
            const [b1, b2] = this.endpointsOf(ej);
            for (const h of lineArcIntersect(b1, b2, this.arcOf(ei))) {
              pushTo(lineSplits, ej.id, h.t);
              pushTo(arcSplits, ei.id, h.s);
              found = true;
            }
          } else if (ei.type === 'arc' && ej.type === 'arc') {
            for (const h of arcArcIntersect(this.arcOf(ei), this.arcOf(ej))) {
              pushTo(arcSplits, ei.id, h.s1);
              pushTo(arcSplits, ej.id, h.s2);
              found = true;
            }
          }
        }
      }

      for (const [eid, ts] of lineSplits) this.splitLineAt(eid, ts);
      for (const [eid, ss] of arcSplits) this.splitArcAt(eid, ss);
      if (!found) return;
    }
  }

  /** Rotate a set of edges by `angleRad` about pivot `(cx, cy)`. */
  rotateEdges(edgeIds: Iterable<number>, cx: number, cy: number, angleRad: number): boolean {
    const edgeSet = new Set(edgeIds);
    if (!edgeSet.size || Math.abs(angleRad) < 1e-9) return false;

    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    const affectedVertices = new Set<number>();
    const affectedGroups = new Set<number>();

    for (const id of edgeSet) {
      const e = this.edges.get(id);
      if (!e) continue;
      affectedVertices.add(e.v1);
      affectedVertices.add(e.v2);
      if (e.groupId) {
        affectedGroups.add(e.groupId);
        this.groupIntact.delete(e.groupId);
      }
    }

    // Rotate vertices
    for (const vId of affectedVertices) {
      const v = this.vertices.get(vId);
      if (!v) continue;
      const dx = v.x - cx;
      const dy = v.y - cy;
      v.x = cx + dx * cos - dy * sin;
      v.y = cy + dx * sin + dy * cos;
    }

    // Rotate arc centers
    for (const id of edgeSet) {
      const e = this.edges.get(id);
      if (e && e.type === 'arc') {
        const dx = e.cx - cx;
        const dy = e.cy - cy;
        e.cx = cx + dx * cos - dy * sin;
        e.cy = cy + dx * sin + dy * cos;
      }
    }

    // Rotate group primitives
    for (const gId of affectedGroups) {
      const p = this.groupPrimitives.get(gId);
      if (p) {
        const dx = p.cx - cx;
        const dy = p.cy - cy;
        p.cx = cx + dx * cos - dy * sin;
        p.cy = cy + dx * sin + dy * cos;
      }
    }

    this.resolveAllIntersections();
    return true;
  }

  /** Translate selected edges by (dx, dy). */
  translateEdges(edgeIds: Iterable<number>, dx: number, dy: number): boolean {
    const edgeSet = new Set(edgeIds);
    if (edgeSet.size === 0 || (dx === 0 && dy === 0)) return false;

    const affectedVertices = new Set<number>();
    const affectedGroups = new Set<number>();

    for (const id of edgeSet) {
      const e = this.edges.get(id);
      if (!e) continue;
      affectedVertices.add(e.v1);
      affectedVertices.add(e.v2);
      if (e.groupId) {
        affectedGroups.add(e.groupId);
        this.groupIntact.delete(e.groupId);
      }
    }

    for (const vId of affectedVertices) {
      const v = this.vertices.get(vId);
      if (v) {
        v.x += dx;
        v.y += dy;
      }
    }

    for (const id of edgeSet) {
      const e = this.edges.get(id);
      if (e && e.type === 'arc') {
        e.cx += dx;
        e.cy += dy;
      }
    }

    for (const gId of affectedGroups) {
      const p = this.groupPrimitives.get(gId);
      if (p) {
        p.cx += dx;
        p.cy += dy;
      }
    }

    this.resolveAllIntersections();
    return true;
  }

  scaleEdges(edgeIds: Iterable<number>, cx: number, cy: number, scaleFactor: number): boolean {
    if (scaleFactor <= 0) return false;
    const edgeSet = new Set(edgeIds);
    if (edgeSet.size === 0) return false;
    const affectedVertices = new Set<number>();

    for (const id of edgeSet) {
      const e = this.edges.get(id);
      if (!e) continue;
      affectedVertices.add(e.v1);
      affectedVertices.add(e.v2);
      if (e.groupId) this.groupIntact.delete(e.groupId);
    }

    for (const vId of affectedVertices) {
      const v = this.vertices.get(vId);
      if (v) {
        v.x = cx + (v.x - cx) * scaleFactor;
        v.y = cy + (v.y - cy) * scaleFactor;
      }
    }

    for (const id of edgeSet) {
      const e = this.edges.get(id);
      if (e && e.type === 'arc') {
        e.cx = cx + (e.cx - cx) * scaleFactor;
        e.cy = cy + (e.cy - cy) * scaleFactor;
        e.r *= scaleFactor;
      }
    }

    this.resolveAllIntersections();
    return true;
  }

  flipHorizontal(edgeIds: Iterable<number>): boolean {
    const edgeSet = new Set(edgeIds);
    if (edgeSet.size === 0) return false;
    let minX = Infinity, maxX = -Infinity;

    for (const id of edgeSet) {
      const e = this.edges.get(id);
      if (!e) continue;
      const [a, b] = this.endpointsOf(e);
      minX = Math.min(minX, a.x, b.x);
      maxX = Math.max(maxX, a.x, b.x);
    }
    const cx = (minX + maxX) / 2;

    const affectedVertices = new Set<number>();
    for (const id of edgeSet) {
      const e = this.edges.get(id);
      if (!e) continue;
      affectedVertices.add(e.v1);
      affectedVertices.add(e.v2);
      if (e.groupId) this.groupIntact.delete(e.groupId);
    }

    for (const vId of affectedVertices) {
      const v = this.vertices.get(vId);
      if (v) v.x = cx - (v.x - cx);
    }

    for (const id of edgeSet) {
      const e = this.edges.get(id);
      if (e && e.type === 'arc') e.cx = cx - (e.cx - cx);
    }

    this.resolveAllIntersections();
    return true;
  }

  flipVertical(edgeIds: Iterable<number>): boolean {
    const edgeSet = new Set(edgeIds);
    if (edgeSet.size === 0) return false;
    let minY = Infinity, maxY = -Infinity;

    for (const id of edgeSet) {
      const e = this.edges.get(id);
      if (!e) continue;
      const [a, b] = this.endpointsOf(e);
      minY = Math.min(minY, a.y, b.y);
      maxY = Math.max(maxY, a.y, b.y);
    }
    const cy = (minY + maxY) / 2;

    const affectedVertices = new Set<number>();
    for (const id of edgeSet) {
      const e = this.edges.get(id);
      if (!e) continue;
      affectedVertices.add(e.v1);
      affectedVertices.add(e.v2);
      if (e.groupId) this.groupIntact.delete(e.groupId);
    }

    for (const vId of affectedVertices) {
      const v = this.vertices.get(vId);
      if (v) v.y = cy - (v.y - cy);
    }

    for (const id of edgeSet) {
      const e = this.edges.get(id);
      if (e && e.type === 'arc') e.cy = cy - (e.cy - cy);
    }

    this.resolveAllIntersections();
    return true;
  }

  divideEdge(edgeId: number, px: number, py: number): number | null {
    const e = this.edges.get(edgeId);
    if (!e) return null;
    const [a, b] = this.endpointsOf(e);
    const layerId = e.layerId;

    if (e.type === 'line') {
      const d = distToSegment(px, py, a.x, a.y, b.x, b.y);
      const splitPt = { x: a.x + d * (b.x - a.x), y: a.y + d * (b.y - a.y) };
      this.removeEdge(edgeId);
      const e1 = this.addLine(a, splitPt, 0, layerId);
      this.addLine(splitPt, b, 0, layerId);
      return e1;
    } else if (e.type === 'arc') {
      const angle = Math.atan2(py - e.cy, px - e.cx);
      const splitPt = { x: e.cx + e.r * Math.cos(angle), y: e.cy + e.r * Math.sin(angle) };
      this.removeEdge(edgeId);
      const e1 = this.addArc(e.cx, e.cy, e.r, a, splitPt, 0, layerId);
      this.addArc(e.cx, e.cy, e.r, splitPt, b, 0, layerId);
      return e1;
    }
    return null;
  }

  groupSelected(edgeIds: Iterable<number>): number {
    const edgeSet = new Set(edgeIds);
    if (edgeSet.size <= 1) return 0;
    const newGroupId = this.newGroupId();
    let count = 0;
    for (const id of edgeSet) {
      const e = this.edges.get(id);
      if (e) {
        e.groupId = newGroupId;
        count++;
      }
    }
    return count;
  }

  explodeSelected(edgeIds: Iterable<number>): number {
    let count = 0;
    for (const id of edgeIds) {
      const e = this.edges.get(id);
      if (e && e.groupId) {
        this.groupIntact.delete(e.groupId);
        e.groupId = 0;
        count++;
      }
    }
    return count;
  }

  /** Multiply every coordinate by `f` (unit switches and scale calibration). */
  scaleAll(f: number): void {
    for (const v of this.vertices.values()) {
      v.x *= f;
      v.y *= f;
    }
    for (const e of this.edges.values()) {
      if (e.type === 'arc') {
        e.cx *= f;
        e.cy *= f;
        e.r *= f;
      }
    }
    for (const p of this.groupPrimitives.values()) {
      p.cx *= f;
      p.cy *= f;
      p.r *= f;
    }
  }

  clear(): void {
    this.vertices.clear();
    this.edges.clear();
    this.groupPrimitives.clear();
    this.groupIntact.clear();
    this.nextVertexId = 1;
    this.nextEdgeId = 1;
    this.nextGroupId = 1;
  }

  // ------------------------------------------------------------------ undo

  snapshot(): DocSnapshot {
    return {
      vertices: Array.from(this.vertices.values(), (v) => ({ ...v })),
      edges: Array.from(this.edges.values(), (e) => ({ ...e })),
      groupPrimitives: Array.from(this.groupPrimitives.entries(), ([k, v]) => [k, { ...v }]),
      groupIntact: Array.from(this.groupIntact),
      nextVertexId: this.nextVertexId,
      nextEdgeId: this.nextEdgeId,
      nextGroupId: this.nextGroupId,
    };
  }

  restore(s: DocSnapshot): void {
    this.vertices = new Map(s.vertices.map((v) => [v.id, { ...v }]));
    this.edges = new Map(s.edges.map((e) => [e.id, { ...e }]));
    this.groupPrimitives = new Map(s.groupPrimitives.map(([k, v]) => [k, { ...v }]));
    this.groupIntact = new Set(s.groupIntact);
    this.nextVertexId = s.nextVertexId;
    this.nextEdgeId = s.nextEdgeId;
    this.nextGroupId = s.nextGroupId;
  }
}
