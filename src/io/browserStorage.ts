import type { DocSnapshot } from '../model/Doc';
import type { Layer, Units } from '../core/types';

export interface SavedSession {
  version: number;
  timestamp: number;
  docSnapshot: DocSnapshot;
  units: Units;
  gridSize: number;
  snapToGrid: boolean;
  shapeMode: boolean;
  activeLayerId: string;
  layers: Layer[];
  tracing?: {
    dataUrl: string;
    x: number;
    y: number;
    worldWidth: number;
    opacity: number;
    visible: boolean;
  } | null;
}

const DB_NAME = 'CadLikeAudioBrowserDB';
const DB_VERSION = 1;
const SESSION_KEY = 'current_active_session';
const LOCALSTORAGE_SESSION_KEY = 'cad_like_audio_active_session';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not available'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('store')) {
        db.createObjectStore('store');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveSessionToBrowser(session: SavedSession): Promise<void> {
  // 1. Always attempt IndexedDB (high capacity for large drawings & images)
  try {
    const db = await openDB();
    const tx = db.transaction('store', 'readwrite');
    tx.objectStore('store').put(session, SESSION_KEY);
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = reject;
    });
  } catch (err) {
    console.warn('IndexedDB save failed, falling back to localStorage:', err);
  }

  // 2. Backup essential metadata to localStorage & cookie
  try {
    const lightweightSession = {
      ...session,
      tracing: session.tracing ? { ...session.tracing, dataUrl: '' } : null,
    };
    localStorage.setItem(LOCALSTORAGE_SESSION_KEY, JSON.stringify(lightweightSession));
    document.cookie = `cad_active_session=1; path=/; max-age=31536000`;
  } catch (e) {
    console.warn('LocalStorage backup failed:', e);
  }
}

export async function loadSessionFromBrowser(): Promise<SavedSession | null> {
  // 1. Try IndexedDB first
  try {
    const db = await openDB();
    const tx = db.transaction('store', 'readonly');
    const req = tx.objectStore('store').get(SESSION_KEY);
    const result = await new Promise<SavedSession | undefined>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = reject;
    });
    if (result && result.docSnapshot) return result;
  } catch (err) {
    console.warn('IndexedDB load failed:', err);
  }

  // 2. Fallback to localStorage
  try {
    const raw = localStorage.getItem(LOCALSTORAGE_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SavedSession;
      if (parsed && parsed.docSnapshot) return parsed;
    }
  } catch {}

  return null;
}

export async function clearBrowserSession(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('store', 'readwrite');
    tx.objectStore('store').delete(SESSION_KEY);
  } catch {}

  try {
    localStorage.removeItem(LOCALSTORAGE_SESSION_KEY);
    document.cookie = `cad_active_session=0; path=/; max-age=0`;
  } catch {}
}
