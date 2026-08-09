export interface PaletteHeadingProps {
  label: string;
}

/** Small caps label above a group of palette buttons. */
export function PaletteHeading({ label }: PaletteHeadingProps) {
  return (
    <div className="w-full py-0.5 text-center font-mono text-[9px] uppercase tracking-wider text-[#777]">
      {label}
    </div>
  );
}
