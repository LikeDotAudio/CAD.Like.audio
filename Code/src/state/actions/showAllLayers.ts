import type { EditorStore } from '../EditorStore';

export function showAllLayers(store: EditorStore): void {
  for (const layer of store.layers.values()) {
    layer.visible = true;
  }
  store.requestDraw();
  store.emit();

}
