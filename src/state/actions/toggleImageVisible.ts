import type { EditorStore } from '../EditorStore';

export function toggleImageVisible(store: EditorStore): void {
  if (!store.tracing) return;
  store.tracing.visible = !store.tracing.visible;
  store.requestDraw();
  store.emit();

}
