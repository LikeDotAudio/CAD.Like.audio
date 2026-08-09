import type { Units } from '../../../../core/types';

/** A DXF held between picking the file and confirming its units in the modal. */
export interface PendingDxfImport {
  text: string;
  filename: string;
  detectedUnit: Units;
}
