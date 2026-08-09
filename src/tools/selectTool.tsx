import { edgesInChainOf, edgesInGroupOf } from '../model/topology';
import { dot } from '../render/dimensions';
import { CANVAS } from '../render/palette';
import type { Tool } from './types';

type SelectState = Record<string, never>;

const Icon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 2l10 6-5 1.5L6 14 3 2z" />
  </svg>
);

/**
 * Picking and deleting. A plain click grabs the continuous run of segments
 * under the cursor; Ctrl/Cmd widens that to everything drawn in the same
 * operation, which is usually what "select the whole shape" means.
 */
export const selectTool: Tool<SelectState> = {
  id: 'select',
  label: 'Select',
  shortcut: 's',
  title:
    'Select (S) — click a segment. Shift+click adds. Ctrl/Cmd+click selects the whole drawn shape. Delete removes.',
  hint: 'Click a segment · Delete to remove · Shift+click adds · Ctrl+click = whole drawn shape · Ctrl+A = all',
  icon: Icon,
  cursor: 'default',
  snaps: false,

  createState: () => ({}),

  onPointerMove(_state, input, api) {
    const hit = api.doc.hitEdgeAt(input.rawWorld.x, input.rawWorld.y, api.view.zoom);
    api.setHoverEdge(hit);
    api.setCursor(hit !== null ? 'pointer' : 'default');
  },

  onPointerDown(_state, input, api) {
    const id = api.doc.hitEdgeAt(input.rawWorld.x, input.rawWorld.y, api.view.zoom);
    if (id === null) {
      if (!input.shiftKey) api.selection.clear();
    } else {
      const additions =
        input.ctrlKey || input.metaKey
          ? edgesInGroupOf(api.doc, id)
          : edgesInChainOf(api.doc, id);
      if (!input.shiftKey) api.selection.clear();
      for (const edgeId of additions) api.selection.add(edgeId);
    }
    api.redraw();
  },

  onEscape(_state, api) {
    api.selection.clear();
    api.redraw();
  },

  onDelete(_state, api) {
    if (!api.selection.size) return;
    api.edit(() => {
      for (const id of api.selection) api.doc.removeEdge(id);
      api.selection.clear();
      api.setHoverEdge(null);
      return true;
    });
  },

  drawPreview(_state, scene) {
    dot(scene.ctx, scene.pointer.screen.x, scene.pointer.screen.y, 3, CANVAS.cursorDot);
  },
};
