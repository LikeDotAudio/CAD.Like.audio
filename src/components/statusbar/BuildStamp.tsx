import { BUILD_STAMP } from '../../build/buildInfo';

/** Revision of the running build, stamped at compile time. */
export function BuildStamp() {
  return (
    <span className="text-[11px] text-[#777]" title="Build revision — YYYYMMDD.HH.MM at compile time">
      {BUILD_STAMP}
    </span>
  );
}
