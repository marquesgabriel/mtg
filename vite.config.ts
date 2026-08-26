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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/index.tsx',
        'src/reportWebVitals.ts',
        'src/setupTests.ts',
        'src/components/index.tsx',
        'src/utils/index.ts',
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
      ],
      // Set from actual measured coverage (#128), not copied from the
      // portfolio's 80% - this repo has far fewer tests (32 vs. 50) and
      // almost no component-level coverage yet (most dialogs sit under
      // 30%). These numbers sit a few points below the measured baseline
      // as a regression floor: a PR that meaningfully drops coverage
      // fails CI, but the gate doesn't demand new tests just to land
      // unrelated work. Ratchet these up as component tests get added -
      // don't just raise the number without the coverage to back it.
      thresholds: {
        branches: 35,
        functions: 35,
        lines: 45,
        statements: 45,
      },
    },
  },
});
