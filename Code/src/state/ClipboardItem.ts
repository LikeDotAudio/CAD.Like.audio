import type { Point } from '../core/types';

export interface ClipboardItem {
  type: 'line' | 'arc';
  p1: Point;
  p2: Point;
  cx?: number;
  cy?: number;
  r?: number;
  layerId?: string;
}
