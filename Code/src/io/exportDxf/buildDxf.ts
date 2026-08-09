import type { Edge, Units } from '../../core/types';
import type { Doc } from '../../model/Doc';
import { arcEntity } from './arcEntity';
import { circleEntity } from './circleEntity';
import { dxfHeader } from './dxfHeader';
import { lineEntity } from './lineEntity';
import { pair } from './pair';

/**
 * Serialise the drawing as DXF R2000 text. Groups that are still an untouched
 * circle are written as a single CIRCLE; everything else becomes LINE and ARC
 * entities.
 */
export function buildDxf(doc: Doc, units: Units): string {
  const byGroup = new Map<number, Edge[]>();
  for (const e of doc.edges.values()) {
    const list = byGroup.get(e.groupId);
    if (list) list.push(e);
    else byGroup.set(e.groupId, [e]);
  }

  let entities = '';
  for (const [groupId, list] of byGroup) {
    const prim = doc.groupPrimitives.get(groupId);
    if (prim?.type === 'circle' && doc.groupIntact.has(groupId) && list.length === 2) {
      entities += circleEntity(prim.cx, prim.cy, prim.r, list[0]?.layerId || '0');
      continue;
    }
    for (const e of list) {
      entities += e.type === 'line' ? lineEntity(doc, e) : arcEntity(doc, e);
    }
  }

  return (
    `${dxfHeader(units)}` +
    pair('  0', 'SECTION') +
    pair('  2', 'ENTITIES') +
    entities +
    pair('  0', 'ENDSEC') +
    pair('  0', 'EOF')
  );
}
