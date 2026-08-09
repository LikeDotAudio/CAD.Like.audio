import type { DynUi } from '../UiState';
import type { EditorStore } from '../EditorStore';

export function buildDynUi(store: EditorStore): DynUi | null {
  const dyn = store.tool.dyn;
  if (!dyn || !store.dynAnchor) return null;
  return {
    anchor: store.dynAnchor,
    fields: dyn.fields(store.toolState).map((f) => ({
      key: f.key,
      label: f.label,
      placeholder: dyn.placeholder(store.toolState, f.key, store.dynMode, store.dynCursor, store.units),
      value: store.dynValues[f.key] ?? '',
    })),
    mode: dyn.modes ? store.dynMode : null,
    modeLabel: dyn.modeLabel ? dyn.modeLabel(store.dynMode) : null,
  };

}
