import type { EditorStore } from '../EditorStore';

export function cancelBasePointPick(store: EditorStore): void {
  if (!store.pickingBasePoint) return;
  store.pickingBasePoint = false;
  store.setCursor(store.tool.cursor);
  store.showHint('Copy from reference point cancelled.', 2000);
  store.requestDraw();

}
