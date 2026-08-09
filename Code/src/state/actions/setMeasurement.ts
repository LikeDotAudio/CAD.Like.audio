import type { EditorStore } from '../EditorStore';

export function setMeasurement(store: EditorStore, text: string | null): void {
  if (store.measurement === text) return;
  store.measurement = text;
  store.emit();

}
