import { useContext } from 'react';
import { EditorContext } from './EditorContext';
import type { EditorStore } from './EditorStore';

/** The editor store, for imperative calls out of event handlers. */
export function useStore(): EditorStore {
  const store = useContext(EditorContext);
  if (!store) throw new Error('useStore must be used inside <EditorContext.Provider>');
  return store;
}
