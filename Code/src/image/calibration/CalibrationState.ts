import type { Point } from '../../core/types';

/**
 * "Set scale from image": the user clicks two points whose real distance they
 * know, and everything is rescaled so that distance is correct.
 */
export interface CalibrationState {
  active: boolean;
  p1: Point | null;
  p2: Point | null;
}
