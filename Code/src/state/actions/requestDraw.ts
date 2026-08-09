import type { EditorStore } from '../EditorStore';

export function requestDraw(store: EditorStore): void {
  if (store.frameHandle) return;
  store.frameHandle = requestAnimationFrame(() => {
    store.frameHandle = 0;
    store.render();
  });

}
