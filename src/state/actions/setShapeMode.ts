import type { EditorStore } from '../EditorStore';

export function setShapeMode(store: EditorStore, enabled: boolean): void {
  store.shapeMode = enabled;
  store.requestDraw();
  store.emit();

}
