import type { ClipboardItem } from '../ClipboardItem';
import type { EditorStore } from '../EditorStore';

/** Store the selection in the clipboard, relative to the given world origin. */
export function captureClipboard(store: EditorStore, cx: number, cy: number): number {
  const items: ClipboardItem[] = [];

  for (const id of store.selection) {
    const e = store.doc.edge(id);
    if (!e) continue;
    const [a, b] = store.doc.endpointsOf(e);
    const item: ClipboardItem = {
      type: e.type,
      p1: { x: a.x - cx, y: a.y - cy },
      p2: { x: b.x - cx, y: b.y - cy },
      layerId: e.layerId,
    };
    if (e.type === 'arc') {
      item.cx = e.cx - cx;
      item.cy = e.cy - cy;
      item.r = e.r;
    }
    items.push(item);
  }

  store.clipboard = items;
  return items.length;

}
