import type { EditorStore } from '../EditorStore';

export function cutSelection(store: EditorStore): void {
  if (store.selection.size === 0) return;
  const count = store.selection.size;
  store.copySelection();
  store.history.push(store.doc.snapshot());
  for (const id of store.selection) {
    const e = store.doc.edge(id);
    if (e && !e.protected) {
      store.doc.removeEdge(id);
    }
  }
  store.selection.clear();
  store.hoverId = null;
  store.markDocChanged();
  store.requestDraw();
  store.emit();
  store.showHint(`Cut ${count} element(s).`, 3000);

}
