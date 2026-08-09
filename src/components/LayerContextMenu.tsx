import { useEffect } from 'react';
import type { Layer } from '../core/types';
import { useStore } from '../state/useEditor';

interface LayerContextMenuProps {
  x: number;
  y: number;
  targetLayer: Layer;
  onClose: () => void;
  onEditLayer: (layer: Layer) => void;
  onAddLayerPrompt: () => void;
}

export function LayerContextMenu({
  x,
  y,
  targetLayer,
  onClose,
  onEditLayer,
  onAddLayerPrompt,
}: LayerContextMenuProps) {
  const store = useStore();

  useEffect(() => {
    const handleOutsideClick = () => {
      onClose();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      style={{ top: y, left: x }}
      className="fixed z-50 w-56 rounded-lg border border-[#454545] bg-[#252526] p-1 text-xs text-[#cccccc] shadow-2xl select-none"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Target Layer Header */}
      <div className="px-3 py-1 font-mono text-[10px] uppercase font-bold text-[#888] border-b border-[#3c3c3c] flex items-center justify-between mb-0.5">
        <span className="truncate">Layer: {targetLayer.name}</span>
        <span
          className="h-2.5 w-2.5 rounded-sm border border-[#555]"
          style={{ backgroundColor: targetLayer.color }}
        />
      </div>

      {/* Toggle Visibility (YV) */}
      <button
        type="button"
        onClick={() => {
          store.toggleLayerVisibility(targetLayer.id);
          onClose();
        }}
        className="flex w-full items-center justify-between px-3 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>{targetLayer.visible ? '👁️' : '🕶️'}</span> Toggle Visibility
        </span>
        <span className="font-mono text-[10px] text-[#777]">YV</span>
      </button>

      {/* Toggle Lock Status (YL) */}
      <button
        type="button"
        onClick={() => {
          store.toggleLayerLock(targetLayer.id);
          onClose();
        }}
        className="flex w-full items-center justify-between px-3 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>{targetLayer.locked ? '🔒' : '🔓'}</span> Toggle Lock Status
        </span>
        <span className="font-mono text-[10px] text-[#777]">YL</span>
      </button>

      {/* Show Only Active (YO) */}
      <button
        type="button"
        onClick={() => {
          store.showOnlyActiveLayer();
          onClose();
        }}
        className="flex w-full items-center justify-between px-3 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>📇</span> Show Only Active
        </span>
        <span className="font-mono text-[10px] text-[#777]">YO</span>
      </button>

      {/* Show All Layers (YS) */}
      <button
        type="button"
        onClick={() => {
          store.showAllLayers();
          onClose();
        }}
        className="flex w-full items-center justify-between px-3 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>👁️</span> Show All Layers
        </span>
        <span className="font-mono text-[10px] text-[#777]">YS</span>
      </button>

      {/* Hide All Layers (YH) */}
      <button
        type="button"
        onClick={() => {
          store.hideAllLayers();
          onClose();
        }}
        className="flex w-full items-center justify-between px-3 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>👁️‍🗨️</span> Hide All Layers
        </span>
        <span className="font-mono text-[10px] text-[#777]">YH</span>
      </button>

      <div className="my-1 border-t border-[#3c3c3c]" />

      {/* Lock All Layers (YK) */}
      <button
        type="button"
        onClick={() => {
          store.lockAllLayers();
          onClose();
        }}
        className="flex w-full items-center justify-between px-3 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>🔒</span> Lock All Layers
        </span>
        <span className="font-mono text-[10px] text-[#777]">YK</span>
      </button>

      {/* Unlock All Layers (YN) */}
      <button
        type="button"
        onClick={() => {
          store.unlockAllLayers();
          onClose();
        }}
        className="flex w-full items-center justify-between px-3 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>🔓</span> Unlock All Layers
        </span>
        <span className="font-mono text-[10px] text-[#777]">YN</span>
      </button>

      <div className="my-1 border-t border-[#3c3c3c]" />

      {/* Add Layer... (YA) */}
      <button
        type="button"
        onClick={() => {
          onAddLayerPrompt();
          onClose();
        }}
        className="flex w-full items-center justify-between px-3 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>➕</span> Add Layer...
        </span>
        <span className="font-mono text-[10px] text-[#777]">YA</span>
      </button>

      {/* Delete Layer (YR) */}
      <button
        type="button"
        onClick={() => {
          store.deleteLayer(targetLayer.id);
          onClose();
        }}
        className="flex w-full items-center justify-between px-3 py-1.5 rounded text-left hover:bg-[#991b1b] hover:text-white text-[#f87171] transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>➖</span> Delete Layer
        </span>
        <span className="font-mono text-[10px] text-[#777]">YR</span>
      </button>

      {/* Edit Layer... (YE) */}
      <button
        type="button"
        onClick={() => {
          onEditLayer(targetLayer);
          onClose();
        }}
        className="flex w-full items-center justify-between px-3 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>✏️</span> Edit Layer...
        </span>
        <span className="font-mono text-[10px] text-[#777]">YE</span>
      </button>

      <div className="my-1 border-t border-[#3c3c3c]" />

      {/* Select Layer Entities (YC) */}
      <button
        type="button"
        onClick={() => {
          store.selectLayerEntities(targetLayer.id);
          onClose();
        }}
        className="flex w-full items-center justify-between px-3 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>📐</span> Select Layer Entities
        </span>
        <span className="font-mono text-[10px] text-[#777]">YC</span>
      </button>

      {/* Deselect Layer Entities (YD) */}
      <button
        type="button"
        onClick={() => {
          store.deselectLayerEntities(targetLayer.id);
          onClose();
        }}
        className="flex w-full items-center justify-between px-3 py-1.5 rounded text-left hover:bg-[#094771] hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>📑</span> Deselect Layer Entities
        </span>
        <span className="font-mono text-[10px] text-[#777]">YD</span>
      </button>
    </div>
  );
}
