import type { ReactNode } from 'react';

export interface PaletteGridProps {
  children: ReactNode;
}

/** Two-column grid the palette buttons sit in. */
export function PaletteGrid({ children }: PaletteGridProps) {
  return <div className="grid w-full grid-cols-2 gap-0 bg-[#1e1e1e] p-0">{children}</div>;
}
