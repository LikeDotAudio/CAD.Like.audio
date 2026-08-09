import { useState, useRef, useEffect } from 'react';
import { useStore, useUi } from '../state/useEditor';
import { UnitToggle } from './UnitToggle';
import { GridControls } from './GridControls';

export function Toolbar() {
  const store = useStore();
  const { canExport, shapeMode, units, gridSize, snapToGrid } = useUi();
  const fileRef = useRef<HTMLInputElement>(null);
  const dxfFileRef = useRef<HTMLInputElement>(null);

  const [activeMenu, setActiveMenu] = useState<'file' | 'edit' | 'drawing' | null>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.menu-container')) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-shrink-0 items-center justify-between border-b border-[#333] bg-[#252526] px-4 py-1.5 text-xs text-[#cccccc] select-none z-30">
      {/* Left section: App Title + Top Menu Headers */}
      <div className="flex items-center gap-4 menu-container">
        <h1 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-white">
          CAD.LIKE.AUDIO
        </h1>

        <div className="flex items-center gap-1">
          {/* File Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
              className={
                'px-2.5 py-1 rounded text-[12px] font-medium transition-colors ' +
                (activeMenu === 'file' ? 'bg-[#094771] text-white' : 'hover:bg-[#333] text-[#ddd]')
              }
            >
              File ▾
            </button>
            {activeMenu === 'file' && (
              <div className="absolute left-0 top-7 z-50 w-48 rounded border border-[#454545] bg-[#252526] p-1 shadow-xl flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    dxfFileRef.current?.click();
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors text-[12px]"
                >
                  <span>📂</span> Open DXF...
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    fileRef.current?.click();
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors text-[12px]"
                >
                  <span>🖼️</span> Import Image...
                </button>
                <div className="my-1 border-t border-[#3c3c3c]" />
                <button
                  type="button"
                  disabled={!canExport}
                  onClick={() => {
                    setActiveMenu(null);
                    void store.exportDxf();
                  }}
                  className={
                    'flex items-center gap-2 px-3 py-1.5 rounded text-left transition-colors text-[12px] ' +
                    (canExport
                      ? 'hover:bg-[#094771] hover:text-white text-white'
                      : 'opacity-40 cursor-not-allowed')
                  }
                >
                  <span>⬇️</span> Download DXF
                </button>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
              className={
                'px-2.5 py-1 rounded text-[12px] font-medium transition-colors ' +
                (activeMenu === 'edit' ? 'bg-[#094771] text-white' : 'hover:bg-[#333] text-[#ddd]')
              }
            >
              Edit ▾
            </button>
            {activeMenu === 'edit' && (
              <div className="absolute left-0 top-7 z-50 w-44 rounded border border-[#454545] bg-[#252526] p-1 shadow-xl flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    store.undo();
                  }}
                  className="flex items-center justify-between px-3 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors text-[12px]"
                >
                  <span className="flex items-center gap-2"><span>↩</span> Undo</span>
                  <span className="text-[10px] opacity-60">Ctrl+Z</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    store.clearAll();
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors text-[12px]"
                >
                  <span>✕</span> Clear All
                </button>
              </div>
            )}
          </div>

          {/* Drawing Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveMenu(activeMenu === 'drawing' ? null : 'drawing')}
              className={
                'px-2.5 py-1 rounded text-[12px] font-medium transition-colors ' +
                (activeMenu === 'drawing' ? 'bg-[#094771] text-white' : 'hover:bg-[#333] text-[#ddd]')
              }
            >
              Drawing ▾
            </button>
            {activeMenu === 'drawing' && (
              <div className="absolute left-0 top-7 z-50 w-60 rounded border border-[#454545] bg-[#252526] p-2.5 shadow-xl flex flex-col gap-3">
                {/* Units Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#aaa]">Units:</span>
                  <div className="flex bg-[#1e1e1e] rounded p-0.5 border border-[#3c3c3c]">
                    <button
                      type="button"
                      onClick={() => store.setUnits('in')}
                      className={
                        'px-2 py-0.5 text-[11px] rounded transition-colors ' +
                        (units === 'in' ? 'bg-[#007acc] text-white font-bold' : 'text-[#888] hover:text-white')
                      }
                    >
                      inch
                    </button>
                    <button
                      type="button"
                      onClick={() => store.setUnits('mm')}
                      className={
                        'px-2 py-0.5 text-[11px] rounded transition-colors ' +
                        (units === 'mm' ? 'bg-[#007acc] text-white font-bold' : 'text-[#888] hover:text-white')
                      }
                    >
                      mm
                    </button>
                  </div>
                </div>

                {/* Grid Size */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#aaa]">Grid Size:</span>
                  <input
                    type="number"
                    step="0.05"
                    min="0.01"
                    value={gridSize}
                    onChange={(e) => store.setGridSize(parseFloat(e.target.value))}
                    className="w-20 bg-[#1e1e1e] border border-[#3c3c3c] rounded px-2 py-0.5 text-center text-white text-[11px] focus:outline-none focus:border-[#007acc]"
                  />
                </div>

                {/* Snap Function */}
                <label className="flex items-center justify-between cursor-pointer select-none">
                  <span className="text-[11px] text-[#aaa]">Snap Function:</span>
                  <input
                    type="checkbox"
                    checked={snapToGrid}
                    onChange={(e) => store.setSnapToGrid(e.target.checked)}
                    className="h-4 w-4 rounded border-[#3c3c3c] bg-[#1e1e1e] accent-[#007acc]"
                  />
                </label>

                <div className="border-t border-[#3c3c3c]" />

                {/* Shape Mode Toggle */}
                <label className="flex items-center justify-between cursor-pointer select-none bg-[#1e1e1e] p-2 rounded border border-[#3c3c3c]">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-white">SHPE Mode</span>
                    <span className="text-[9px] text-[#888]">Closed shape validation</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={shapeMode}
                    onChange={(e) => store.setShapeMode(e.target.checked)}
                    className="h-4 w-4 rounded border-[#3c3c3c] bg-[#1e1e1e] accent-[#007acc]"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden File Inputs */}
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

      {/* Right section: Quick status bar / controls */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => store.toggleShapeMode()}
          className={
            'px-2 py-0.5 rounded text-[11px] font-mono font-medium tracking-wide transition-colors border ' +
            (shapeMode
              ? 'bg-[#007acc]/20 border-[#007acc] text-[#38bdf8]'
              : 'bg-[#333]/40 border-[#555] text-[#aaa] hover:text-white')
          }
          title="Toggle Shape Validation Mode"
        >
          SHPE: {shapeMode ? 'ON' : 'OFF'}
        </button>

        <UnitToggle />
        <GridControls />

        <button
          type="button"
          disabled={!canExport}
          onClick={() => void store.exportDxf()}
          className={
            'px-3 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ' +
            (canExport
              ? 'bg-[#0e639c] text-white hover:bg-[#1177bb]'
              : 'bg-[#333] text-[#666] cursor-not-allowed')
          }
        >
          ⬇ Download DXF
        </button>
      </div>
    </div>
  );
}

