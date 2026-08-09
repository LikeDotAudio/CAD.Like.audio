import type { EditorStore } from '../EditorStore';

export function handleWheel(store: EditorStore, e: WheelEvent): void {
  e.preventDefault();
  const screen = store.canvasPoint(e);
  store.view.zoomAt(screen.x, screen.y, e.deltaY < 0 ? 1.12 : 0.89);
  store.updatePointer(e, screen);
  store.requestDraw();
  store.emit();

}
