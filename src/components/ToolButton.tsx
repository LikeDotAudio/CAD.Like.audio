import { useStore } from '../state/useEditor';
import type { AnyTool } from '../tools/types';
import { BTN_ACTIVE, BTN_BASE, BTN_IDLE } from './styles';

interface Props {
  tool: AnyTool;
  active: boolean;
}

export function ToolButton({ tool, active }: Props) {
  const store = useStore();
  return (
    <button
      type="button"
      title={tool.title}
      aria-pressed={active}
      onClick={() => store.setTool(tool.id)}
      className={`${BTN_BASE} ${active ? BTN_ACTIVE : BTN_IDLE}`}
    >
      {tool.icon}
      {tool.label}
    </button>
  );
}
