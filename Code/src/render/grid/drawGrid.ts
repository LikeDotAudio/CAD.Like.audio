import type { Scene } from '../Scene';
import { drawGridBackground } from './drawGridBackground';
import { drawGridDots } from './drawGridDots';
import { drawGridLines } from './drawGridLines';
import { drawWorldAxes } from './drawWorldAxes';
import { getGridLevels } from './getGridLevels';

/** Background, the grid itself in the active mode, then the world axes. */
export function drawGrid(scene: Scene): void {
  drawGridBackground(scene);

  const mode = scene.gridMode ?? 'lines';
  if (mode !== 'off') {
    const levels = getGridLevels(scene.gridSize, scene.view.zoom, 8);
    if (mode === 'dots') {
      drawGridDots(scene, levels);
    } else {
      drawGridLines(scene, levels);
    }
  }

  drawWorldAxes(scene);
}
