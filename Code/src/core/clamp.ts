/** Constrain `v` to the inclusive range [lo, hi]. */
export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
