import type { ValidationResult } from '../core/types';
import type { CalibrationState } from '../image/calibration';
import type { TracingImage } from '../image/TracingImage';
import type { AnyTool } from '../tools/types';
import type { Snap } from '../viewport/snap';
import { drawCalibration } from './calibration';
import { drawBadVertexMarkers, drawEdges } from './edges';
import { drawGrid } from './grid';
import { drawImageLayer } from './imageLayer';
import { drawBoundsOverlay, drawErrorBanner } from './overlays';
import type { Scene } from './Scene';
import { drawSnapIndicator } from './snapIndicator';

export interface FrameState {
  tool: AnyTool;
  toolState: object;
  selection: ReadonlySet<number>;
  hoverId: number | null;
  snap: Snap | null;
  tracing: TracingImage | null;
  calibration: CalibrationState;
  validation: ValidationResult;
}

/** Paint one frame, back to front. */
export function renderScene(scene: Scene, frame: FrameState): void {
  drawGrid(scene);
  drawBoundsOverlay(scene);
  drawImageLayer(scene, frame.tracing);
  drawCalibration(scene, frame.calibration);

  drawEdges(scene, {
    selected: frame.selection,
    hoverId: frame.hoverId,
    hoverEnabled: frame.tool.id === 'select',
  });
  drawBadVertexMarkers(scene);

  if (!frame.calibration.active) {
    frame.tool.drawPreview?.(frame.toolState, scene);
    const showSnap = frame.tool.showsSnapIndicator ?? frame.tool.snaps;
    if (showSnap) drawSnapIndicator(scene, frame.snap);
  }

  drawErrorBanner(scene, frame.validation);
}
