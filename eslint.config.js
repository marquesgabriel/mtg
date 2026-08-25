// Flat config wrapping eslint-config-react-app via FlatCompat, since that
// package only ships an eslintrc-style export, not a flat one. The legacy
// `eslintConfig` field this used to coexist with in package.json (for
// react-scripts' own internal eslint-webpack-plugin, which never detected
// flat config) is gone now that the app runs on Vite instead - this file
// is the only ESLint config left.
const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  { ignores: ['build/**', 'coverage/**'] },
  ...compat.extends('react-app', 'react-app/jest'),
];
