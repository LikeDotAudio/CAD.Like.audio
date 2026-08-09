import { formatLength } from '../../model/units/formatLength';
import { useUi } from '../../state/useUi';

/** Live cursor position in document units. */
export function CursorReadout() {
  const { cursor, units } = useUi();

  return (
    <span className="tracking-[0.02em] text-[#cccccc]">
      x: {formatLength(cursor.x, units)}&nbsp;&nbsp;y: {formatLength(cursor.y, units)}
    </span>
  );
}
