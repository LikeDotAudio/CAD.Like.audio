import type { Units } from '../../../../core/types';
import { parseDxf } from '../../../../io/importDxf/parseDxf';
import type { PendingDxfImport } from './PendingDxfImport';

/** Sniff a DXF's units so the modal can pre-select them. Falls back to mm. */
export function dxfImportFromText(text: string, filename: string): PendingDxfImport {
  const parsed = parseDxf(text);
  return { text, filename, detectedUnit: (parsed.units as Units) || 'mm' };
}
