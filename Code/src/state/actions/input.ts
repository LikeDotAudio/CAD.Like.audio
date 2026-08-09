import type { EditorStore } from '../EditorStore';
import type { PointerInput } from '../../tools/types';

export function input(store: EditorStore, e: MouseEvent): PointerInput {
  return {
    world: store.pointer.world,
    rawWorld: store.pointer.rawWorld,
    screen: store.pointer.screen,
    client: { x: e.clientX, y: e.clientY },
    shiftKey: e.shiftKey,
    ctrlKey: e.ctrlKey,
    metaKey: e.metaKey,
  };

}
