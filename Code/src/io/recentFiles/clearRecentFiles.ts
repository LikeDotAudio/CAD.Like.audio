import { RECENT_KEY } from './RecentFileEntry';

/** Drop every cached file. */
export function clearRecentFiles(): void {
  try {
    localStorage.removeItem(RECENT_KEY);
    document.cookie = `cad_recent_count=0; path=/; max-age=0`;
  } catch (err) {
    console.warn('Failed to clear recent files:', err);
  }
}
