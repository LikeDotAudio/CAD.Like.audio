import { useStore } from '../../../state/useStore';
import { useUi } from '../../../state/useUi';
import { PropertyRow } from './PropertyRow';

/** Protected geometry cannot be cut, deleted or restyled. */
export function ProtectedProperty() {
  const store = useStore();
  const { selectionSize, selectionProtected } = useUi();

  return (
    <PropertyRow label="Protected:">
      <select
        disabled={selectionSize === 0}
        value={selectionProtected ? 'yes' : 'no'}
        onChange={(e) => store.setSelectionProtected(e.target.value === 'yes')}
        className="flex-1 rounded border border-[#3c3c3c] bg-[#2d2d2d] px-2 py-0.5 text-white focus:border-[#007acc] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="no">No</option>
        <option value="yes">Yes (Locked)</option>
      </select>
    </PropertyRow>
  );
}
