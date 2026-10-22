# Review conventions

Read before reviewing a pull request in this repository, whether you're a
person, Claude Code's `/code-review` or any other agent. This file only lists
what this project has settled on: decisions that look arbitrary from outside,
and mistakes that already happened once. The general checks (base branch, CI
gate, issue linkage, docs currency, secrets, leftovers) are in
[Grimoire's review conventions](https://github.com/marquesgabriel/grimoire/blob/main/incubator/docs/review-conventions/README.md).
How to add or remove a convention is described there too.

Review for correctness bugs first, then against the list below.

## Conventions

1. **Yarn, not npm.** The repo has `yarn.lock` and no `package-lock.json`.
   Flag any `npm install`, `npm ci` or `package-lock.json` in CI, docs or
   scripts: `npm ci` fails outright here, and it already broke CI once.
2. **Env vars keep the `REACT_APP_` prefix.** The project runs on Vite
   (migrated from CRA in #20) but kept `REACT_APP_` in `envPrefix` in
   `vite.config.ts` on purpose. New build-time config needs that prefix or
   it's silently `undefined` at runtime, and is read from `import.meta.env`,
   not `process.env` (not polyfilled under Vite).
3. **Public build values are Actions variables, not secrets.**
   `REACT_APP_ADSENSE_PUBLISHER_ID` is public in any AdSense site's HTML, so
   `ci.yml` and `deploy.yml` read it from `vars.*`. Conversely, flag anything
   that should be secret (tokens, keys) landing in a variable or the code.
4. **No hardcoded AdSense Publisher ID.** `SupportSidebar.tsx` reads
   `import.meta.env.REACT_APP_ADSENSE_PUBLISHER_ID`, never a literal
   `"ca-pub-..."`. It was hardcoded once for local QA; check it didn't slip
   into a commit.
5. **Release-branch flow.** Pull requests target the active
   `release/<name>` branch, not `main` (see `CONTRIBUTING.md`). `main` only
   gets the release promotion and the version-bump pull request from
   `version-bump.yml`. The required check on protected branches is
   `build (20.x)`: a pull request that renames the CI job must update branch
   protection too, or CI looks stuck on pending.
6. **`Closes #N` drives the board.** `project-status.yml` reads it from the
   pull request body to move and close the issue, also on merges into a
   release branch, where GitHub's own auto-close doesn't fire. Without it the
   issue stays open and stuck on the board (it happened in #81).
7. **Testing Library rules.** `eslint-plugin-testing-library` is enforced:
   tests query with `screen.getByRole` and similar, never
   `container.querySelector`, `.closest()` or other DOM traversal. MUI
   multiline `TextField`s render a hidden shadow `<textarea>` with the same
   accessible name, so `getAllByRole(...)[0]` is the established pattern,
   not something to flag.
8. **Regexes meant to match repeatedly need the `g` flag.** It shipped once
   without it: `parseManaSymbols` replaced only the first `{u}` in `{u}{u}`.
   Flag any `.replace(/.../, ...)` without `g` where the text can repeat.
9. **Mana and tap symbols go through `parseManaSymbols`**
   (`src/utils/manaSymbols.ts`). A new field doesn't reinvent bracket-symbol
   parsing inline.
10. **Token fields and storage have one source.** `src/utils/tokenFields.ts`
    defines the token's fields, shared by the draft, the JSON file and the
    gallery: a new field that should survive a reload goes there, not in a
    list of its own. Every `localStorage` access goes through
    `src/utils/safeStorage.ts`, which fails silently in private browsing or
    on a full quota. The uploaded image and the crop are blob URLs and are
    never persisted; that's an accepted limitation, not a bug.
11. **Print constants are fixed.** Export renders at 300 dpi (`PRINT_DPI`
    and `SCREEN_DPI` in `App.tsx`), deliberately not configurable (#9), and
    the card is 63.5 mm × 88.9 mm (`.card-wrapper` in `Card/index.scss`).
    Flag a change to either unless it's the point of the pull request.
12. **Form sections.** `App.tsx` composes `CardStyleSection`,
    `ImageUploadSection`, `CardDataSection` and `TokenCard`, each taking
    `formik` as a prop. New fields join a section, or a new section, instead
    of growing `App.tsx` back into a monolith.

## Release promotion (release branch → `main`)

- Every issue closed along the release is Done on the board and closed.
- No debug leftovers: a test Publisher ID, a stray `console.log`, a
  `.only()` in a test.
- Don't bump `package.json`'s `version` by hand: `version-bump.yml` does it
  after the merge, from the Conventional Commits.
- The CI badge in `README.md` points at `marquesgabriel/mtg` and `ci.yml`
  (it once pointed at a stale, renamed repo).
- Low-priority items deferred to a later release aren't blockers.
