import type { EditorStore } from '../EditorStore';

export function zoomIn(store: EditorStore): void {
  const cx = store.view.width ? store.view.width / 2 : 0;
  const cy = store.view.height ? store.view.height / 2 : 0;
  store.view.zoomAt(cx, cy, 1.3);
  store.requestDraw();
  store.emit();

}
