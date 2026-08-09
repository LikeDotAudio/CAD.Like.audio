import type { EditorStore } from '../EditorStore';

export function setGridSize(store: EditorStore, size: number): void {
  store.gridSize = size > 0 ? size : 0.1;
  store.requestDraw();
  store.emit();

}
