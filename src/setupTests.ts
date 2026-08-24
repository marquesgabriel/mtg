// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom doesn't implement IndexedDB - the gallery (utils/idbGallery.ts, #80)
// needs a working window.indexedDB in tests.
import 'fake-indexeddb/auto';

// jest-environment-jsdom also doesn't expose the structuredClone global
// fake-indexeddb relies on to store values (browsers all have it natively)
// - a JSON-based stand-in is good enough here since gallery entries are
// plain JSON-serializable data.
if (typeof structuredClone === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).structuredClone = (value: unknown) => JSON.parse(JSON.stringify(value));
}
