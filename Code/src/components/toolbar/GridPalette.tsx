import { GridDotsButton } from './buttons/GridDotsButton';
import { GridLinesButton } from './buttons/GridLinesButton';
import { GridOffButton } from './buttons/GridOffButton';
import { PaletteGrid } from './PaletteGrid';
import { PaletteHeading } from './PaletteHeading';

/** Grid display mode — lines, dots, or hidden. One button per mode. */
export function GridPalette() {
  return (
    <>
      <PaletteHeading label="Grid" />
      <PaletteGrid>
        <GridLinesButton />
        <GridDotsButton />
        <GridOffButton />
      </PaletteGrid>
    </>
  );
}
