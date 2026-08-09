import type { EditorStore } from '../EditorStore';

export function toggleLayerLock(store: EditorStore, id: string): void {
  const layer = store.layers.get(id);
  if (!layer) return;
  layer.locked = !layer.locked;
  store.requestDraw();
  store.emit();

}
