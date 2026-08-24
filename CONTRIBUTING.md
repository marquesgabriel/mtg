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
yarn lint           # ESLint - must pass, enforced in CI
yarn test           # Jest/Testing Library - must pass, enforced in CI
yarn build          # production build - must succeed, enforced in CI
yarn format:check   # Prettier - must pass, enforced in CI
```

### Formatting note

Prettier is configured (`.prettierrc.json`) and enforced in CI via `yarn format:check`. Run `yarn format` before opening a PR to fix any violations.

## Commit messages

This repo follows [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, etc). `yarn commit` runs an interactive prompt ([git-cz](https://github.com/streamich/git-cz)) if you'd rather not write the format by hand.

**This is now functionally required, not just style:** `.github/workflows/version-bump.yml` parses commit subjects since the last tag to decide the next release's version (`feat:` → minor, `fix:`/`perf:` → patch, `BREAKING CHANGE`/`!:` → major). A commit that doesn't follow the format just won't count toward any bump.

## Branching and PRs

- Branch from and open PRs against the currently active release branch (`release/<name>` — the name itself isn't fixed, check the project board or ask if you're not sure which one is active), not against `main` directly. The only routine exception is this repo's own release-bump automation (`.github/workflows/version-bump.yml`), which targets `main` because it's about the release infra itself, not product code.
- Prefer batching related work into one release branch over opening a new one per PR — fewer, more stable releases beat releasing after every single change. The release branch merges to `main` once everything in it is ready, which triggers the automated version bump and release.
- `main` and the active release branch are both protected: a PR with a passing CI check is required before merge.
- Keep PRs scoped to one issue/concern where practical.
- Reference the issue(s) a PR closes with `Closes #N` / `Fixes #N` in the PR body (the template already has this field) — this isn't just for GitHub's auto-close, it's what drives `.github/workflows/project-status.yml`'s sync of the [project board](https://github.com/users/marquesgabriel/projects/1) (moves the linked issue to "In Progress" on open, "Done" on merge). A PR without it leaves its issue stuck on the board even after the fix ships.

## Project board

Work is tracked as GitHub Issues on the [project board](https://github.com/users/marquesgabriel/projects/1), prioritized Alta/Média/Baixa. Check there before starting something to avoid duplicate work.
