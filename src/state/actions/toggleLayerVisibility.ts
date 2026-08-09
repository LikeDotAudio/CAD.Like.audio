import type { EditorStore } from '../EditorStore';

export function toggleLayerVisibility(store: EditorStore, id: string): void {
  const layer = store.layers.get(id);
  if (!layer) return;
  layer.visible = !layer.visible;
  store.requestDraw();
  store.emit();

}
