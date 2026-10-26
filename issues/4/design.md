# Design — #4 design system for memorynote.io

## Approach

Replace the static hello-world page with a Next.js (App Router) + React +
TypeScript application that is the design system itself. One CSS custom
property file, `src/app/globals.css`, is the single token source: color
(light and dark), typography, spacing, corner radius, and breakpoints.
Every component consumes tokens only, through `var()`.

The theme is a `data-theme` attribute on `<html>`. A small inline script in
`<head>`, before the stylesheet, sets it from the persisted choice in
`localStorage` or from `matchMedia('(prefers-color-scheme: dark)')` when no
choice is stored — no flash of the wrong mode. The `ThemeToggle` client
component flips the attribute and persists the choice.

All user-facing strings live in one flat catalog module,
`src/i18n/messages.ts`. That is the "web i18n catalog" rule from AGENTS.md
without an i18n framework, which the spec excludes.

The footer reads `NEXT_PUBLIC_BUILD_BRANCH` and `NEXT_PUBLIC_BUILD_COMMIT`.
Both are inlined by Next.js at build time from Docker build args. A pure
function `footerLine(branch, commit)` renders the second line: both values
present, one present, or neither (second line omitted entirely). The
Dockerfile declares the args with empty defaults, so a build without them
degrades the footer to the first line, never to a placeholder.

`/` redirects to `/design-preview`. `/up` returns 200 for the kamal-proxy
health check. The image is Next.js `standalone` output running on
node:22-alpine, listening on port 3000 (the kamal default). The kamal
deployment pipeline is unchanged.

Inter is self-hosted as one variable woff2 in `public/fonts/`, declared with
`font-display: block` so there is no runtime swap. No external font request
ever happens.

## Changes

New app (branch `pj/4`, replacing `public/index.html`):

```text
package.json                  next, react, react-dom; dev: typescript, eslint,
                              vitest, playwright, stryker
next.config.ts                output: "standalone"
tsconfig.json
eslint.config.mjs
vitest.config.ts
playwright.config.ts
stryker.config.mjs
src/
  app/
    layout.tsx                lang, metadata, theme inline script, fonts,
                              globals, Footer
    page.tsx                  redirect to /design-preview
    globals.css               tokens + base styles (single token source)
    up/route.ts               200 ok
    design-preview/page.tsx   v2 layout: sticky aside nav, sections
  components/
    button.tsx  card.tsx  field.tsx  text.tsx
    footer.tsx  theme-toggle.tsx
  lib/
    theme.ts                  resolveTheme(persisted, systemPrefersDark)
    build-info.ts             footerLine(branch, commit)
    contrast.ts               WCAG relative luminance and contrast ratio
  i18n/
    messages.ts               every user-facing string
public/fonts/inter-variable.woff2
test/
  e2e/preview.spec.ts         toggle persistence, footer, no external fonts,
                              sections at desktop and mobile
  e2e/screenshots.mjs         1440 and 390, light and dark, full page
scripts/screenshots.mjs       same, invoked by npm
test/page_test.sh             updated: builds with BUILD_BRANCH/COMMIT args,
                              checks /design-preview content, /up, footer,
                              and the empty-args degradation
test/image_test.sh            updated: standalone node image, no credentials,
                              no credential-like env vars
test/config_test.sh           updated: also asserts BUILD_BRANCH and
                              BUILD_COMMIT are present in both configs
```

Modified:

- `Dockerfile`: two stages — node:22-alpine build (`npm ci`, `next build`)
  and node:22-alpine runtime with the standalone output, `.next/static`,
  and `public/`. `ARG BUILD_BRANCH=""` / `ARG BUILD_COMMIT=""` become
  `ENV NEXT_PUBLIC_BUILD_BRANCH` / `NEXT_PUBLIC_BUILD_COMMIT`. The
  `ENVIRONMENT` arg and the placeholder replacement are gone: the new spec
  has no environment marker.
- `kamal-dev.yml`, `kamal-prod.yml`: `builder.args` gains
  `BUILD_BRANCH: ""` and `BUILD_COMMIT: ""`. Kamal 2.12 passes build args
  from the config file only (verified in the 2.12.0 source: no
  interpolation, no CLI override), so the values must be stamped per
  deploy.
