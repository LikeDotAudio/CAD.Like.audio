import { useState, useEffect } from 'react';
import { useStore, useUi } from '../state/useEditor';

export function ContextMenu() {
  const store = useStore();
  const { selectionSize, layers, activeLayerId } = useUi();

  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [showLayerSubmenu, setShowLayerSubmenu] = useState(false);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'CANVAS') {
        e.preventDefault();
        setMenuPos({ x: e.clientX, y: e.clientY });
        setShowLayerSubmenu(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.context-menu')) {
        setMenuPos(null);
        setShowLayerSubmenu(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuPos(null);
        setShowLayerSubmenu(false);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!menuPos) return null;

  return (
    <div
      className="context-menu fixed z-50 w-52 rounded border border-[#454545] bg-[#252526] p-1 text-xs text-[#cccccc] shadow-2xl select-none"
      style={{ left: menuPos.x, top: menuPos.y }}
    >
      {/* Move Tool */}
      <button
        type="button"
        onClick={() => {
          store.setTool('select');
          setMenuPos(null);
        }}
        className="flex w-full items-center gap-2 px-3 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors"
      >
        <span>✋</span> Move / Select
      </button>

      <div className="my-0.5 border-t border-[#3c3c3c]" />

      {/* Cut */}
      <button
        type="button"
        disabled={selectionSize === 0}
        onClick={() => {
          store.cutSelection();
          setMenuPos(null);
        }}
        className={
          'flex w-full items-center justify-between px-3 py-1.5 rounded text-left transition-colors ' +
          (selectionSize > 0
            ? 'hover:bg-[#094771] hover:text-white text-[#ddd]'
            : 'opacity-40 cursor-not-allowed')
        }
      >
        <span className="flex items-center gap-2"><span>✂️</span> Cut</span>
        <span className="text-[10px] opacity-60">Ctrl+X</span>
      </button>

      {/* Copy */}
      <button
        type="button"
        disabled={selectionSize === 0}
        onClick={() => {
          store.copySelection();
          setMenuPos(null);
        }}
        className={
          'flex w-full items-center justify-between px-3 py-1.5 rounded text-left transition-colors ' +
          (selectionSize > 0
            ? 'hover:bg-[#094771] hover:text-white text-[#ddd]'
            : 'opacity-40 cursor-not-allowed')
        }
      >
        <span className="flex items-center gap-2"><span>📋</span> Copy</span>
        <span className="text-[10px] opacity-60">Ctrl+C</span>
      </button>

      {/* Copy from reference point */}
      <button
        type="button"
        disabled={selectionSize === 0}
        onClick={() => {
          store.copySelectionWithReference();
          setMenuPos(null);
        }}
        className={
          'flex w-full items-center justify-between px-3 py-1.5 rounded text-left transition-colors ' +
          (selectionSize > 0
            ? 'hover:bg-[#094771] hover:text-white text-[#ddd]'
            : 'opacity-40 cursor-not-allowed')
        }
      >
        <span className="flex items-center gap-2"><span>🎯</span> Copy from point</span>
        <span className="text-[10px] opacity-60">Ctrl+Shift+C</span>
      </button>

      {/* Paste */}
      <button
        type="button"
        onClick={() => {
          store.pasteClipboard();
          setMenuPos(null);
        }}
        className="flex w-full items-center justify-between px-3 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2"><span>📌</span> Paste</span>
        <span className="text-[10px] opacity-60">Ctrl+V</span>
      </button>

      {/* Delete */}
      <button
        type="button"
        disabled={selectionSize === 0}
        onClick={() => {
          store.deleteSelection();
          setMenuPos(null);
        }}
        className={
          'flex w-full items-center justify-between px-3 py-1.5 rounded text-left transition-colors ' +
          (selectionSize > 0
            ? 'hover:bg-[#094771] hover:text-white text-[#ddd]'
            : 'opacity-40 cursor-not-allowed')
        }
      >
        <span className="flex items-center gap-2"><span>🗑️</span> Delete</span>
        <span className="text-[10px] opacity-60">Del</span>
      </button>

      <div className="my-0.5 border-t border-[#3c3c3c]" />

      {/* Group */}
      <button
        type="button"
        disabled={selectionSize <= 1}
        onClick={() => {
          store.groupSelection();
          setMenuPos(null);
        }}
        className={
          'flex w-full items-center justify-between px-3 py-1.5 rounded text-left transition-colors ' +
          (selectionSize > 1
            ? 'hover:bg-[#094771] hover:text-white text-[#ddd]'
            : 'opacity-40 cursor-not-allowed')
        }
      >
        <span className="flex items-center gap-2"><span>📦</span> Group Elements</span>
        <span className="text-[10px] font-mono text-[#888]">GP</span>
      </button>

      {/* Ungroup (Explode) */}
      <button
        type="button"
        disabled={selectionSize === 0}
        onClick={() => {
          store.explodeSelection();
          setMenuPos(null);
        }}
        className={
          'flex w-full items-center justify-between px-3 py-1.5 rounded text-left transition-colors ' +
          (selectionSize > 0
            ? 'hover:bg-[#094771] hover:text-white text-[#ddd]'
            : 'opacity-40 cursor-not-allowed')
        }
      >
        <span className="flex items-center gap-2"><span>💥</span> Ungroup / Explode</span>
        <span className="text-[10px] font-mono text-[#888]">XP</span>
      </button>

      <div className="my-0.5 border-t border-[#3c3c3c]" />

      {/* Send to Layer Submenu */}
      <div
        className="relative"
        onMouseEnter={() => setShowLayerSubmenu(true)}
        onMouseLeave={() => setShowLayerSubmenu(false)}
      >
        <button
          type="button"
          disabled={selectionSize === 0}
          className={
            'flex w-full items-center justify-between px-3 py-1.5 rounded text-left transition-colors ' +
            (selectionSize > 0
              ? 'hover:bg-[#094771] hover:text-white text-[#ddd]'
              : 'opacity-40 cursor-not-allowed')
          }
        >
          <span className="flex items-center gap-2"><span>🥞</span> Send to Layer</span>
          <span>▶</span>
        </button>

        {showLayerSubmenu && selectionSize > 0 && (
          <div className="absolute left-full top-0 ml-1 w-44 rounded border border-[#454545] bg-[#252526] p-1 shadow-2xl flex flex-col gap-0.5 max-h-56 overflow-y-auto">
            {layers.map((layer) => (
              <button
                key={layer.id}
                type="button"
                onClick={() => {
                  store.setSelectionLayer(layer.id);
                  store.setActiveLayer(layer.id);
                  setMenuPos(null);
                }}
                className={
                  'flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-colors text-[11px] ' +
                  (layer.id === activeLayerId
                    ? 'bg-[#094771] text-white font-semibold'
                    : 'hover:bg-[#383838] text-[#ddd]')
                }
              >
                <span className="truncate">{layer.name}</span>
                <span
                  className="h-3 w-3 rounded-sm border border-[#555] flex-shrink-0"
                  style={{ backgroundColor: layer.color }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="my-0.5 border-t border-[#3c3c3c]" />

      {/* Zoom to Fit */}
      <button
        type="button"
        onClick={() => {
          store.zoomToFit();
          setMenuPos(null);
        }}
        className="flex w-full items-center gap-2 px-3 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors"
      >
        <span>🔍</span> Zoom to Fit Extent
      </button>

      {/* Select All */}
      <button
        type="button"
        onClick={() => {
          store.selectAll();
          setMenuPos(null);
        }}
        className="flex w-full items-center justify-between px-3 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2"><span>🔳</span> Select All</span>
        <span className="text-[10px] opacity-60">Ctrl+A</span>
      </button>

      {/* Deselect All */}
      <button
        type="button"
        onClick={() => {
          store.deselectAll();
          setMenuPos(null);
        }}
        className="flex w-full items-center justify-between px-3 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2"><span>🔲</span> Deselect All</span>
        <span className="text-[10px] opacity-60">Esc</span>
      </button>
    </div>
  );
}
