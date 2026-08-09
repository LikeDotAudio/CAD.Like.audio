import type { EditorStore } from '../EditorStore';

export function undo(store: EditorStore): void {
  const snapshot = store.history.pop();
  if (!snapshot) return;
  store.doc.restore(snapshot);
  store.selection.clear();
  store.hoverId = null;
  store.toolState = store.tool.createState();
  store.closeDynInput();
  store.markDocChanged();
  store.requestDraw();
  store.emit();

}
