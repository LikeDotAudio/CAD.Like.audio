import type { EditorStore } from '../EditorStore';

export function toggleShapeMode(store: EditorStore): void {
  store.shapeMode = !store.shapeMode;
  store.requestDraw();
  store.emit();

}
