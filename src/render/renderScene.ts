import type { Layer, ValidationResult } from '../core/types';
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
  shapeMode?: boolean;
  layers?: ReadonlyMap<string, Layer>;
  /** True while Ctrl+Shift+C waits for the reference point click. */
  pickingBasePoint?: boolean;
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
    layers: frame.layers,
  });

  if (frame.shapeMode) {
    drawBadVertexMarkers(scene);
  }

  if (!frame.calibration.active) {
    if (!frame.pickingBasePoint) frame.tool.drawPreview?.(frame.toolState, scene);
    const showSnap = frame.pickingBasePoint || (frame.tool.showsSnapIndicator ?? frame.tool.snaps);
    if (showSnap) drawSnapIndicator(scene, frame.snap);
  }

  if (frame.shapeMode) {
    drawErrorBanner(scene, frame.validation);
  }
}
