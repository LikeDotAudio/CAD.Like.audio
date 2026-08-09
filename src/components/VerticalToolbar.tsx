import { useStore, useUi } from '../state/useEditor';
import { TOOLS } from '../tools/registry';

export function VerticalToolbar() {
  const store = useStore();
  const { toolId } = useUi();

  return (
    <div className="w-14 flex-shrink-0 border-r border-[#333] bg-[#252526] flex flex-col items-center py-2 gap-1 select-none z-10">
      {/* CAD Tool Buttons Grid (QCAD 2-column icon grid) */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-[#1e1e1e] border border-[#333] rounded">
        {TOOLS.map((tool) => {
          const isActive = tool.id === toolId;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => store.setTool(tool.id)}
              className={
                'relative h-8 w-8 rounded flex items-center justify-center transition-colors ' +
                (isActive
                  ? 'bg-[#094771] border border-[#007acc] text-white shadow-xs'
                  : 'bg-[#2d2d2d] border border-[#3c3c3c] text-[#cccccc] hover:bg-[#383838] hover:text-white')
              }
              title={tool.title}
            >
              <div className="h-4 w-4">{tool.icon}</div>
              {/* Corner fold triangle mimicking QCAD tool menu indicator */}
              <div className="absolute bottom-0.5 right-0.5 border-b-4 border-r-4 border-b-transparent border-r-[#888] w-0 h-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
