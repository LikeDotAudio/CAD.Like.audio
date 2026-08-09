/** Struck-through grid — hides the grid entirely. */
export function GridOffIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M1 1h14v14H1z" opacity="0.5" />
      <path d="M6 1v14M11 1v14M1 6h14M1 11h14" opacity="0.25" />
      <path d="M2 14 14 2" strokeWidth="1.6" />
    </svg>
  );
}
