import type { Edge, Units } from '../core/types';
import type { Doc } from '../model/Doc';

/** DXF group code + value, one per line. */
function pair(code: string, value: string | number): string {
  return `${code}\n${value}\n`;
}

function header(units: Units): string {
  const insunits = units === 'mm' ? 4 : 1;
  const measurement = units === 'mm' ? 1 : 0;
  return (
    pair('  0', 'SECTION') +
    pair('  2', 'HEADER') +
    pair('  9', '$ACADVER') +
    pair('  1', 'AC1015') +
    pair('  9', '$INSUNITS') +
    pair(' 70', insunits) +
    pair('  9', '$MEASUREMENT') +
    pair(' 70', measurement) +
    pair('  9', '$LUNITS') +
    pair(' 70', 2) +
    pair('  0', 'ENDSEC')
  );
}

function circleEntity(cx: number, cy: number, r: number): string {
  return (
    pair('  0', 'CIRCLE') +
    pair('  8', '0') +
    pair(' 10', cx.toFixed(8)) +
    pair(' 20', cy.toFixed(8)) +
    pair(' 30', '0.0') +
    pair(' 40', r.toFixed(8))
  );
}

function lineEntity(doc: Doc, e: Edge): string {
  const [a, b] = doc.endpointsOf(e);
  return (
    pair('  0', 'LINE') +
    pair('  8', '0') +
    pair(' 10', a.x.toFixed(8)) +
    pair(' 20', a.y.toFixed(8)) +
    pair(' 30', '0.0') +
    pair(' 11', b.x.toFixed(8)) +
    pair(' 21', b.y.toFixed(8)) +
    pair(' 31', '0.0')
  );
}

function arcEntity(doc: Doc, e: Extract<Edge, { type: 'arc' }>): string {
  const [a, b] = doc.endpointsOf(e);
  // DXF arcs are always CCW from start angle to end angle, which matches how
  // arcs are stored here, so the angles map across directly.
  const a1 = ((Math.atan2(a.y - e.cy, a.x - e.cx) * 180) / Math.PI + 360) % 360;
  const a2 = ((Math.atan2(b.y - e.cy, b.x - e.cx) * 180) / Math.PI + 360) % 360;
  return (
    pair('  0', 'ARC') +
    pair('  8', '0') +
    pair(' 10', e.cx.toFixed(8)) +
    pair(' 20', e.cy.toFixed(8)) +
    pair(' 30', '0.0') +
    pair(' 40', e.r.toFixed(8)) +
    pair(' 50', a1.toFixed(6)) +
    pair(' 51', a2.toFixed(6))
  );
}

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
      entities += circleEntity(prim.cx, prim.cy, prim.r);
      continue;
    }
    for (const e of list) {
      entities += e.type === 'line' ? lineEntity(doc, e) : arcEntity(doc, e);
    }
  }

  return (
    `${header(units)}` +
    pair('  0', 'SECTION') +
    pair('  2', 'ENTITIES') +
    entities +
    pair('  0', 'ENDSEC') +
    pair('  0', 'EOF')
  );
}

export function dxfFileName(units: Units): string {
  return `my-part-${units}.dxf`;
}

interface SaveFilePickerWindow {
  showSaveFilePicker?: (options: {
    suggestedName?: string;
    types?: { description: string; accept: Record<string, string[]> }[];
  }) => Promise<FileSystemFileHandle>;
}

/**
 * Save the DXF, preferring the File System Access API so the user picks a
 * location, and falling back to a plain download elsewhere.
 */
export async function saveDxf(doc: Doc, units: Units): Promise<void> {
  const blob = new Blob([buildDxf(doc, units)], { type: 'application/dxf' });
  const name = dxfFileName(units);
  const picker = (window as unknown as SaveFilePickerWindow).showSaveFilePicker;

  if (picker) {
    try {
      const handle = await picker({
        suggestedName: name,
        types: [{ description: 'DXF File', accept: { 'application/dxf': ['.dxf'] } }],
      });
      const stream = await handle.createWritable();
      await stream.write(blob);
      await stream.close();
      return;
    } catch (err) {
      if ((err as DOMException).name === 'AbortError') return;
      throw err;
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
