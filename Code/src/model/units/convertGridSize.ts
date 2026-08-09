import type { Units } from '../../core/types';

/** Round a converted grid size to something a human would have typed. */
export function convertGridSize(gridSize: number, to: Units): number {
  if (to === 'mm' || to === 'cm') return parseFloat(gridSize.toFixed(2));
  if (to === 'm') return parseFloat(gridSize.toFixed(3));
  return parseFloat(gridSize.toFixed(4));
}
