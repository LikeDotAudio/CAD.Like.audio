import type { EditorStore } from '../EditorStore';
import { idleCalibration } from '../../image/calibration/idleCalibration';

export function cancelCalibration(store: EditorStore): void {
  store.calibration = idleCalibration();
  store.calibrationBox = null;
  store.setCursor(store.tool.cursor);
  store.hintVisible = false;
  store.requestDraw();
  store.emit();

}
