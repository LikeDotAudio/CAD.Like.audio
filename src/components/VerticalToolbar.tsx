import { useStore, useUi } from '../state/useEditor';
import { TOOLS } from '../tools/registry';

export function VerticalToolbar() {
  const store = useStore();
  const { toolId } = useUi();

  return (
    <div className="w-14 flex-shrink-0 border-r border-[#333] bg-[#252526] flex flex-col justify-between items-center py-0 select-none z-10 h-full">
      {/* Top: CAD Tool Buttons Grid (Square, No Padding, No Border) */}
      <div className="flex flex-col items-center w-full">
        <div className="grid grid-cols-2 gap-0 p-0 bg-[#1e1e1e] w-full">
          {TOOLS.map((tool) => {
            const isActive = tool.id === toolId;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => store.setTool(tool.id)}
                className={
                  'relative h-7 w-7 p-0 rounded-none border-0 flex items-center justify-center transition-colors cursor-pointer ' +
                  (isActive
                    ? 'bg-[#094771] text-white'
                    : 'bg-[#2d2d2d] text-[#cccccc] hover:bg-[#383838] hover:text-white')
                }
                title={tool.title}
              >
                <div className="h-4 w-4">{tool.icon}</div>
                <div className="absolute bottom-0 right-0 border-b-[3px] border-r-[3px] border-b-transparent border-r-[#888] w-0 h-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom: Zoom Controls (Square, No Padding, No Border) */}
      <div className="flex flex-col items-center w-full mb-1">
        <div className="w-full text-center font-mono text-[9px] uppercase tracking-wider text-[#777] py-0.5">
          ZOOM
        </div>
        <div className="grid grid-cols-2 gap-0 p-0 bg-[#1e1e1e] w-full">
          {/* Zoom In */}
          <button
            type="button"
            onClick={() => store.zoomIn()}
            className="h-7 w-7 p-0 rounded-none border-0 bg-[#2d2d2d] text-[#cccccc] hover:bg-[#383838] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Zoom In (+)"
          >
            <span className="text-[11px] font-bold">🔍+</span>
          </button>

          {/* Zoom Out */}
          <button
            type="button"
            onClick={() => store.zoomOut()}
            className="h-7 w-7 p-0 rounded-none border-0 bg-[#2d2d2d] text-[#cccccc] hover:bg-[#383838] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Zoom Out (-)"
          >
            <span className="text-[11px] font-bold">🔍-</span>
          </button>

          {/* Zoom Full / Fit */}
          <button
            type="button"
            onClick={() => store.zoomToFit()}
            className="col-span-2 h-7 w-full p-0 rounded-none border-0 bg-[#2d2d2d] text-[#cccccc] hover:bg-[#094771] hover:text-white flex items-center justify-center gap-1 transition-colors text-[10px] font-semibold uppercase tracking-wider cursor-pointer"
            title="Zoom Full Extent / Fit Drawing"
          >
            <span>🎯</span> Fit
          </button>
        </div>
      </div>
    </div>
  );
}
