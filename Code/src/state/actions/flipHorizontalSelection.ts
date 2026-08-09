import type { EditorStore } from '../EditorStore';

export function flipHorizontalSelection(store: EditorStore): void {
  if (store.selection.size === 0) return;
  store.history.push(store.doc.snapshot());
  store.doc.flipHorizontal(store.selection);
  store.markDocChanged();
  store.requestDraw();
  store.emit();
  store.showHint(`Flipped ${store.selection.size} element(s) horizontally.`, 3000);

}
