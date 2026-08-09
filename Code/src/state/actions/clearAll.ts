import type { EditorStore } from '../EditorStore';

export function clearAll(store: EditorStore): void {
  if (store.doc.isEmpty && !store.tool.isDrawing?.(store.toolState)) return;
  store.history.push(store.doc.snapshot());
  store.doc.clear();
  store.selection.clear();
  store.hoverId = null;
  store.toolState = store.tool.createState();
  store.closeDynInput();
  store.markDocChanged();
  store.requestDraw();
  store.emit();
  store.showHint('Cleared canvas.', 2000);

}
