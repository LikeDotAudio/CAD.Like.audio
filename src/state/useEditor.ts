import { createContext, useContext, useSyncExternalStore } from 'react';
import type { EditorStore, UiState } from './EditorStore';

export const EditorContext = createContext<EditorStore | null>(null);

export function useStore(): EditorStore {
  const store = useContext(EditorContext);
  if (!store) throw new Error('useStore must be used inside <EditorContext.Provider>');
  return store;
}

/** Subscribe to the editor's derived UI state. */
export function useUi(): UiState {
  const store = useStore();
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}
