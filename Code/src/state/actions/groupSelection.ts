import type { EditorStore } from '../EditorStore';

export function groupSelection(store: EditorStore): void {
  if (store.selection.size <= 1) {
    store.showHint('Select 2 or more elements to group.', 3000);
    return;
  }
  store.history.push(store.doc.snapshot());
  const count = store.doc.groupSelected(store.selection);
  store.markDocChanged();
  store.requestDraw();
  store.emit();
  store.showHint(`Grouped ${count} element(s).`, 3000);

}
