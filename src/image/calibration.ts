import type { Point } from '../core/types';

/**
 * "Set scale from image": the user clicks two points whose real distance they
 * know, and everything is rescaled so that distance is correct.
 */
export interface CalibrationState {
  active: boolean;
  p1: Point | null;
  p2: Point | null;
}

export function idleCalibration(): CalibrationState {
  return { active: false, p1: null, p2: null };
}

/**
 * The factor to multiply all geometry by so the two picked points end up
 * `realDistance` apart. Returns null when the points are too close to be a
 * usable reference.
 */
export function calibrationFactor(cal: CalibrationState, realDistance: number): number | null {
  if (!cal.p1 || !cal.p2 || !(realDistance > 0)) return null;
  const worldDistance = Math.hypot(cal.p2.x - cal.p1.x, cal.p2.y - cal.p1.y);
  if (worldDistance < 1e-9) return null;
  return realDistance / worldDistance;
}
