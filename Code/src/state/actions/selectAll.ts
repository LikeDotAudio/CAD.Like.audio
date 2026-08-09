import type { EditorStore } from '../EditorStore';

export function selectAll(store: EditorStore): void {
  store.selection.clear();
  for (const id of store.doc.edges.keys()) store.selection.add(id);
  store.requestDraw();
  store.emit();

}
