import type { EditorStore } from '../EditorStore';

export function setDynValue(store: EditorStore, key: string, raw: string): void {
  store.dynValues[key] = raw;
  const typed = store.resolveDyn();
  store.pointer = { ...store.pointer, world: typed ?? store.dynCursor };
  store.requestDraw();
  store.emit();

}
