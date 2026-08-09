export interface MenuBarButtonProps {
  label: string;
  open: boolean;
  onToggle: () => void;
}

/** The "File ▾" style trigger sitting in the header. */
export function MenuBarButton({ label, open, onToggle }: MenuBarButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={
        'rounded px-2.5 py-1 text-[12px] font-medium transition-colors ' +
        (open ? 'bg-[#f4902c] text-[#1e1e1e]' : 'text-[#ddd] hover:bg-[#333]')
      }
    >
      {label} ▾
    </button>
  );
}
