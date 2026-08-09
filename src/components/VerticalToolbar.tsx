import { useStore, useUi } from '../state/useEditor';
import { TOOLS } from '../tools/registry';

export function VerticalToolbar() {
  const store = useStore();
  const { toolId } = useUi();

  return (
    <div className="w-14 flex-shrink-0 border-r border-[#333] bg-[#252526] flex flex-col justify-between items-center py-2 select-none z-10 h-full">
      {/* Top: CAD Tool Buttons Grid (QCAD 2-column icon grid) */}
      <div className="flex flex-col items-center gap-1 w-full px-1">
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#1e1e1e] border border-[#333] rounded w-full">
          {TOOLS.map((tool) => {
            const isActive = tool.id === toolId;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => store.setTool(tool.id)}
                className={
                  'relative h-8 w-full rounded flex items-center justify-center transition-colors ' +
                  (isActive
                    ? 'bg-[#094771] border border-[#007acc] text-white shadow-xs'
                    : 'bg-[#2d2d2d] border border-[#3c3c3c] text-[#cccccc] hover:bg-[#383838] hover:text-white')
                }
                title={tool.title}
              >
                <div className="h-4 w-4">{tool.icon}</div>
                <div className="absolute bottom-0.5 right-0.5 border-b-4 border-r-4 border-b-transparent border-r-[#888] w-0 h-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom: Zoom & Magnification Controls */}
      <div className="flex flex-col items-center gap-1 w-full px-1 mb-1">
        <div className="w-full text-center font-mono text-[9px] uppercase tracking-wider text-[#777] mb-0.5">
          ZOOM
        </div>
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#1e1e1e] border border-[#333] rounded w-full">
          {/* Zoom In */}
          <button
            type="button"
            onClick={() => store.zoomIn()}
            className="h-8 w-full rounded bg-[#2d2d2d] border border-[#3c3c3c] text-[#cccccc] hover:bg-[#383838] hover:text-white flex items-center justify-center transition-colors"
            title="Zoom In (+)"
          >
            <span className="text-[11px] font-bold">🔍+</span>
          </button>

          {/* Zoom Out */}
          <button
            type="button"
            onClick={() => store.zoomOut()}
            className="h-8 w-full rounded bg-[#2d2d2d] border border-[#3c3c3c] text-[#cccccc] hover:bg-[#383838] hover:text-white flex items-center justify-center transition-colors"
            title="Zoom Out (-)"
          >
            <span className="text-[11px] font-bold">🔍-</span>
          </button>

          {/* Zoom Full / Fit */}
          <button
            type="button"
            onClick={() => store.zoomToFit()}
            className="col-span-2 h-7 w-full rounded bg-[#2d2d2d] border border-[#3c3c3c] text-[#cccccc] hover:bg-[#094771] hover:border-[#007acc] hover:text-white flex items-center justify-center gap-1 transition-colors text-[10px] font-semibold uppercase tracking-wider"
            title="Zoom Full Extent / Fit Drawing"
          >
            <span>🎯</span> Fit
          </button>
        </div>
      </div>
    </div>
  );
}
