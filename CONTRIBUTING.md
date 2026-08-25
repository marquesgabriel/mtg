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
yarn test:ci        # Vitest/Testing Library, one-shot - must pass, enforced in CI (yarn test alone runs it in watch mode, for local dev)
yarn build          # production build (tsc --noEmit + Vite) - must succeed, enforced in CI
yarn format:check   # Prettier - must pass, enforced in CI
```

### Formatting note

Prettier is configured (`.prettierrc.json`) and enforced in CI via `yarn format:check`. A husky pre-commit hook runs `lint-staged` on every commit, which auto-fixes staged `.ts`/`.tsx`/`.scss` files with ESLint (`--fix`) and Prettier before the commit completes — this normally means CI's format/lint checks just pass. It only runs once (`yarn install` triggers `prepare`), and it silently no-ops if `.git` isn't present. If you ever need to skip it (rare), `git commit --no-verify`, but then run `yarn format` by hand first.

Note: `lint-staged` is pinned to `16.1.6` rather than latest — v17 raised its minimum Git version to 2.32, which some contributor machines may not have. If the hook ever errors out locally for an unrelated reason, `yarn format` covers the same ground manually.

## Commit messages

This repo follows [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, etc). `yarn commit` runs an interactive prompt ([git-cz](https://github.com/streamich/git-cz)) if you'd rather not write the format by hand.

**This is now functionally required, not just style:** `.github/workflows/version-bump.yml` parses commit subjects since the last tag to decide the next release's version (`feat:` → minor, `fix:`/`perf:` → patch, `BREAKING CHANGE`/`!:` → major). A commit that doesn't follow the format just won't count toward any bump.

## Branching and PRs

- Branch from and open PRs against the currently active release branch (`release/<name>` — the name itself isn't fixed, check the project board or ask if you're not sure which one is active), not against `main` directly. The only routine exception is this repo's own release-bump automation (`.github/workflows/version-bump.yml`), which targets `main` because it's about the release infra itself, not product code.
- Prefer batching related work into one release branch over opening a new one per PR — fewer, more stable releases beat releasing after every single change. The release branch merges to `main` once everything in it is ready, which triggers the automated version bump and release.
- `main` and the active release branch are both protected: a PR with a passing CI check is required before merge.
- Keep PRs scoped to one issue/concern where practical.
- Reference the issue(s) a PR closes with `Closes #N` / `Fixes #N` in the PR body (the template already has this field). Don't rely on GitHub's native auto-close for this — it only fires on merges into the default branch, and most PRs here merge into a release branch first. `.github/workflows/project-status.yml` reads the same text and both moves the linked issue on the [project board](https://github.com/users/marquesgabriel/projects/1) ("In Progress" on open, "Done" + archived on merge) and closes the issue itself directly, regardless of target branch. A PR without `Closes #N` leaves its issue open and stuck on the board even after the fix ships — this happened once for real (#81).
- If a release branch's final promotion PR into `main` doesn't itself repeat every `Closes #N` from the PRs merged into it along the way, those issues stay correctly closed (the step above already closed them directly) but won't get GitHub's "closed by #NNN" cross-reference on the promotion PR — cosmetic only, not worth blocking on.

## Project board

Work is tracked as GitHub Issues on the [project board](https://github.com/users/marquesgabriel/projects/1), prioritized Alta/Média/Baixa. Check there before starting something to avoid duplicate work.
