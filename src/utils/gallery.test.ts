import { loadGallery, addToGallery, removeFromGallery, updateGalleryEntryCopies } from './gallery';
import { DEFAULT_TOKEN_VALUES, TokenValues } from './tokenFields';

const token: TokenValues = { ...DEFAULT_TOKEN_VALUES, name: 'Elite Vanguard' } as TokenValues;

beforeEach(() => {
  window.localStorage.clear();
});

describe('loadGallery', () => {
  it('returns an empty array when nothing is saved', () => {
    expect(loadGallery()).toEqual([]);
  });

  it('returns an empty array for corrupted storage instead of throwing', () => {
    window.localStorage.setItem('mtg-token-generator:gallery', '{not valid json');
    expect(loadGallery()).toEqual([]);
  });
});

describe('addToGallery', () => {
  it('adds a new entry with a unique id, timestamp, and 1 copy by default', () => {
    const entries = addToGallery(token);
    expect(entries).toHaveLength(1);
    expect(entries[0].token).toEqual(token);
    expect(entries[0].copies).toBe(1);
    expect(entries[0].id).toBeTruthy();
    expect(entries[0].savedAt).toBeGreaterThan(0);
  });

  it('persists across loadGallery calls', () => {
    addToGallery(token);
    expect(loadGallery()).toHaveLength(1);
  });

  it('appends rather than replacing existing entries', () => {
    addToGallery(token);
    const entries = addToGallery({ ...token, name: 'Second Token' });
    expect(entries).toHaveLength(2);
  });
});

describe('removeFromGallery', () => {
  it('removes only the matching entry', () => {
    addToGallery(token);
    const [second] = addToGallery({ ...token, name: 'Second' }).slice(1);
    const remaining = removeFromGallery(second.id);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].token.name).toBe('Elite Vanguard');
  });
});

describe('updateGalleryEntryCopies', () => {
  it('updates the copies count for the matching entry', () => {
    const [entry] = addToGallery(token);
    const updated = updateGalleryEntryCopies(entry.id, 4);
    expect(updated[0].copies).toBe(4);
  });

  it('clamps to a minimum of 1', () => {
    const [entry] = addToGallery(token);
    const updated = updateGalleryEntryCopies(entry.id, 0);
    expect(updated[0].copies).toBe(1);
  });

  it('falls back to 1 for a non-finite value', () => {
    const [entry] = addToGallery(token);
    const updated = updateGalleryEntryCopies(entry.id, NaN);
    expect(updated[0].copies).toBe(1);
  });
});
