import type { CalibrationState } from './CalibrationState';

/** The not-calibrating state. */
export function idleCalibration(): CalibrationState {
  return { active: false, p1: null, p2: null };
}
