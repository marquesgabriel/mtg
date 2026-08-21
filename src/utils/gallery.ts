import { safeStorageGet, safeStorageSet } from './safeStorage';
import { TokenValues } from './tokenFields';

// A locally-saved token, kept separate from a JSON file (#6) so the user
// can build up a working set of tokens without downloading/re-importing
// files. `copies` exists for the print-sheet feature (#10) - how many
// times this token should repeat on a printed sheet.
export interface GalleryEntry {
  id: string;
  savedAt: number;
  copies: number;
  token: TokenValues;
}

const GALLERY_STORAGE_KEY = 'mtg-token-generator:gallery';

export function loadGallery(): GalleryEntry[] {
  const raw = safeStorageGet(GALLERY_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveGallery(entries: GalleryEntry[]): void {
  safeStorageSet(GALLERY_STORAGE_KEY, JSON.stringify(entries));
}

export function addToGallery(token: TokenValues): GalleryEntry[] {
  const entry: GalleryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    savedAt: Date.now(),
    copies: 1,
    token,
  };
  const next = [...loadGallery(), entry];
  saveGallery(next);
  return next;
}

export function removeFromGallery(id: string): GalleryEntry[] {
  const next = loadGallery().filter((entry) => entry.id !== id);
  saveGallery(next);
  return next;
}

export function updateGalleryEntryCopies(id: string, copies: number): GalleryEntry[] {
  const safeCopies = Number.isFinite(copies) ? Math.max(1, Math.floor(copies)) : 1;
  const next = loadGallery().map((entry) => (entry.id === id ? { ...entry, copies: safeCopies } : entry));
  saveGallery(next);
  return next;
}
