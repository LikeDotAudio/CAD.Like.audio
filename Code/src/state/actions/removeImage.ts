import type { EditorStore } from '../EditorStore';

export function removeImage(store: EditorStore): void {
  store.tracing = null;
  store.imageDrag = null;
  if (store.calibration.active) store.cancelCalibration();
  store.requestDraw();
  store.emit();

}
