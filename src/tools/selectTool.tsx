import { edgesInChainOf, edgesInGroupOf } from '../model/topology';
import { dot } from '../render/dimensions';
import { CANVAS } from '../render/palette';
import type { Point } from '../core/types';
import type { Tool } from './types';

interface SelectState {
  dragStartWorld: Point | null;
  boxStartScreen: Point | null;
  boxEndScreen: Point | null;
  isMoving: boolean;
  movedSnapshot: boolean;
}

const Icon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 2l10 6-5 1.5L6 14 3 2z" />
  </svg>
);

export const selectTool: Tool<SelectState> = {
  id: 'select',
  label: 'Select',
  shortcut: 's',
  title:
    'Select (S) — Click edge to select, drag to move selection, or drag box select. Ctrl+C (Copy), Ctrl+X (Cut), Ctrl+V (Paste), Delete.',
  hint: 'Click edge to select · Drag selection to move · Box select · Ctrl+C/X/V/A · Delete',
  icon: Icon,
  cursor: 'default',
  snaps: false,

  createState: () => ({
    dragStartWorld: null,
    boxStartScreen: null,
    boxEndScreen: null,
    isMoving: false,
    movedSnapshot: false,
  }),

  onPointerMove(state, input, api) {
    if (state.isMoving && state.dragStartWorld && api.selection.size > 0) {
      const dx = input.world.x - state.dragStartWorld.x;
      const dy = input.world.y - state.dragStartWorld.y;

      if (dx !== 0 || dy !== 0) {
        if (!state.movedSnapshot) {
          api.edit(() => true);
          state.movedSnapshot = true;
        }
        api.doc.translateEdges(api.selection, dx, dy);
        state.dragStartWorld = input.world;
        api.redraw();
      }
      return;
    }

    if (state.boxStartScreen) {
      state.boxEndScreen = input.screen;
      api.redraw();
      return;
    }

    const hit = api.doc.hitEdgeAt(input.rawWorld.x, input.rawWorld.y, api.view.zoom);
    api.setHoverEdge(hit);
    api.setCursor(hit !== null ? 'pointer' : 'default');
  },

  onPointerDown(state, input, api) {
    const hit = api.doc.hitEdgeAt(input.rawWorld.x, input.rawWorld.y, api.view.zoom);

    if (hit !== null) {
      if (!api.selection.has(hit) && !input.shiftKey) {
        const additions =
          input.ctrlKey || input.metaKey
            ? edgesInGroupOf(api.doc, hit)
            : edgesInChainOf(api.doc, hit);
        api.selection.clear();
        for (const edgeId of additions) api.selection.add(edgeId);
      } else if (input.shiftKey) {
        if (api.selection.has(hit)) {
          api.selection.delete(hit);
        } else {
          api.selection.add(hit);
        }
      }

      state.isMoving = true;
      state.dragStartWorld = input.world;
      state.movedSnapshot = false;
    } else {
      if (!input.shiftKey) api.selection.clear();
      state.boxStartScreen = input.screen;
      state.boxEndScreen = input.screen;
    }
    api.redraw();
  },

  onPointerUp(state, _input, api) {
    if (state.boxStartScreen && state.boxEndScreen) {
      const x1 = Math.min(state.boxStartScreen.x, state.boxEndScreen.x);
      const x2 = Math.max(state.boxStartScreen.x, state.boxEndScreen.x);
      const y1 = Math.min(state.boxStartScreen.y, state.boxEndScreen.y);
      const y2 = Math.max(state.boxStartScreen.y, state.boxEndScreen.y);

      for (const e of api.doc.edges.values()) {
        const [a, b] = api.doc.endpointsOf(e);
        const sa = api.view.toScreen(a.x, a.y);
        const sb = api.view.toScreen(b.x, b.y);

        if (
          (sa.x >= x1 && sa.x <= x2 && sa.y >= y1 && sa.y <= y2) ||
          (sb.x >= x1 && sb.x <= x2 && sb.y >= y1 && sb.y <= y2)
        ) {
          api.selection.add(e.id);
        }
      }
    }

    state.isMoving = false;
    state.dragStartWorld = null;
    state.boxStartScreen = null;
    state.boxEndScreen = null;
    state.movedSnapshot = false;
    api.redraw();
  },

  onEscape(state, api) {
    state.isMoving = false;
    state.dragStartWorld = null;
    state.boxStartScreen = null;
    state.boxEndScreen = null;
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

  drawPreview(state, scene) {
    const { ctx } = scene;
    if (state.boxStartScreen && state.boxEndScreen) {
      const x = Math.min(state.boxStartScreen.x, state.boxEndScreen.x);
      const y = Math.min(state.boxStartScreen.y, state.boxEndScreen.y);
      const w = Math.abs(state.boxEndScreen.x - state.boxStartScreen.x);
      const h = Math.abs(state.boxEndScreen.y - state.boxStartScreen.y);

      ctx.save();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      ctx.restore();
    } else {
      dot(ctx, scene.pointer.screen.x, scene.pointer.screen.y, 3, CANVAS.cursorDot);
    }
  },
};
