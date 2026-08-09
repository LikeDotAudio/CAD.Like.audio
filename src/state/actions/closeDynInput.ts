import type { EditorStore } from '../EditorStore';

export function closeDynInput(store: EditorStore): void {
  if (!store.dynAnchor) return;
  store.dynAnchor = null;
  store.dynValues = {};
  store.emit();

}
