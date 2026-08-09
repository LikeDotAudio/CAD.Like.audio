import { GridPalette } from './GridPalette';
import { ToolPalette } from './ToolPalette';
import { ZoomPalette } from './ZoomPalette';

/** Left rail: drawing tools at the top, grid and zoom commands at the bottom. */
export function VerticalToolbar() {
  return (
    <div className="z-10 flex h-full w-14 flex-shrink-0 select-none flex-col justify-between border-r border-[#333] bg-[#252526] py-0">
      <div className="flex w-full flex-col items-center">
        <ToolPalette />
      </div>

      <div className="mb-1 flex w-full flex-col items-center">
        <GridPalette />
        <ZoomPalette />
      </div>
    </div>
  );
}
