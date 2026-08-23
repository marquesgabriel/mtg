import { loadGallery, addToGallery, removeFromGallery, updateGalleryEntryCopies } from './gallery';
import { DEFAULT_TOKEN_VALUES, TokenValues } from './tokenFields';

const token: TokenValues = { ...DEFAULT_TOKEN_VALUES, name: 'Elite Vanguard' } as TokenValues;
const image = 'data:image/jpeg;base64,fake';
const LEGACY_STORAGE_KEY = 'mtg-token-generator:gallery';

function deleteGalleryDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.deleteDatabase('mtg-token-generator');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  });
}

beforeEach(async () => {
  window.localStorage.clear();
  await deleteGalleryDB();
});

describe('loadGallery', () => {
  it('returns an empty array when nothing is saved', async () => {
    expect(await loadGallery()).toEqual([]);
  });

  it('migrates entries from the legacy localStorage key and clears it', async () => {
    const legacyEntry = { id: 'legacy-1', savedAt: 1, copies: 2, token, image };
    window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify([legacyEntry]));

    const entries = await loadGallery();

    expect(entries).toHaveLength(1);
    expect(entries[0]).toEqual(legacyEntry);
    expect(window.localStorage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
  });

  it('returns an empty array for corrupted legacy storage instead of throwing', async () => {
    window.localStorage.setItem(LEGACY_STORAGE_KEY, '{not valid json');
    expect(await loadGallery()).toEqual([]);
    expect(window.localStorage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
  });
});

describe('addToGallery', () => {
  it('adds a new entry with a unique id, timestamp, image, and 1 copy by default', async () => {
    const entries = await addToGallery(token, image);
    expect(entries).toHaveLength(1);
    expect(entries[0].token).toEqual(token);
    expect(entries[0].image).toBe(image);
    expect(entries[0].copies).toBe(1);
    expect(entries[0].id).toBeTruthy();
    expect(entries[0].savedAt).toBeGreaterThan(0);
  });

  it('persists across loadGallery calls', async () => {
    await addToGallery(token, image);
    expect(await loadGallery()).toHaveLength(1);
  });

  it('appends rather than replacing existing entries', async () => {
    await addToGallery(token, image);
    const entries = await addToGallery({ ...token, name: 'Second Token' }, image);
    expect(entries).toHaveLength(2);
  });
});

describe('removeFromGallery', () => {
  it('removes only the matching entry', async () => {
    await addToGallery(token, image);
    const [, second] = await addToGallery({ ...token, name: 'Second' }, image);
    const remaining = await removeFromGallery(second.id);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].token.name).toBe('Elite Vanguard');
  });
});

describe('updateGalleryEntryCopies', () => {
  it('updates the copies count for the matching entry', async () => {
    const [entry] = await addToGallery(token, image);
    const updated = await updateGalleryEntryCopies(entry.id, 4);
    expect(updated[0].copies).toBe(4);
  });

  it('clamps to a minimum of 1', async () => {
    const [entry] = await addToGallery(token, image);
    const updated = await updateGalleryEntryCopies(entry.id, 0);
    expect(updated[0].copies).toBe(1);
  });

  it('falls back to 1 for a non-finite value', async () => {
    const [entry] = await addToGallery(token, image);
    const updated = await updateGalleryEntryCopies(entry.id, NaN);
    expect(updated[0].copies).toBe(1);
  });
});
