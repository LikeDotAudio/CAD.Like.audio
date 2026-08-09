import type { EditorStore } from '../EditorStore';

export function deselectLayerEntities(store: EditorStore, id: string): void {
  for (const e of store.doc.edges.values()) {
    if (e.layerId === id) {
      store.selection.delete(e.id);
    }
  }
  store.requestDraw();
  store.emit();

}
