import type { EditorStore } from '../EditorStore';

export async function loadRecentImage(store: EditorStore, dataUrl: string): Promise<void> {
  const img = new Image();
  img.src = dataUrl;
  await new Promise((resolve) => {
    img.onload = resolve;
  });
  store.applyLoadedImage(img);

}
