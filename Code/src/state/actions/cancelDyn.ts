import type { EditorStore } from '../EditorStore';

export function cancelDyn(store: EditorStore): void {
  store.tool.onEscape?.(store.toolState, store.api);
  store.closeDynInput();
  store.requestDraw();
  store.emit();

}
