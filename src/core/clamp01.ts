import { clamp } from './clamp';

/** Constrain `v` to the inclusive range [0, 1]. */
export const clamp01 = (v: number) => clamp(v, 0, 1);
