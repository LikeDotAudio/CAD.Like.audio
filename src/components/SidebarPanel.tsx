import { useState } from 'react';
import { useStore, useUi } from '../state/useEditor';
import { STANDARD_DXF_COLORS } from '../core/dxfColors';
import { LayerContextMenu } from './LayerContextMenu';
import type { Layer } from '../core/types';

export function SidebarPanel() {
  const store = useStore();
  const { layers, activeLayerId, selectionSize, selectionProtected } = useUi();
  const [newLayerName, setNewLayerName] = useState('');
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; layer: Layer } | null>(
    null,
  );

  const handleAddLayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLayerName.trim()) return;
    store.addLayer(newLayerName.trim());
    setNewLayerName('');
  };

  const handleRename = (id: string) => {
    if (editingName.trim() && editingName.trim() !== id) {
      store.renameLayer(id, editingName.trim());
    }
    setEditingLayerId(null);
  };

  const activeLayer = layers.find((l) => l.id === activeLayerId);

  return (
    <div className="w-64 flex-shrink-0 border-r border-[#333] bg-[#252526] flex flex-col h-full text-[#cccccc] text-[12px] select-none font-sans">
      {/* -------------------- LAYER LIST -------------------- */}
      <div className="flex flex-col flex-1 min-h-[220px] max-h-[50%] border-b border-[#333]">
        {/* Layer List Title Bar */}
        <div className="flex items-center justify-between bg-[#2d2d2d] px-2.5 py-1.5 border-b border-[#3b3b3b]">
          <span className="font-semibold text-[11px] uppercase tracking-wider text-[#999]">Layer List</span>
          <div className="flex items-center gap-1 text-[11px]">
            <button
              type="button"
              onClick={() => {
                const name = prompt('New layer name:');
                if (name) store.addLayer(name);
              }}
              className="px-1.5 py-0.5 rounded bg-[#3c3c3c] hover:bg-[#4a4a4a] text-white"
              title="Add Layer"
            >
              +
            </button>
          </div>
        </div>

        {/* Action Toolbar Icons (QCAD style) */}
        <div className="flex items-center gap-1 px-2 py-1 bg-[#2a2a2a] border-b border-[#333]">
          <button
            type="button"
            onClick={() => layers.forEach((l) => !l.visible && store.toggleLayerVisibility(l.id))}
            className="p-1 hover:bg-[#383838] rounded text-[11px]"
            title="Show All Layers"
          >
            👁️ Show All
          </button>
          <button
            type="button"
            onClick={() => layers.forEach((l) => l.visible && store.toggleLayerVisibility(l.id))}
            className="p-1 hover:bg-[#383838] rounded text-[11px]"
            title="Hide All Layers"
          >
            🕶️ Hide All
          </button>
        </div>

        {/* Add Layer Inline Input */}
        <form onSubmit={handleAddLayer} className="p-1.5 bg-[#252526] border-b border-[#333] flex gap-1">
          <input
            type="text"
            placeholder="Layer name..."
            value={newLayerName}
            onChange={(e) => setNewLayerName(e.target.value)}
            className="flex-1 bg-[#1e1e1e] border border-[#3c3c3c] rounded px-2 py-0.5 text-[11px] text-white focus:outline-none focus:border-[#007acc]"
          />
          <button
            type="submit"
            disabled={!newLayerName.trim()}
            className="px-2 py-0.5 bg-[#0e639c] text-white rounded text-[11px] hover:bg-[#1177bb] disabled:opacity-40"
          >
            +
          </button>
        </form>

        {/* Layers Scrollable View */}
        <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
          {layers.map((layer) => {
            const isActive = layer.id === activeLayerId;
            const isEditing = editingLayerId === layer.id;

            return (
              <div
                key={layer.id}
                className={
                  'flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-colors ' +
                  (isActive ? 'bg-[#094771] text-white' : 'hover:bg-[#2a2d2e] text-[#cccccc]')
                }
                onClick={() => store.setActiveLayer(layer.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ x: e.clientX, y: e.clientY, layer });
                }}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {/* Active Indicator Dot */}
                  <div
                    className={
                      'h-2 w-2 rounded-full flex-shrink-0 transition-transform ' +
                      (isActive ? 'bg-[#007acc] scale-125' : 'bg-transparent border border-[#666]')
                    }
                    title={isActive ? 'Active Layer' : 'Click to set active'}
                  />

                  {/* Visibility Toggle */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      store.toggleLayerVisibility(layer.id);
                    }}
                    className="text-[11px] hover:opacity-100 flex-shrink-0"
                  >
                    {layer.visible ? '👁️' : '🕶️'}
                  </button>

                  {/* Layer Name */}
                  {isEditing ? (
                    <input
                      type="text"
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleRename(layer.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(layer.id);
                        if (e.key === 'Escape') setEditingLayerId(null);
                      }}
                      className="w-full bg-[#1e1e1e] border border-[#007acc] px-1 py-0 text-[11px] text-white focus:outline-none"
                    />
                  ) : (
                    <span
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditingLayerId(layer.id);
                        setEditingName(layer.name);
                      }}
                      className={'truncate font-mono text-[11px] ' + (!layer.visible ? 'line-through opacity-40' : '')}
                    >
                      {layer.name}
                    </span>
                  )}
                </div>

                {/* Far Right: Color Swatch */}
                <div className="relative flex items-center flex-shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowColorPicker(showColorPicker === layer.id ? null : layer.id);
                    }}
                    className="h-3.5 w-3.5 rounded-sm border border-[#555] flex-shrink-0 hover:scale-110 transition-transform"
                    style={{ backgroundColor: layer.color }}
                    title={`Change color for layer ${layer.name}`}
                  />

                  {/* Color Swatch Popup */}
                  {showColorPicker === layer.id && (
                    <div
                      className="absolute right-0 top-5 z-50 p-2 rounded border border-[#454545] bg-[#252526] shadow-2xl grid grid-cols-5 gap-1.5 w-36"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {STANDARD_DXF_COLORS.map((c) => (
                        <button
                          key={c.aci}
                          type="button"
                          onClick={() => {
                            store.setLayerColor(layer.id, c.hex);
                            setShowColorPicker(null);
                          }}
                          className="h-5 w-5 rounded border border-[#444] hover:scale-110 transition-transform"
                          style={{ backgroundColor: c.hex }}
                          title={`${c.name} (ACI ${c.aci})`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* -------------------- PROPERTY EDITOR -------------------- */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#252526]">
        {/* Title Bar */}
        <div className="flex items-center justify-between bg-[#2d2d2d] px-2.5 py-1.5 border-b border-[#3b3b3b]">
          <span className="font-semibold text-[11px] uppercase tracking-wider text-[#999]">Property Editor</span>
        </div>

        <div className="p-3 space-y-3 overflow-y-auto flex-1 text-[11px]">
          {/* Selection Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[#888]">Selection:</label>
            <div className="bg-[#1e1e1e] border border-[#3c3c3c] rounded px-2 py-1 text-white flex justify-between items-center">
              <span>{selectionSize > 0 ? `${selectionSize} Element(s)` : 'No Selection'}</span>
              <span className="text-[#666]">▼</span>
            </div>
          </div>

          {/* General Properties Box */}
          <div className="border border-[#333] bg-[#1e1e1e] rounded p-2.5 space-y-2">
            <div className="text-[#aaa] font-semibold mb-1 text-[10px] uppercase tracking-wider">General Properties</div>

            {/* Layer Property */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#888] w-24">Layer:</span>
              <select
                disabled={selectionProtected}
                value={activeLayerId}
                onChange={(e) => {
                  const targetLayer = e.target.value;
                  store.setActiveLayer(targetLayer);
                  if (selectionSize > 0) {
                    store.setSelectionLayer(targetLayer);
                  }
                }}
                className="flex-1 bg-[#2d2d2d] border border-[#3c3c3c] rounded px-2 py-0.5 text-white focus:outline-none focus:border-[#007acc] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {layers.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Property */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#888] w-24">Color:</span>
              <div className={'flex-1 flex items-center justify-between gap-2 bg-[#2d2d2d] border border-[#3c3c3c] rounded px-2 py-0.5 ' + (selectionProtected ? 'opacity-50' : '')}>
                <span className="text-white truncate">By Layer ({activeLayer?.name})</span>
                <button
                  type="button"
                  disabled={selectionProtected}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (activeLayer && !selectionProtected) {
                      setShowColorPicker(showColorPicker === activeLayer.id ? null : activeLayer.id);
                    }
                  }}
                  className="h-3.5 w-3.5 rounded-sm border border-[#555] flex-shrink-0 hover:scale-110 transition-transform cursor-pointer disabled:cursor-not-allowed"
                  style={{ backgroundColor: activeLayer?.color || '#fff' }}
                  title={`Layer Color: ${activeLayer?.color}`}
                />
              </div>
            </div>

            {/* Lineweight */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#888] w-24">Lineweight:</span>
              <select disabled={selectionProtected} className="flex-1 bg-[#2d2d2d] border border-[#3c3c3c] rounded px-2 py-0.5 text-[#aaa] disabled:opacity-50 disabled:cursor-not-allowed">
                <option>— By Layer</option>
                <option>0.15 mm</option>
                <option>0.25 mm</option>
                <option>0.50 mm</option>
              </select>
            </div>

            {/* Linetype */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#888] w-24">Linetype:</span>
              <select disabled={selectionProtected} className="flex-1 bg-[#2d2d2d] border border-[#3c3c3c] rounded px-2 py-0.5 text-[#aaa] disabled:opacity-50 disabled:cursor-not-allowed">
                <option>Continuous</option>
                <option>Dashed</option>
                <option>Dotted</option>
              </select>
            </div>

            {/* Linetype Scale */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#888] w-24">Linetype Scale:</span>
              <input
                type="text"
                readOnly
                value="1.0"
                className="flex-1 bg-[#252526] border border-[#3c3c3c] rounded px-2 py-0.5 text-[#777]"
              />
            </div>

            {/* Draw Order */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#888] w-24">Draw Order:</span>
              <input
                type="text"
                readOnly
                value="0"
                className="flex-1 bg-[#252526] border border-[#3c3c3c] rounded px-2 py-0.5 text-[#777]"
              />
            </div>

            {/* Handle */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#888] w-24">Handle:</span>
              <input
                type="text"
                readOnly
                value={selectionSize > 0 ? '0x1A' : ''}
                className="flex-1 bg-[#252526] border border-[#3c3c3c] rounded px-2 py-0.5 text-[#777] font-mono"
              />
            </div>

            {/* Protected */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#888] w-24">Protected:</span>
              <select
                disabled={selectionSize === 0}
                value={selectionProtected ? 'yes' : 'no'}
                onChange={(e) => store.setSelectionProtected(e.target.value === 'yes')}
                className="flex-1 bg-[#2d2d2d] border border-[#3c3c3c] rounded px-2 py-0.5 text-white focus:outline-none focus:border-[#007acc] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="no">No</option>
                <option value="yes">Yes (Locked)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Layer Right-Click Context Menu */}
      {contextMenu && (
        <LayerContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          targetLayer={contextMenu.layer}
          onClose={() => setContextMenu(null)}
          onEditLayer={(layer) => {
            setEditingLayerId(layer.id);
            setEditingName(layer.name);
          }}
          onAddLayerPrompt={() => {
            const name = window.prompt('Enter new layer name:');
            if (name && name.trim()) {
              store.addLayer(name.trim());
            }
          }}
        />
      )}
    </div>
  );
}