- `.github/workflows/deploy.yml`: before `kamal deploy`, stamps the actual
  branch name and commit sha into the checked-out kamal config with sed.
  A deploy never ships the literal placeholders; a manual deploy outside
  the workflow keeps the empty defaults and the footer degrades.
- `.github/workflows/ci.yml`: adds one node job — npm ci, lint (eslint +
  `tsc --noEmit`), unit tests (vitest), mutation tests (StrykerJS), e2e
  (Playwright, including the screenshots). The existing actionlint,
  gitleaks, and `kamal config` checks stay, and the three shell tests run
  against the updated scripts.
- `AGENTS.md`: stack line and the Build/Lint/Test commands.
- `docs/`: ADR 0003 (stack switch), `deployment.md` (node image, build
  args, stamping step).

## Data model

None. The design system persists nothing on the server. The theme choice
lives in browser `localStorage`. No migration.

## Test plan

Acceptance criterion to test:

1. One token source — unit test: `globals.css` declares every required
   token name in `:root` and the dark theme, and no component stylesheet or
   inline style uses a raw hex color (the token table on the page shows
   hex values as text content, which is data, not style). The breakpoint
   table matches the media queries in the css.
2. Next.js + React, obligatory reference — `next build` passes; the four
   core components render on `/design-preview` (e2e); AGENTS.md names the
   stack (checked in this PR's doc updates).
3. Light and dark, leading orange — unit: `--orange` is `#F97316` in both
   themes; `contrast.ts` verifies every spec-named pairing is at or above
   the WCAG 2.2 AA ratios (4.5 normal text, 3.0 large text and UI).
4. Inter, self-hosted, no swap — unit: the `@font-face` block references
   the local woff2 and uses `font-display: block`; e2e: no request is made
   to a font host.
5. System-following theme, persisted toggle — unit: the full
   `resolveTheme(persisted, system)` matrix; e2e: toggling persists across
   a reload, and with no stored value the system preference is followed
   (emulated media).
6. `/design-preview` follows v2 — e2e: the sticky nav, all five sections,
   and the component stage exist at desktop and mobile widths; full-page
   screenshots at 1440 and 390 in both modes.
7. Footer on every page — e2e: footer with branch and commit on
   `/design-preview` and `/`; docker page test: an image built with the
   args shows them, and an image built without them shows the first line
   only.

Edge cases:

- No flash — the inline script sets `data-theme` before the stylesheet;
  unit test asserts the script content does the lookup in the right
  order; e2e asserts the correct attribute on first load in both modes.
- Missing branch or commit — unit test on `footerLine` plus the
  empty-args docker build.
- AA contrast — unit test on the token values, both themes.
- 640 px — e2e at 390 wide.

Mutation tests: StrykerJS (vitest runner) on `src/lib/theme.ts`,
`src/lib/build-info.ts`, and `src/lib/contrast.ts`. Every surviving
mutant is killed or explained in the PR.

## Docs

- `docs/adr/0003-nextjs-stack.md`: context (the static page cannot hold a
  token-driven theme system), decision (Next.js App Router + React +
  TypeScript, self-hosted variable Inter, standalone image, kamal
  unchanged), consequences (CI needs a node job, the Dockerfile is two
  stages, build args stamp the footer).
- `docs/deployment.md`: the image is a node server, not nginx; the
  pipeline diagram gains the stamp step; the build args are documented.
- `AGENTS.md`: the stack line and the Build/Lint/Test commands change.
- No data model change: the system has no entities.

## Risks

- Build-time env plumbing. Kamal 2.12 reads build args from the config
  file only, so the deploy workflow stamps the config per deploy. The
  checked-in configs carry empty defaults, so any deploy path degrades
  the footer to the first line at worst; the literal values
  `__BUILD_BRANCH__` style placeholders never reach the image.
- CI changes are unavoidable for a stack switch. The changes are
  additive: the existing actionlint, gitleaks, and kamal config checks
  all stay.
- The `ENVIRONMENT` build arg and its "a build without it must fail"
  guard disappear with the old page. The new guard is the footer
  degradation, covered by unit and docker tests.
- Playwright in CI downloads a browser once per run; the screenshots are
  full-page at the two mockup viewports, so they are stable enough to
  serve as evidence.
- The variable Inter woff2 is about 300 KB, one file, all weights.
  Acceptable for a single-page app; it is the only web font.
- The design-preview page shows hex values as text in the token tables.
  Those are data, not styles; the no-raw-hex rule applies to styling
  only.
