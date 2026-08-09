import type { EditorStore } from '../EditorStore';

export function hideAllLayers(store: EditorStore): void {
  for (const layer of store.layers.values()) {
    if (layer.id !== store.activeLayerId) {
      layer.visible = false;
    }
  }
  store.requestDraw();
  store.emit();

}
