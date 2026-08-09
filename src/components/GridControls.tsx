import { useStore, useUi } from '../state/useEditor';
import { LABEL_CAPS, NUMBER_INPUT } from './styles';

export function GridControls() {
  const store = useStore();
  const { gridSize, snapToGrid } = useUi();

  return (
    <>
      <label className={LABEL_CAPS} htmlFor="grid-size">
        Grid
      </label>
      <input
        id="grid-size"
        type="number"
        step="0.05"
        min="0.01"
        value={gridSize}
        onChange={(e) => store.setGridSize(parseFloat(e.target.value))}
        className={NUMBER_INPUT}
      />
      <label className={`${LABEL_CAPS} flex items-center gap-1.5`}>
        <input
          type="checkbox"
          checked={snapToGrid}
          onChange={(e) => store.setSnapToGrid(e.target.checked)}
          className="h-3.5 w-3.5 cursor-pointer accent-ink"
        />
        Snap
      </label>
    </>
  );
}
