/**
 * Standard AutoCAD Color Index (ACI) table mapping for common CAD colors.
 * Maps DXF color index (1-255) to CSS hex colors.
 */
export const ACI_COLOR_MAP: Record<number, string> = {
  1: '#ff0000', // Red
  2: '#ffff00', // Yellow
  3: '#00ff00', // Green
  4: '#00ffff', // Cyan
  5: '#0000ff', // Blue
  6: '#ff00ff', // Magenta
  7: '#1a1a1a', // White/Black (renders dark gray on white canvas)
  8: '#808080', // Dark Gray
  9: '#c0c0c0', // Light Gray
  10: '#ff0000',
  30: '#ff7f00', // Orange
  40: '#ffd700', // Gold
  50: '#00ff00',
  80: '#00ff7f',
  130: '#007fff',
  170: '#7f00ff',
  210: '#ff007f',
};

/** Palette of standard DXF colors for user selection. */
export const STANDARD_DXF_COLORS: { name: string; aci: number; hex: string }[] = [
  { name: 'Red', aci: 1, hex: '#ef4444' },
  { name: 'Yellow', aci: 2, hex: '#eab308' },
  { name: 'Green', aci: 3, hex: '#22c55e' },
  { name: 'Cyan', aci: 4, hex: '#06b6d4' },
  { name: 'Blue', aci: 5, hex: '#3b82f6' },
  { name: 'Magenta', aci: 6, hex: '#d946ef' },
  { name: 'White/Black', aci: 7, hex: '#1e293b' },
  { name: 'Orange', aci: 30, hex: '#f97316' },
  { name: 'Purple', aci: 170, hex: '#8b5cf6' },
  { name: 'Gray', aci: 8, hex: '#64748b' },
];

export function aciToHex(aci?: number): string {
  if (!aci || aci <= 0) return '#1e293b';
  if (ACI_COLOR_MAP[aci]) return ACI_COLOR_MAP[aci];

  // Rough approximation for full 255 ACI color wheel
  const hue = Math.floor(((aci % 10) * 36) % 360);
  return `hsl(${hue}, 80%, 45%)`;
}
