import type { EditorStore } from '../EditorStore';

export function setLayerColor(store: EditorStore, id: string, color: string): void {
  const layer = store.layers.get(id);
  if (!layer) return;
  layer.color = color;
  store.requestDraw();
  store.emit();

}
