import type { EditorStore } from '../EditorStore';

export function showHint(store: EditorStore, message: string, durationMs = 5000): void {
  store.hintText = message;
  store.hintVisible = true;
  if (store.hintTimer) clearTimeout(store.hintTimer);
  store.hintTimer = null;
  if (durationMs > 0) {
    store.hintTimer = setTimeout(() => {
      store.hintVisible = false;
      store.emit();
    }, durationMs);
  }
  store.emit();

}
