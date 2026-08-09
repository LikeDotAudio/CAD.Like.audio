import { ValidationPill } from '../ValidationPill';
import { CursorReadout } from './CursorReadout';
import { EdgeCountReadout } from './EdgeCountReadout';
import { MeasurementReadout } from './MeasurementReadout';

/** Bottom strip: cursor position, live measurement, validation and edge count. */
export function StatusBar() {
  return (
    <div className="flex flex-shrink-0 items-center gap-[18px] border-t border-[#333] bg-[#252526] px-4 py-1.5 font-mono text-xs text-[#888]">
      <CursorReadout />
      <MeasurementReadout />
      <ValidationPill />
      <EdgeCountReadout />
    </div>
  );
}
