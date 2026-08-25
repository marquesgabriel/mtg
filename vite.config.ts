import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// envPrefix keeps REACT_APP_* as the app's env var convention (see #20 -
// "preservando formato de env vars REACT_APP_") instead of switching to
// Vite's default VITE_ prefix, so .env, the GitHub Actions `vars.*`, and
// index.html's %REACT_APP_ADSENSE_PUBLISHER_ID% placeholder didn't need to
// change. outDir matches CRA's default ('build') so yarn deploy (gh-pages
// -d build) and deploy.yml didn't need to change either.
export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'REACT_APP_'],
  build: {
    outDir: 'build',
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true,
  },
});
