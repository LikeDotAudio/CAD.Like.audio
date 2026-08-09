import type { EditorStore } from '../EditorStore';

export function cycleDynMode(store: EditorStore): void {
  const modes = store.tool.dyn?.modes;
  if (!modes?.length) return;
  const i = modes.indexOf(store.dynMode);
  store.dynMode = modes[(i + 1) % modes.length]!;
  const typed = store.resolveDyn();
  store.pointer = { ...store.pointer, world: typed ?? store.dynCursor };
  store.requestDraw();
  store.emit();

}
