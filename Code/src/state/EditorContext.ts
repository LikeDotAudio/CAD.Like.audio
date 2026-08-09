import { createContext } from 'react';
import type { EditorStore } from './EditorStore';

/** Provides the single EditorStore instance to the component tree. */
export const EditorContext = createContext<EditorStore | null>(null);
