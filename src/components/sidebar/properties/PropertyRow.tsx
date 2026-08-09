export interface PropertyRowProps {
  label: string;
  children: React.ReactNode;
}

/** Label on the left, control on the right — the property editor's grid. */
export function PropertyRow({ label, children }: PropertyRowProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="w-24 text-[#888]">{label}</span>
      {children}
    </div>
  );
}
