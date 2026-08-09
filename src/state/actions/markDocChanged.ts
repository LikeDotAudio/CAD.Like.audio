import type { EditorStore } from '../EditorStore';

export function markDocChanged(store: EditorStore): void {
  store.docVersion++;
  if (store.autoSaveTimer) clearTimeout(store.autoSaveTimer);
  store.autoSaveTimer = setTimeout(() => {
    void store.autoSaveSession();
  }, 500);

}
