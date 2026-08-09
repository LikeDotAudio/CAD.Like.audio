import type { EditorStore } from '../EditorStore';

export function setSnapToGrid(store: EditorStore, enabled: boolean): void {
  store.snapToGrid = enabled;
  store.requestDraw();
  store.emit();

}
