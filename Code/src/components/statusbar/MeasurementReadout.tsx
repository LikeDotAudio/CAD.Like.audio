import { useUi } from '../../state/useUi';

/** Whatever the active tool is measuring right now, if anything. */
export function MeasurementReadout() {
  const { measurement } = useUi();
  if (!measurement) return null;
  return <span className="font-semibold text-[#4ade80]">{measurement}</span>;
}
