import type { EditorStore } from '../EditorStore';

export function showOnlyActiveLayer(store: EditorStore): void {
  for (const layer of store.layers.values()) {
    layer.visible = layer.id === store.activeLayerId;
  }
  store.requestDraw();
  store.emit();

}
