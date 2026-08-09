import type { EditorStore } from '../EditorStore';
import type { Point } from '../../core/types';

export function openDynInput(store: EditorStore, anchor: Point): void {
  if (!store.tool.dyn) return;
  store.dynAnchor = anchor;
  store.dynValues = {};
  store.dynMode = store.tool.dyn.modes?.[0] ?? '';
  store.emit();

}
