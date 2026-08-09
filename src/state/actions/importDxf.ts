import type { EditorStore } from '../EditorStore';

export async function importDxf(store: EditorStore, file: File): Promise<void> {
  const text = await file.text();
  await store.loadDxfText(text, file.name);

}
