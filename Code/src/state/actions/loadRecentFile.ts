import type { EditorStore } from '../EditorStore';
import type { RecentFileEntry } from '../../io/recentFiles/RecentFileEntry';

export async function loadRecentFile(store: EditorStore, entry: RecentFileEntry): Promise<void> {
  if (entry.type === 'dxf') {
    await store.loadDxfText(entry.data, entry.name);
  } else if (entry.type === 'image') {
    await store.loadRecentImage(entry.data);
  }

}
