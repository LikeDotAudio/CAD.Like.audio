import type { EditorStore } from '../EditorStore';

export function zoomOut(store: EditorStore): void {
  const cx = store.view.width ? store.view.width / 2 : 0;
  const cy = store.view.height ? store.view.height / 2 : 0;
  store.view.zoomAt(cx, cy, 0.77);
  store.requestDraw();
  store.emit();

}
