import type { EditorStore } from '../EditorStore';

export function unlockAllLayers(store: EditorStore): void {
  for (const layer of store.layers.values()) {
    layer.locked = false;
  }
  store.requestDraw();
  store.emit();

}
