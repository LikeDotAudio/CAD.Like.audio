import type { EditorStore } from '../EditorStore';

export function setCursor(store: EditorStore, cursor: string): void {
  if (store.canvas) store.canvas.style.cursor = cursor;

}
