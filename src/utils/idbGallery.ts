import type { GalleryEntry } from './gallery';

// Raw IndexedDB (no library - see #80) backing the gallery. localStorage's
// ~5-10MB per-origin quota is easy to blow past once a handful of card
// entries carry a base64 image each, and a quota error there is swallowed
// silently by safeStorage.ts, which can look like a "corrupted" save.
// IndexedDB is async and has a much larger practical quota, so entries are
// stored one row per id instead of one giant serialized array.
const DB_NAME = 'mtg-token-generator';
const DB_VERSION = 1;
const STORE_NAME = 'gallery';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB not available'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Every export below opens its own connection and closes it once the
// transaction settles - a connection left open (e.g. one per call, never
// closed) blocks any later attempt to delete/upgrade the database. Each
// also degrades to a no-op/empty-result on failure (IndexedDB unavailable,
// blocked, etc.) rather than throwing - same philosophy as safeStorage.ts
// for the smaller localStorage-backed values.
export async function getAllEntries(): Promise<GalleryEntry[]> {
  let db: IDBDatabase | undefined;
  try {
    db = await openDB();
    return await new Promise<GalleryEntry[]>((resolve, reject) => {
      const request = db!.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
      request.onsuccess = () => resolve(request.result as GalleryEntry[]);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  } finally {
    db?.close();
  }
}

export async function putEntry(entry: GalleryEntry): Promise<void> {
  let db: IDBDatabase | undefined;
  try {
    db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db!.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(entry);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // IndexedDB unavailable - entry just won't persist
  } finally {
    db?.close();
  }
}

export async function deleteEntry(id: string): Promise<void> {
  let db: IDBDatabase | undefined;
  try {
    db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db!.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // IndexedDB unavailable - nothing to clear
  } finally {
    db?.close();
  }
}
