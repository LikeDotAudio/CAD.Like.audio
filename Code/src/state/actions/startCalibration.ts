import type { EditorStore } from '../EditorStore';

export function startCalibration(store: EditorStore): void {
  store.calibration = { active: true, p1: null, p2: null };
  store.calibrationBox = null;
  store.setCursor('crosshair');
  store.showHint('Click the first point on the image for scale calibration.', 0);
  store.requestDraw();
  store.emit();

}
