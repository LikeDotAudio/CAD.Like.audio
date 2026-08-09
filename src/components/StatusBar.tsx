import { formatLength } from '../model/units';
import { useUi } from '../state/useEditor';
import { ValidationPill } from './ValidationPill';

export function StatusBar() {
  const { cursor, units, edgeCount, measurement } = useUi();

  return (
    <div className="flex flex-shrink-0 items-center gap-[18px] border-t border-[#333] bg-[#252526] px-4 py-1.5 font-mono text-xs text-[#888]">
      <span className="tracking-[0.02em] text-[#cccccc]">
        x: {formatLength(cursor.x, units)}&nbsp;&nbsp;y: {formatLength(cursor.y, units)}
      </span>
      {measurement && <span className="font-semibold text-[#4ade80]">{measurement}</span>}
      <ValidationPill />
      <span className="tracking-[0.04em] text-[#aaa]">
        {edgeCount} edge{edgeCount === 1 ? '' : 's'}
      </span>
      <span className="ml-auto text-[11px] text-[#777]">
        Pan: middle-drag or Space+drag · Shift=ortho · S L P V R C E B M · Delete · Ctrl+Z · Ctrl+A
      </span>
    </div>
  );
}
