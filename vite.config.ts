import { readFileSync } from 'fs';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

// envPrefix keeps REACT_APP_* as the app's env var convention (see #20 -
// "preservando formato de env vars REACT_APP_") instead of switching to
// Vite's default VITE_ prefix, so .env, the GitHub Actions `vars.*`, and
// index.html's %REACT_APP_ADSENSE_PUBLISHER_ID% placeholder didn't need to
// change. outDir matches CRA's default ('build') so yarn deploy (gh-pages
// -d build) and deploy.yml didn't need to change either.
export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'REACT_APP_'],
  // Exposes package.json's version as a build-time constant (see
  // src/index.tsx, which sets it on window.APP_VERSION) instead of the old
  // scripts/inject-version.js + .env.local + REACT_APP_VERSION relay (#127)
  // - one less script/file in the chain, and the value is available
  // anywhere in the bundle without depending on an env var resolved at
  // runtime. Ported from the same pattern already used in
  // marquesgabriel.github.io.
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    outDir: 'build',
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true,
  },
});
