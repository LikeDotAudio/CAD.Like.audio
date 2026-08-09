export interface RecentFileEntry {
  id: string;
  name: string;
  type: 'dxf' | 'image';
  data: string;
  timestamp: number;
}

const RECENT_KEY = 'cad_like_audio_recent_files';
const MAX_RECENT = 8;

export function getRecentFiles(): RecentFileEntry[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as RecentFileEntry[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function addRecentFile(entry: Omit<RecentFileEntry, 'id' | 'timestamp'>): void {
  try {
    const list = getRecentFiles();
    const id = `${entry.type}_${entry.name}_${Date.now()}`;
    const filtered = list.filter((item) => item.name !== entry.name);
    const updated: RecentFileEntry[] = [
      { ...entry, id, timestamp: Date.now() },
      ...filtered,
    ].slice(0, MAX_RECENT);

    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    document.cookie = `cad_recent_count=${updated.length}; path=/; max-age=31536000`;
  } catch (err) {
    console.warn('Failed to save recent file to cache/localStorage:', err);
  }
}

export function clearRecentFiles(): void {
  try {
    localStorage.removeItem(RECENT_KEY);
    document.cookie = `cad_recent_count=0; path=/; max-age=0`;
  } catch (err) {
    console.warn('Failed to clear recent files:', err);
  }
}
