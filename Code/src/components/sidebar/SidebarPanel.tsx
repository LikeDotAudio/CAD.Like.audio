import { LayerListSection } from './layers/LayerListSection';
import { PropertyEditorSection } from './properties/PropertyEditorSection';

/** Right rail: layers above, property editor below. */
export function SidebarPanel() {
  return (
    <div className="flex h-full w-64 flex-shrink-0 select-none flex-col border-r border-[#333] bg-[#252526] font-sans text-[12px] text-[#cccccc]">
      <LayerListSection />
      <PropertyEditorSection />
    </div>
  );
}
