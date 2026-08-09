import type { EditorStore } from '../EditorStore';

export function setActiveLayer(store: EditorStore, id: string): void {
  if (store.layers.has(id)) {
    store.activeLayerId = id;
    store.emit();
  }

}
