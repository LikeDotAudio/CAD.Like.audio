import type { EditorStore } from '../EditorStore';

export function applyLoadedImage(store: EditorStore, img: HTMLImageElement): void {
  store.tracing = {
    img,
    x: 0,
    y: 0,
    worldWidth: store.units === 'mm' ? 254 : 10,
    opacity: 0.4,
    visible: true,
  };
  store.startCalibration();
  store.showHint(
    'Image loaded — click two points on it whose real distance you know, then enter that distance.',
    0,
  );

}
