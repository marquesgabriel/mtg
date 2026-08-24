import { safeStorageGet, safeStorageRemove } from './safeStorage';
import { TokenValues } from './tokenFields';
import { getAllEntries, putEntry, deleteEntry } from './idbGallery';

// A locally-saved token, kept separate from a JSON file (#6) so the user
// can build up a working set of tokens without downloading/re-importing
// files. `copies` exists for the print-sheet feature (#10) - how many
// times this token should repeat on a printed sheet. `image` is a base64
// data URL (not a blob URL, which is revoked/invalid after a reload) so
// the actual card art survives in storage - see utils/cropper.ts's
// getCroppedImgDataUrl.
//
// Persisted in IndexedDB (utils/idbGallery.ts), not localStorage - a
// handful of entries can carry several MB of base64 image data each,
// easily past localStorage's ~5-10MB per-origin quota; a quota error there
// was swallowed silently by safeStorage.ts, which could look like a
// "corrupted" save (#80).
export interface GalleryEntry {
  id: string;
  savedAt: number;
  copies: number;
  token: TokenValues;
  image: string;
}

// Legacy localStorage key from before the IndexedDB migration (#80) -
// migrateFromLocalStorage() below moves any leftover data out of it once,
// on the first loadGallery() call, so existing users don't lose their gallery.
const LEGACY_GALLERY_STORAGE_KEY = 'mtg-token-generator:gallery';

async function migrateFromLocalStorage(): Promise<void> {
  const raw = safeStorageGet(LEGACY_GALLERY_STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      for (const entry of parsed) {
        await putEntry(entry);
      }
    }
  } catch {
    // Corrupted legacy data - nothing salvageable, just drop the key below.
  }
  safeStorageRemove(LEGACY_GALLERY_STORAGE_KEY);
}

export async function loadGallery(): Promise<GalleryEntry[]> {
  await migrateFromLocalStorage();
  return getAllEntries();
}

// Guarantees a strictly increasing savedAt even when two entries are added
// within the same millisecond (Date.now() alone can't tell them apart) -
// getAllEntries() sorts by savedAt to restore insertion order, since
// IndexedDB's getAll() otherwise orders by the primary key (id) instead.
let lastSavedAt = 0;
function nextSavedAt(): number {
  lastSavedAt = Math.max(Date.now(), lastSavedAt + 1);
  return lastSavedAt;
}

export async function addToGallery(token: TokenValues, image: string): Promise<GalleryEntry[]> {
  const savedAt = nextSavedAt();
  const entry: GalleryEntry = {
    id: `${savedAt}-${Math.random().toString(36).slice(2, 8)}`,
    savedAt,
    copies: 1,
    token,
    image,
  };
  await putEntry(entry);
  return getAllEntries();
}

export async function removeFromGallery(id: string): Promise<GalleryEntry[]> {
  await deleteEntry(id);
  return getAllEntries();
}

export async function updateGalleryEntryCopies(id: string, copies: number): Promise<GalleryEntry[]> {
  const safeCopies = Number.isFinite(copies) ? Math.max(1, Math.floor(copies)) : 1;
  const entries = await getAllEntries();
  const entry = entries.find((e) => e.id === id);
  if (entry) {
    await putEntry({ ...entry, copies: safeCopies });
  }
  return getAllEntries();
}
