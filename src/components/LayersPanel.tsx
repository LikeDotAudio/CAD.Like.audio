import { useState } from 'react';
import { STANDARD_DXF_COLORS } from '../core/dxfColors';
import { useStore, useUi } from '../state/useEditor';

export function LayersPanel() {
  const store = useStore();
  const { layers, activeLayerId } = useUi();
  const [collapsed, setCollapsed] = useState(false);
  const [newLayerName, setNewLayerName] = useState('');
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

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

  return (
    <div
      className={
        'fixed top-14 right-4 z-40 w-72 rounded-xl border border-rule bg-paper/95 p-3 backdrop-blur-md shadow-lg transition-all duration-200 ' +
        (collapsed ? 'h-11 overflow-hidden' : '')
      }
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-rule pb-2 mb-2 select-none">
        <div className="flex items-center gap-2">
          <span className="text-base">🥞</span>
          <h2 className="font-mono text-[12px] font-semibold uppercase tracking-wider text-ink">
            Layers ({layers.length})
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="rounded p-1 text-xs text-ink-3 hover:bg-paper-2 hover:text-ink transition-colors"
          title={collapsed ? 'Expand Layers Panel' : 'Collapse Panel'}
        >
          {collapsed ? '▼' : '▲'}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Active Layer Quick Selector / Add Layer Form */}
          <form onSubmit={handleAddLayer} className="mb-3 flex gap-1.5">
            <input
              type="text"
              placeholder="New layer name..."
              value={newLayerName}
              onChange={(e) => setNewLayerName(e.target.value)}
              className="flex-1 rounded-md border border-rule bg-paper px-2.5 py-1 text-[12px] text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newLayerName.trim()}
              className="rounded-md bg-accent px-3 py-1 text-[12px] font-semibold text-white transition-opacity hover:bg-accent-ink disabled:opacity-40"
            >
              + Add
            </button>
          </form>

          {/* Layer List */}
          <div className="max-h-60 overflow-y-auto space-y-1 pr-0.5">
            {layers.map((layer) => {
              const isActive = layer.id === activeLayerId;
              const isEditing = editingLayerId === layer.id;

              return (
                <div
                  key={layer.id}
                  className={
                    'group relative flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[12px] transition-colors ' +
                    (isActive
                      ? 'bg-accent/10 border border-accent/30 text-ink font-medium'
                      : 'hover:bg-paper-2 border border-transparent text-ink-2')
                  }
                >
                  {/* Left: Active indicator + Visibility toggle */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => store.setActiveLayer(layer.id)}
                      className={
                        'h-2.5 w-2.5 rounded-full flex-shrink-0 transition-transform ' +
                        (isActive ? 'scale-125 ring-2 ring-accent/40' : 'opacity-40 hover:opacity-100')
                      }
                      style={{ backgroundColor: layer.color }}
                      title={isActive ? 'Active drawing layer' : `Switch active layer to ${layer.name}`}
                    />

                    <button
                      type="button"
                      onClick={() => store.toggleLayerVisibility(layer.id)}
                      className="text-xs text-ink-3 hover:text-ink flex-shrink-0 transition-colors"
                      title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                    >
                      {layer.visible ? '👁️' : '🕶️'}
                    </button>

                    {/* Name (editable) */}
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
                        className="w-full rounded border border-accent bg-paper px-1 py-0.5 text-[12px] text-ink focus:outline-none"
                      />
                    ) : (
                      <span
                        onClick={() => store.setActiveLayer(layer.id)}
                        onDoubleClick={() => {
                          setEditingLayerId(layer.id);
                          setEditingName(layer.name);
                        }}
                        className={
                          'truncate cursor-pointer select-none ' +
                          (!layer.visible ? 'line-through opacity-50' : '')
                        }
                        title={`Double-click to rename. Active: ${isActive ? 'Yes' : 'No'}`}
                      >
                        {layer.name}
                      </span>
                    )}
                  </div>

                  {/* Right: Color swatch button */}
                  <div className="relative flex items-center gap-1.5 ml-2">
                    <button
                      type="button"
                      onClick={() =>
                        setShowColorPicker(showColorPicker === layer.id ? null : layer.id)
                      }
                      className="h-4 w-4 rounded border border-rule shadow-xs hover:scale-110 transition-transform"
                      style={{ backgroundColor: layer.color }}
                      title="Change layer color"
                    />

                    {/* Color Swatch Popup */}
                    {showColorPicker === layer.id && (
                      <div className="absolute right-0 top-6 z-50 p-2 rounded-lg border border-rule bg-paper shadow-xl grid grid-cols-5 gap-1.5 w-36">
                        {STANDARD_DXF_COLORS.map((c) => (
                          <button
                            key={c.aci}
                            type="button"
                            onClick={() => {
                              store.setLayerColor(layer.id, c.hex);
                              setShowColorPicker(null);
                            }}
                            className="h-5 w-5 rounded border border-rule transition-transform hover:scale-125"
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

          {/* Quick action for selected elements */}
          <div className="mt-2.5 pt-2 border-t border-rule flex items-center justify-between text-[11px] text-ink-3">
            <span>Move selected:</span>
            <select
              value={activeLayerId}
              onChange={(e) => store.setSelectionLayer(e.target.value)}
              className="rounded border border-rule bg-paper px-2 py-0.5 text-[11px] text-ink focus:border-accent focus:outline-none"
            >
              {layers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
}
