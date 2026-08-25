// Flat config wrapping the CRA-provided shareable configs via FlatCompat,
// since eslint-config-react-app itself only ships an eslintrc-style
// export. react-scripts' own internal lint (the dev-server overlay and
// react-scripts build's lint check, both wired through eslint-webpack-plugin)
// is unaffected by this file - that plugin doesn't detect/use flat config,
// it always resolves eslintConfig from package.json instead - so that field
// stays in package.json alongside this file for react-scripts' internal use.
const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  { ignores: ['build/**', 'coverage/**'] },
  ...compat.extends('react-app', 'react-app/jest'),
];
