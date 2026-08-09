import { useStore } from '../../../state/useStore';
import { ZoomInIcon } from '../icons/ZoomInIcon';
import { PaletteButton } from '../PaletteButton';

/** Step the zoom in about the canvas centre. */
export function ZoomInButton() {
  const store = useStore();

  return (
    <PaletteButton title="Zoom In" onSelect={() => store.zoomIn()}>
      <div className="h-4 w-4">
        <ZoomInIcon />
      </div>
    </PaletteButton>
  );
}
