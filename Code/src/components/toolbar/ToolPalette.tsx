import { TOOLS } from '../../tools/registry';
import { DrawingToolButton } from './buttons/DrawingToolButton';
import { PaletteGrid } from './PaletteGrid';

/** Every drawing tool from the registry, in registration order. */
export function ToolPalette() {
  return (
    <PaletteGrid>
      {TOOLS.map((tool) => (
        <DrawingToolButton key={tool.id} tool={tool} />
      ))}
    </PaletteGrid>
  );
}
