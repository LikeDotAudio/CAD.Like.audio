import type { EditorStore } from '../EditorStore';

export function setSelectionProtected(store: EditorStore, isProtected: boolean): void {
  if (store.selection.size === 0) return;
  for (const edgeId of store.selection) {
    const e = store.doc.edges.get(edgeId);
    if (e) e.protected = isProtected;
  }
  store.requestDraw();
  store.emit();

}
