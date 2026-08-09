import type { Units } from '../../core/types';

/** Suggested download name, tagged with the drawing's units. */
export function dxfFileName(units: Units): string {
  return `my-part-${units}.dxf`;
}
