import type { EditorStore } from '../EditorStore';

export function edit(store: EditorStore, mutate: () => boolean): void {
  const before = store.doc.snapshot();
  if (mutate()) {
    store.history.push(before);
    store.markDocChanged();
  }
  store.requestDraw();
  store.emit();

}
