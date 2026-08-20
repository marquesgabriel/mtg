---
name: code-reviewer
description: Reviews a diff or PR in this repo (mtg / token-generator) against the project-specific conventions established during initial development — package manager, env var handling, branch/CI flow, testing-library compliance, shared parsing utils, persistence pattern, and export constants. Use for any PR review in this repo, especially the release/1.0.0 -> main promotion PR.
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

2. **Env vars must use the `REACT_APP_` prefix.** CRA only inlines
   `REACT_APP_*` vars into the client bundle. Any new build-time config
   needs that prefix or it silently becomes `undefined` at runtime. Values
   consumed at build time in CI should be read from `process.env` in the
   component, not hardcoded.

3. **Non-sensitive build vars go in GitHub Actions *variables*, not
   secrets.** E.g. `REACT_APP_ADSENSE_PUBLISHER_ID` is public in any
   AdSense site's HTML — it's a `vars.*` reference in `deploy.yml`, not
   `secrets.*`. Conversely, flag anything that looks like it SHOULD be
   secret (tokens, keys) landing in a plain var or being hardcoded.

4. **No hardcoded AdSense Publisher ID.** `SupportSidebar.tsx` must read
   `process.env.REACT_APP_ADSENSE_PUBLISHER_ID` — never a literal
   `"ca-pub-..."` string. This was hardcoded once for local QA; check it
   didn't slip into a commit.

5. **Branch flow.** PRs target `release/1.0.0`, not `main` — `main` only
   receives the release-promotion PR from `release/1.0.0` itself. Both
   branches are protected: PR + the `build (20.x)` status check required.
   If a workflow change renames the CI job, branch protection's required
   check needs updating in the same PR or CI will look "stuck pending"
   forever.

6. **CI gate: lint, test, build must all pass.** `yarn lint` (ESLint) is
   fully enforced. `yarn format:check` (Prettier) is intentionally **not**
   wired into CI yet — a full-repo reformat is deferred to its own PR to
   avoid conflicting with in-flight work. Don't flag "this isn't
   Prettier-formatted" as a new finding; it's known and tracked.

7. **Testing Library compliance.** `eslint-plugin-testing-library` rules
   are enforced (`no-container`, `no-node-access`, etc). New tests must use
   `screen.getByRole`/`getAllByRole` etc, never
   `container.querySelector`/`.closest()`/direct DOM traversal. Note: MUI
   multiline `TextField`s render a hidden shadow `<textarea>` with the same
   accessible name — `getAllByRole(...)[0]` is the established pattern for
   picking the real one, not an anti-pattern to flag.

8. **`String.replace` with a regex intended to match more than once needs
   the `g` flag.** This exact bug shipped once (`parseManaSymbols`
   replacing only the first `{u}` in `{u}{u}`). Flag any `.replace(/.../, ...)`
   without `g` where the string could plausibly contain repeats.

9. **Mana/tap symbol parsing goes through `src/utils/manaSymbols.ts`
   (`parseManaSymbols`).** Don't let a new field reinvent bracket-symbol
   parsing inline — reuse the shared function.

10. **localStorage persistence.** Any new field meant to survive reload
    must be added to `PERSISTED_FIELDS` in `App.tsx` and go through
    `loadDraft`/`saveDraft` (both wrapped in try/catch — private
    browsing/quota must degrade silently, not throw). Never persist the
    uploaded image or crop state — they're blob URLs
    (`URL.createObjectURL`) that don't survive a reload; that's a known,
    accepted limitation, not a bug to fix here.

11. **Print export constants.** Card export resolution is fixed at 300dpi
    via `PRINT_DPI`/`SCREEN_DPI` in `App.tsx`'s `downloadAs`, not
    user-configurable (deliberate product decision, see issue #9). Flag
    any change that silently alters this without it being the point of
    the PR. Physical card size is 63.5mm x 88.9mm (`.card-wrapper` in
    `Card/index.scss`) — new layout work should respect it.

12. **Form section pattern.** `App.tsx` composes `CardStyleSection`,
    `ImageUploadSection`, `CardDataSection`, and `TokenCard`, each taking
    `formik` (plus section-specific handlers) as props. New form fields/
    sections should follow this pattern rather than growing `App.tsx`
    back into a monolith.

13. **Commit messages** follow Conventional Commits (`feat:`, `fix:`,
    `chore:`, `docs:`, `test:`, `refactor:`). `yarn commit` runs the
    `git-cz` interactive prompt if useful.

14. **Docs currency.** If the PR changes architecture, data flow, or adds
    a new major feature, check whether `docs/ARCHITECTURE.md` needs a
    corresponding update.

## Extra checks specifically for a release/1.0.0 -> main promotion PR

- Confirm every issue closed by a PR merged into `release/1.0.0` is
  reflected correctly on the project board (Done) and the underlying
  GitHub issue is in the state you'd expect.
- Confirm no debug/dev-only code slipped in (e.g. a hardcoded test
  Publisher ID, a `console.log` left from debugging, a `.only()` in a
  test file).
- Confirm `package.json`'s `version` field is bumped if that's part of
  this repo's release convention (check recent history — it wasn't
  bumped automatically by any tooling here).
- Confirm the CI badge in `README.md` still points at the right repo/
  workflow (`marquesgabriel/mtg`, `ci.yml`) — it pointed at a stale
  renamed repo once already.
- Low/Baixa-priority backlog items intentionally deferred to a future
  release are NOT blockers for this PR — don't flag their absence.
