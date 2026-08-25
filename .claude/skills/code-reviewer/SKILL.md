---
name: code-reviewer
description: Reviews a diff or PR in this repo (mtg / token-generator) against the project-specific conventions established during initial development — package manager, env var handling, branch/CI flow, testing-library compliance, shared parsing utils, persistence pattern, and export constants. Use for any PR review in this repo, especially a release branch -> main promotion PR.
---

# mtg / token-generator code reviewer

Review the given diff or PR for correctness bugs first, then adherence to the
project-specific conventions below. General good practice (security,
simplification, reuse) still applies on top of this — this list only covers
things that are non-obvious from reading the code in isolation, or that have
already caused a real bug once in this repo.

## Project-specific checks

1. **Package manager is yarn, not npm.** The repo has `yarn.lock`, no
   `package-lock.json`. Flag any `npm install`/`npm ci`/`package-lock.json`
   introduced in CI, docs, or scripts — `npm ci` fails outright here (this
   already happened once, see the CI workflow history).

2. **Env vars must use the `REACT_APP_` prefix.** The repo runs on Vite
   (migrated from CRA, #20) but kept `REACT_APP_` as the `envPrefix` in
   `vite.config.ts` on purpose, instead of switching to Vite's default
   `VITE_`. Any new build-time config needs that prefix or it silently
   becomes `undefined` at runtime. Values consumed at build time should be
   read from `import.meta.env` in the component, not `process.env` (not
   polyfilled in the browser under Vite) and not hardcoded.

3. **Non-sensitive build vars go in GitHub Actions *variables*, not
   secrets.** E.g. `REACT_APP_ADSENSE_PUBLISHER_ID` is public in any
   AdSense site's HTML — it's a `vars.*` reference in `deploy.yml`, not
   `secrets.*`. Conversely, flag anything that looks like it SHOULD be
   secret (tokens, keys) landing in a plain var or being hardcoded.

4. **No hardcoded AdSense Publisher ID.** `SupportSidebar.tsx` must read
   `import.meta.env.REACT_APP_ADSENSE_PUBLISHER_ID` — never a literal
   `"ca-pub-..."` string. This was hardcoded once for local QA; check it
   didn't slip into a commit.

5. **Branch flow.** PRs target the currently active release branch
   (`release/<name>` — the name isn't fixed; check the project board or
   recent PRs for which one's active), not `main` directly. `main` only
   receives the release-promotion PR from that release branch itself, plus
   the automated version-bump PR (`.github/workflows/version-bump.yml`,
   which targets `main` on purpose — that's about the release infra, not
   product code). Flag a PR that targets `main` directly outside of that
   automation as a deviation from the norm, not necessarily wrong, but
   worth a comment. Both `main` and the active release branch are
   protected: PR + the `build (20.x)` status check required. If a workflow
   change renames the CI job, branch protection's required check needs
   updating in the same PR or CI will look "stuck pending" forever.
   Prefer batching related work into one release branch over one release
   per PR — fewer, more stable releases is the stated goal here.

6. **CI gate: lint, test, build, and format must all pass.** `yarn lint`
   (ESLint, via the flat `eslint.config.js`), `yarn format:check`
   (Prettier), `yarn build` (Vite, with a `tsc --noEmit` type-check first),
   and `yarn test:ci` (Vitest) are all enforced in `ci.yml`.

7. **Issue linkage.** A PR that closes an issue should have `Closes #N` /
   `Fixes #N` in its body (the PR template has this field). This isn't
   just GitHub's auto-close — `.github/workflows/project-status.yml`
   syncs the project board off that same text, so a PR missing it leaves
   its issue stuck on the board even after the fix ships. Flag a PR that's
   clearly closing an issue (references one in its title/description) but
   doesn't use the `Closes`/`Fixes`/`Resolves` phrasing in the body.

8. **Testing Library compliance.** `eslint-plugin-testing-library` rules
   are enforced (`no-container`, `no-node-access`, etc). New tests must use
   `screen.getByRole`/`getAllByRole` etc, never
   `container.querySelector`/`.closest()`/direct DOM traversal. Note: MUI
   multiline `TextField`s render a hidden shadow `<textarea>` with the same
   accessible name — `getAllByRole(...)[0]` is the established pattern for
   picking the real one, not an anti-pattern to flag.

9. **`String.replace` with a regex intended to match more than once needs
   the `g` flag.** This exact bug shipped once (`parseManaSymbols`
   replacing only the first `{u}` in `{u}{u}`). Flag any `.replace(/.../, ...)`
   without `g` where the string could plausibly contain repeats.

10. **Mana/tap symbol parsing goes through `src/utils/manaSymbols.ts`
    (`parseManaSymbols`).** Don't let a new field reinvent bracket-symbol
    parsing inline — reuse the shared function.

11. **localStorage persistence.** Any new field meant to survive reload
    must be added to `PERSISTED_FIELDS` in `App.tsx` and go through
    `loadDraft`/`saveDraft` (both wrapped in try/catch — private
    browsing/quota must degrade silently, not throw). Never persist the
    uploaded image or crop state — they're blob URLs
    (`URL.createObjectURL`) that don't survive a reload; that's a known,
    accepted limitation, not a bug to fix here.

12. **Print export constants.** Card export resolution is fixed at 300dpi
    via `PRINT_DPI`/`SCREEN_DPI` in `App.tsx`'s `downloadAs`, not
    user-configurable (deliberate product decision, see issue #9). Flag
    any change that silently alters this without it being the point of
    the PR. Physical card size is 63.5mm x 88.9mm (`.card-wrapper` in
    `Card/index.scss`) — new layout work should respect it.

13. **Form section pattern.** `App.tsx` composes `CardStyleSection`,
    `ImageUploadSection`, `CardDataSection`, and `TokenCard`, each taking
    `formik` (plus section-specific handlers) as props. New form fields/
    sections should follow this pattern rather than growing `App.tsx`
    back into a monolith.

14. **Commit messages** follow Conventional Commits (`feat:`, `fix:`,
    `chore:`, `docs:`, `test:`, `refactor:`). `yarn commit` runs the
    `git-cz` interactive prompt if useful.

15. **Docs currency.** If the PR changes architecture, data flow, or adds
    a new major feature, check whether `docs/ARCHITECTURE.md` needs a
    corresponding update.

## Extra checks specifically for a release branch -> main promotion PR

- Confirm every issue closed by a PR merged into the release branch is
  reflected correctly on the project board (Done) and the underlying
  GitHub issue is in the state you'd expect.
- Confirm no debug/dev-only code slipped in (e.g. a hardcoded test
  Publisher ID, a `console.log` left from debugging, a `.only()` in a
  test file).
- `package.json`'s `version` field does not need to be bumped by hand —
  `.github/workflows/version-bump.yml` does that automatically once this
  PR merges to `main`, based on the Conventional Commits in it.
- Confirm the CI badge in `README.md` still points at the right repo/
  workflow (`marquesgabriel/mtg`, `ci.yml`) — it pointed at a stale
  renamed repo once already.
- Low/Baixa-priority backlog items intentionally deferred to a future
  release are NOT blockers for this PR — don't flag their absence.
