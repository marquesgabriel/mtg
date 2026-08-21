// localStorage access wrapped in try/catch, degrading silently on failure
// (private browsing, quota exceeded, storage disabled, etc.) — shared by
// every localStorage read/write in the app instead of each call site
// reimplementing the same try/catch (see #59).

export function safeStorageGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeStorageSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // localStorage unavailable — value just won't persist
  }
}

export function safeStorageRemove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // localStorage unavailable — nothing to clear
  }
}
