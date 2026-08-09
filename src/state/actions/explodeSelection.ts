import type { EditorStore } from '../EditorStore';

export function explodeSelection(store: EditorStore): void {
  if (store.selection.size === 0) return;
  store.history.push(store.doc.snapshot());
  const count = store.doc.explodeSelected(store.selection);
  store.markDocChanged();
  store.requestDraw();
  store.emit();
  store.showHint(`Exploded ${count} element group(s).`, 3000);

}
