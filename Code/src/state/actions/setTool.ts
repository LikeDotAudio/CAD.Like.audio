import type { EditorStore } from '../EditorStore';
import type { ToolId } from '../../core/types';
import { getTool } from '../../tools/registry';

export function setTool(store: EditorStore, id: ToolId): void {
  if (id === store.toolId) return;
  store.tool.onEscape?.(store.toolState, store.api);
  store.toolId = id;
  store.tool = getTool(id);
  store.toolState = store.tool.createState();
  store.selection.clear();
  store.hoverId = null;
  store.measurement = null;
  store.closeDynInput();
  store.setCursor(store.tool.cursor);
  store.showHint(store.tool.hint);
  store.requestDraw();
  store.emit();

}
