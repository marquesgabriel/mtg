// Native flat config - no FlatCompat, no eslint-config-react-app (#129).
// Ported the shape of this from marquesgabriel.github.io's eslint.config.js,
// with two additions that repo's config doesn't need: eslint-plugin-jsx-a11y
// (this app has real form/dialog surface worth linting for a11y, and the
// previous eslint-config-react-app-based setup already had it active) and
// eslint-plugin-testing-library scoped to *.test files (this repo's tests
// stay linted - see the code-reviewer skill's "Testing Library compliance"
// item, which already relies on these rules being enforced; the portfolio's
// config sidesteps this by excluding *.test.tsx from lint entirely, which
// isn't a fit here since we actively rely on the rule catching
// container.querySelector/.closest() anti-patterns).
const js = require('@eslint/js');
const globals = require('globals');
const reactPlugin = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const jsxA11y = require('eslint-plugin-jsx-a11y');
const testingLibrary = require('eslint-plugin-testing-library');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const prettier = require('eslint-config-prettier');

module.exports = [
  { ignores: ['build/**', 'coverage/**'] },

  { ...js.configs.recommended, files: ['src/**/*.{ts,tsx}'] },

  // react - flat config native, already registers plugin + rules + parserOptions JSX
  {
    ...reactPlugin.configs.flat.recommended,
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ...reactPlugin.configs.flat.recommended.languageOptions,
      globals: { ...globals.browser, ...globals.es2021 },
    },
    settings: {
      react: { version: 'detect' },
    },
  },

  // jsx-runtime - disables react/react-in-jsx-scope and react/prop-types for React 17+
  {
    ...reactPlugin.configs.flat['jsx-runtime'],
    files: ['src/**/*.{ts,tsx}'],
  },

  // react-hooks - flat config native. v7's "recommended" set is broader
  // than the 2-rule set (rules-of-hooks, exhaustive-deps) the old
  // eslint-config-react-app-based setup enforced - two of the new rules
  // are disabled below rather than fixing the code they flag, since doing
  // so properly means real refactoring, not a config-migration-scoped
  // change:
  //   - react-hooks/refs flags `anchorEl={anchorRef.current}` in
  //     DownloadAsButton.tsx, which is MUI's own documented Popper/anchor
  //     pattern (see their Split Button example) - not a real bug here.
  //   - react-hooks/set-state-in-effect flags the prop->local-state sync
  //     in GalleryDialog.tsx's CopiesInput (and a similar one in
  //     PrintSheetDialog.tsx), which is a deliberate, already-tested fix
  //     for a real mobile input bug (#92) - refactoring it to satisfy this
  //     rule risks regressing that fix, out of scope here.
  {
    ...reactHooks.configs.flat.recommended,
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },

  // jsx-a11y - eslint-plugin-jsx-a11y@6.10.2 (latest as of writing) hasn't
  // shipped a native flat config export yet; its configs.recommended is
  // still eslintrc-shaped (top-level `parserOptions`, `plugins` as a
  // string array), which ESLint 8's flat config loader rejects outright.
  // The plugin object itself IS flat-compatible ({meta, rules}), so this
  // rebuilds just the rules mapping into a proper flat config block
  // instead of pulling in FlatCompat for one plugin.
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'jsx-a11y': jsxA11y },
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: jsxA11y.configs.recommended.rules,
  },

  // typescript
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      // tsc (via `yarn build`) already fully covers this, and the base rule
      // produces false positives on TS-only constructs (ambient globals,
      // type-only imports) - same rationale eslint-config-react-app used.
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // eslint-config-react-app never had this rule at all, and this
      // codebase relies on `any` in ~20 spots (form/event glue, generic
      // props like Card/index.tsx's `formik: any`) - enabling it here
      // would demand a real typing pass, not a config migration. Left
      // off to match prior behavior; worth its own follow-up issue if
      // tightening types is ever wanted.
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // testing-library - scoped to test files only, matches what
  // eslint-config-react-app's `react-app/jest` variant enforced before
  // (see the code-reviewer skill's "Testing Library compliance" item)
  {
    ...testingLibrary.configs['flat/react'],
    files: ['src/**/*.test.{ts,tsx}'],
  },

  // prettier always last - disables any rule above that would conflict
  // with Prettier's own formatting
  prettier,
];
