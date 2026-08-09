import type { EditorStore } from '../EditorStore';

export function deselectAll(store: EditorStore): void {
  store.selection.clear();
  store.hoverId = null;
  store.requestDraw();
  store.emit();

}
