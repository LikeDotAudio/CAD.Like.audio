import type { EditorStore } from '../EditorStore';

export function explodeSelection(store: EditorStore): void {
  if (store.selection.size === 0) return;
  store.history.push(store.doc.snapshot());
  const count = store.doc.explodeSelected(store.selection);
  // Every piece is its own entity now — a stale whole-chain selection would be misleading.
  store.selection.clear();
  store.hoverId = null;
  store.markDocChanged();
  store.requestDraw();
  store.emit();
  store.showHint(
    count > 0
      ? `Exploded into ${count} separate piece(s) — click one to select it alone.`
      : 'Nothing to explode.',
    4000,
  );

}
