import type { EditorStore } from '../EditorStore';

export function lockAllLayers(store: EditorStore): void {
  for (const layer of store.layers.values()) {
    layer.locked = true;
  }
  store.requestDraw();
  store.emit();

}
