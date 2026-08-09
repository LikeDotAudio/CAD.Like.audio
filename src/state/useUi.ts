import { useSyncExternalStore } from 'react';
import type { UiState } from './EditorStore';
import { useStore } from './useStore';

/** Subscribe to the editor's derived UI state. */
export function useUi(): UiState {
  const store = useStore();
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}
