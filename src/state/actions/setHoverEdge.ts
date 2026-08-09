import type { EditorStore } from '../EditorStore';

export function setHoverEdge(store: EditorStore, id: number | null): void {
  if (store.hoverId === id) return;
  store.hoverId = id;
  store.requestDraw();

}
