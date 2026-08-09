import { ZoomAllButton } from './buttons/ZoomAllButton';
import { ZoomInButton } from './buttons/ZoomInButton';
import { ZoomOutButton } from './buttons/ZoomOutButton';
import { PaletteGrid } from './PaletteGrid';
import { PaletteHeading } from './PaletteHeading';

/** Zoom in, zoom out, and zoom all. */
export function ZoomPalette() {
  return (
    <>
      <PaletteHeading label="Zoom" />
      <PaletteGrid>
        <ZoomInButton />
        <ZoomOutButton />
        <ZoomAllButton />
      </PaletteGrid>
    </>
  );
}
