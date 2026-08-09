import type { EditorStore } from '../EditorStore';
import type { UiState } from '../UiState';

export function buildUi(store: EditorStore): UiState {
  const validation = store.validation();
  return {
    toolId: store.toolId,
    units: store.units,
    gridSize: store.gridSize,
    gridMode: store.gridMode,
    snapToGrid: store.snapToGrid,
    cursor: store.pointer.world,
    edgeCount: store.doc.edgeCount,
    validation,
    shapeMode: store.shapeMode,
    canExport: !store.doc.isEmpty && (!store.shapeMode || validation.valid),
    hint: { text: store.hintText, visible: store.hintVisible },
    measurement: store.measurement,
    tracing: store.tracing
      ? {
          visible: store.tracing.visible,
          opacity: store.tracing.opacity,
          worldWidth: store.tracing.worldWidth,
        }
      : null,
    calibrationActive: store.calibration.active,
    calibrationBox: store.calibrationBox,
    dyn: store.buildDynUi(),
    layers: Array.from(store.layers.values()),
    activeLayerId: store.activeLayerId,
    selectionSize: store.selection.size,
    selectionProtected:
      store.selection.size > 0
        ? Array.from(store.selection).every((id) => store.doc.edge(id)?.protected)
        : false,
  };

}
