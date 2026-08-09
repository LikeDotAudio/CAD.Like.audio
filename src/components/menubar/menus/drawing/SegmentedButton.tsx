export interface SegmentedButtonProps {
  label: string;
  active: boolean;
  onSelect: () => void;
}

/** One segment of a small pill-style toggle group inside the Drawing menu. */
export function SegmentedButton({ label, active, onSelect }: SegmentedButtonProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        'rounded px-2 py-0.5 text-[11px] font-semibold transition-colors ' +
        (active ? 'bg-[#007acc] text-white' : 'text-[#888] hover:text-white')
      }
    >
      {label}
    </button>
  );
}
