import { useState, useRef, useEffect } from 'react';
import { useStore, useUi } from '../state/useEditor';
import { getRecentFiles, clearRecentFiles, type RecentFileEntry } from '../io/recentFiles';
import { ImportUnitModal } from './ImportUnitModal';
import { parseDxf } from '../io/importDxf';
import type { Units } from '../core/types';

export function Toolbar() {
  const store = useStore();
  const { canExport, shapeMode, units, gridSize, snapToGrid } = useUi();
  const fileRef = useRef<HTMLInputElement>(null);
  const dxfFileRef = useRef<HTMLInputElement>(null);

  const [activeMenu, setActiveMenu] = useState<'file' | 'edit' | 'drawing' | null>(null);
  const [recentFiles, setRecentFiles] = useState<RecentFileEntry[]>([]);
  const [showRecentSubmenu, setShowRecentSubmenu] = useState(false);
  const [pendingDxfImport, setPendingDxfImport] = useState<{
    text: string;
    filename: string;
    detectedUnit: Units;
  } | null>(null);

  // Sync recent files when File menu is toggled
  useEffect(() => {
    if (activeMenu === 'file') {
      setRecentFiles(getRecentFiles());
    }
  }, [activeMenu]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.menu-container')) {
        setActiveMenu(null);
        setShowRecentSubmenu(false);
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

                {/* Recent Files Submenu */}
                <div
                  className="relative"
                  onMouseEnter={() => setShowRecentSubmenu(true)}
                  onMouseLeave={() => setShowRecentSubmenu(false)}
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors text-[12px]"
                  >
                    <span className="flex items-center gap-2"><span>🕒</span> Recent Files</span>
                    <span>▶</span>
                  </button>

                  {showRecentSubmenu && (
                    <div className="absolute left-full top-0 ml-1 w-56 rounded border border-[#454545] bg-[#252526] p-1 shadow-2xl flex flex-col gap-0.5 max-h-64 overflow-y-auto">
                      {recentFiles.length === 0 ? (
                        <div className="px-3 py-2 text-[11px] text-[#777] italic">No recent files cached</div>
                      ) : (
                        <>
                          {recentFiles.map((entry) => (
                            <button
                              key={entry.id}
                              type="button"
                              onClick={() => {
                                setActiveMenu(null);
                                setShowRecentSubmenu(false);
                                if (entry.type === 'dxf') {
                                  const parsed = parseDxf(entry.data);
                                  setPendingDxfImport({
                                    text: entry.data,
                                    filename: entry.name,
                                    detectedUnit: (parsed.units as Units) || 'mm',
                                  });
                                } else {
                                  void store.loadRecentFile(entry);
                                }
                              }}
                              className="flex items-center justify-between px-2.5 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors text-[11px]"
                            >
                              <span className="truncate flex items-center gap-1.5 min-w-0">
                                <span>{entry.type === 'dxf' ? '📂' : '🖼️'}</span>
                                <span className="truncate">{entry.name}</span>
                              </span>
                              <span className="text-[9px] text-[#777] ml-2 flex-shrink-0">
                                {new Date(entry.timestamp).toLocaleDateString()}
                              </span>
                            </button>
                          ))}
                          <div className="my-0.5 border-t border-[#3c3c3c]" />
                          <button
                            type="button"
                            onClick={() => {
                              clearRecentFiles();
                              setRecentFiles([]);
                            }}
                            className="flex items-center gap-2 px-2.5 py-1 rounded text-left hover:bg-[#991b1b] hover:text-white text-[#f87171] transition-colors text-[10px]"
                          >
                            <span>🗑️</span> Clear Recent Files
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

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
              <div className="absolute left-0 top-7 z-50 w-52 rounded border border-[#454545] bg-[#252526] p-1 shadow-xl flex flex-col gap-0.5">
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
                <div className="my-0.5 border-t border-[#3c3c3c]" />
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    store.cutSelection();
                  }}
                  className="flex items-center justify-between px-3 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors text-[12px]"
                >
                  <span className="flex items-center gap-2"><span>✂️</span> Cut</span>
                  <span className="text-[10px] opacity-60">Ctrl+X</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    store.copySelection();
                  }}
                  className="flex items-center justify-between px-3 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors text-[12px]"
                >
                  <span className="flex items-center gap-2"><span>📋</span> Copy</span>
                  <span className="text-[10px] opacity-60">Ctrl+C</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    store.pasteClipboard();
                  }}
                  className="flex items-center justify-between px-3 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors text-[12px]"
                >
                  <span className="flex items-center gap-2"><span>📌</span> Paste</span>
                  <span className="text-[10px] opacity-60">Ctrl+V</span>
                </button>
                <div className="my-0.5 border-t border-[#3c3c3c]" />
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    store.selectAll();
                  }}
                  className="flex items-center justify-between px-3 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors text-[12px]"
                >
                  <span className="flex items-center gap-2"><span>🔳</span> Select All</span>
                  <span className="text-[10px] opacity-60">Ctrl+A</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    store.deselectAll();
                  }}
                  className="flex items-center justify-between px-3 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors text-[12px]"
                >
                  <span className="flex items-center gap-2"><span>🔲</span> Deselect All</span>
                  <span className="text-[10px] opacity-60">Esc</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    store.deleteSelection();
                  }}
                  className="flex items-center justify-between px-3 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors text-[12px]"
                >
                  <span className="flex items-center gap-2"><span>🗑️</span> Delete Selected</span>
                  <span className="text-[10px] opacity-60">Del</span>
                </button>
                <div className="my-0.5 border-t border-[#3c3c3c]" />
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    store.clearAll();
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors text-[12px]"
                >
                  <span>✕</span> Clear Canvas
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

                {/* Zoom to Fit */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    store.zoomToFit();
                  }}
                  className="flex items-center justify-between bg-[#1e1e1e] p-2 rounded border border-[#3c3c3c] text-[11px] font-semibold text-white hover:bg-[#094771] transition-colors"
                >
                  <span className="flex items-center gap-2">🔍 Zoom to Fit Extent</span>
                </button>

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
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) {
            const text = await file.text();
            const parsed = parseDxf(text);
            setPendingDxfImport({
              text,
              filename: file.name,
              detectedUnit: (parsed.units as Units) || 'mm',
            });
          }
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

      {/* Unit Conversion Modal */}
      {pendingDxfImport && (
        <ImportUnitModal
          filename={pendingDxfImport.filename}
          detectedUnit={pendingDxfImport.detectedUnit}
          onConfirm={(sourceUnit, targetUnit) => {
            void store.loadDxfText(
              pendingDxfImport.text,
              pendingDxfImport.filename,
              sourceUnit,
              targetUnit,
            );
            setPendingDxfImport(null);
          }}
          onCancel={() => setPendingDxfImport(null)}
        />
      )}
    </div>
  );
}

