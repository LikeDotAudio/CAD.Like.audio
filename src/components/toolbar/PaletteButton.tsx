import type { ReactNode } from 'react';

export interface PaletteButtonProps {
  title: string;
  active?: boolean;
  /** Span both columns of the palette grid. */
  wide?: boolean;
  onSelect: () => void;
  children: ReactNode;
}

/**
 * One square cell in the left palette. Drawing tools and view commands both
 * render through this so the grid stays visually uniform.
 */
export function PaletteButton({ title, active = false, wide = false, onSelect, children }: PaletteButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={active}
      onClick={onSelect}
      className={
        'flex h-7 cursor-pointer items-center justify-center rounded-none border-0 p-0 transition-colors ' +
        (wide ? 'col-span-2 w-full ' : 'w-7 ') +
        (active
          ? 'bg-[#f4902c] text-[#1e1e1e]'
          : 'bg-[#2d2d2d] text-[#cccccc] hover:bg-[#383838] hover:text-white')
      }
    >
      {children}
    </button>
  );
}
