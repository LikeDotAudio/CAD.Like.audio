import type { EditorStore } from '../EditorStore';
import type { GridMode } from '../../core/types';

export function setGridMode(store: EditorStore, mode: GridMode): void {
  store.gridMode = mode;
  store.requestDraw();
  store.emit();

}
