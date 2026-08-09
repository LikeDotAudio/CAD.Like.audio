import type { EditorStore } from '../EditorStore';

export function zoomToFit(store: EditorStore): void {
  const bounds = store.doc.bounds();
  if (bounds) {
    store.view.zoomToFit(bounds);
    store.requestDraw();
    store.emit();
    store.showHint('Zoomed to fit drawing extent.', 2000);
  }

}
