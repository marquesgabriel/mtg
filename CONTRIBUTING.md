# Contributing

## Setup

```bash
yarn install
```

> **Windows note:** if you have Inkscape installed, `python`/other tool aliases on your PATH may not matter here, but make sure `yarn`/`node` resolve to a real Node.js install.

## Running locally

```bash
yarn start
```

## Before opening a PR

```bash
yarn lint          # ESLint - must pass, enforced in CI
yarn test           # Jest/Testing Library - must pass, enforced in CI
yarn build           # production build - must succeed, enforced in CI
yarn format          # Prettier - optional today (see note below), but keeps new code consistent
```

### Formatting note

Prettier is configured (`.prettierrc.json`) but **not** enforced in CI yet — the codebase predates it, and a full reformat is tracked separately to avoid conflicting with in-flight PRs. Run `yarn format` on files you touch; don't reformat unrelated files in the same PR.

## Commit messages

This repo follows [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, etc). `yarn commit` runs an interactive prompt ([git-cz](https://github.com/streamich/git-cz)) if you'd rather not write the format by hand.

**This is now functionally required, not just style:** `.github/workflows/version-bump.yml` parses commit subjects since the last tag to decide the next release's version (`feat:` → minor, `fix:`/`perf:` → patch, `BREAKING CHANGE`/`!:` → major). A commit that doesn't follow the format just won't count toward any bump.

## Branching and PRs

- Branch from `release/1.0.0` (the active review branch — see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for why).
- Open PRs against `release/1.0.0`, not `main`.
- `main` and `release/1.0.0` are both protected: a PR with a passing CI check is required before merge.
- Keep PRs scoped to one issue/concern where practical.

## Project board

Work is tracked as GitHub Issues on the [project board](https://github.com/users/marquesgabriel/projects/1), prioritized Alta/Média/Baixa. Check there before starting something to avoid duplicate work.
