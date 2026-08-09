import { useState } from 'react';
import { useUi } from '../../../state/useUi';
import { LayerColorSwatch } from '../layers/LayerColorSwatch';
import { PropertyRow } from './PropertyRow';

/** Geometry takes its colour from its layer, so this edits the active layer's colour. */
export function ColorProperty() {
  const { layers, activeLayerId, selectionProtected } = useUi();
  const [pickerOpen, setPickerOpen] = useState(false);
  const activeLayer = layers.find((l) => l.id === activeLayerId);

  return (
    <PropertyRow label="Color:">
      <div
        className={
          'flex min-w-0 flex-1 items-center justify-between gap-2 rounded border border-[#3c3c3c] bg-[#2d2d2d] px-2 py-0.5 ' +
          (selectionProtected ? 'opacity-50' : '')
        }
      >
        <span className="truncate text-white">By Layer ({activeLayer?.name})</span>
        {activeLayer && !selectionProtected && (
          <LayerColorSwatch
            layerId={activeLayer.id}
            color={activeLayer.color}
            title={`Layer Color: ${activeLayer.color}`}
            open={pickerOpen}
            onToggle={() => setPickerOpen(!pickerOpen)}
            onPicked={() => setPickerOpen(false)}
          />
        )}
      </div>
    </PropertyRow>
  );
}
