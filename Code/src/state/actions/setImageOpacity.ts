import type { EditorStore } from '../EditorStore';

export function setImageOpacity(store: EditorStore, opacity: number): void {
  if (!store.tracing) return;
  store.tracing.opacity = opacity;
  store.requestDraw();
  store.emit();

}
