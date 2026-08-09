import type { EditorStore } from '../EditorStore';

export function emit(store: EditorStore): void {
  store.uiSnapshot = store.buildUi();
  for (const listener of store.listeners) listener();

}
