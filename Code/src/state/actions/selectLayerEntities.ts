import type { EditorStore } from '../EditorStore';

export function selectLayerEntities(store: EditorStore, id: string): void {
  store.selection.clear();
  for (const e of store.doc.edges.values()) {
    if (e.layerId === id) {
      store.selection.add(e.id);
    }
  }
  store.requestDraw();
  store.emit();
  store.showHint(`Selected ${store.selection.size} entity(ies) on layer "${id}".`, 3000);

}
