import { useRef } from 'react';
import { useStore, useUi } from '../state/useEditor';
import { GridControls } from './GridControls';
import { UnitToggle } from './UnitToggle';
import { BTN, SEPARATOR } from './styles';

const ImportIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="1" y="3" width="14" height="10" rx="1" />
    <circle cx="5.5" cy="6.5" r="1.2" />
    <path d="M1 11l4-4 3 3 2-2 4 4" />
  </svg>
);

export function Toolbar() {
  const store = useStore();
  const { canExport } = useUi();
  const fileRef = useRef<HTMLInputElement>(null);
  const dxfFileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-shrink-0 flex-wrap items-center gap-2.5 border-b border-rule bg-paper px-4 py-2.5">
      <h1 className="mr-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-ink-3">
        CAD.LIKE.AUDIO
      </h1>
      <span className={SEPARATOR} />

      <button
        type="button"
        className={BTN}
        title="Open a DXF vector drawing"
        onClick={() => dxfFileRef.current?.click()}
      >
        📂 Open DXF
      </button>
      <input
        ref={dxfFileRef}
        type="file"
        accept=".dxf"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) void store.importDxf(file);
        }}
      />

      <button
        type="button"
        className={BTN}
        title="Import an image as a tracing layer"
        onClick={() => fileRef.current?.click()}
      >
        {ImportIcon}
        Import Image
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) void store.importImage(file);
        }}
      />

      <span className={SEPARATOR} />
      <UnitToggle />
      <GridControls />

      <span className={SEPARATOR} />
      <button type="button" className={BTN} onClick={() => store.undo()}>
        ↩ Undo
      </button>
      <button type="button" className={BTN} onClick={() => store.clearAll()}>
        ✕ Clear
      </button>

      <button
        type="button"
        disabled={!canExport}
        title={canExport ? 'Download DXF file' : 'Draw a closed shape first'}
        onClick={() => void store.exportDxf()}
        className={
          'ml-auto inline-flex items-center gap-1.5 rounded-lg px-[18px] py-[9px] ' +
          'text-[13px] font-semibold transition-colors ' +
          (canExport
            ? 'cursor-pointer bg-accent text-white hover:bg-accent-ink'
            : 'cursor-not-allowed bg-rule text-ink-3')
        }
      >
        ⬇ Download DXF
      </button>
    </div>
  );
}
