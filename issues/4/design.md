# Design — #4 design system for memorynote.io

Revision 2. Revision 1 was reviewed (round 1, verdict: changes). The two
blocking findings are fixed here: the app is a static export served by the
existing nginx pipeline on port 80 (kamal's shared proxy health-checks
`proxy.app_port`, default 80, per ADR 0002 — a node server on 3000 would
have failed every deploy), and the e2e test asserts the required content
of every section of `/design-preview`, not only section existence.

## Approach

Replace the static hello-world page with a Next.js (App Router) + React +
TypeScript application that is the design system itself, built as a static
export. One CSS custom property file, `src/app/globals.css`, is the single
token source: color (light and dark), typography, spacing, corner radius,
and breakpoints. Every component consumes tokens only, through `var()`.

Static export (`output: "export"`) because the spec says "no server
logic": the build produces plain HTML, CSS, and JS in `out/`, and the
existing nginx:1.27-alpine image serves it on port 80, exactly like today.
The kamal deployment pipeline, the shared proxy, and the port are all
unchanged. This also keeps the image small and the deploy path identical
to the one that is live now.

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

`/` redirects to `/design-preview` with a `meta httpEquiv="refresh"` tag,
the standard static-export redirect. `/up` is the existing `public/up`
file, copied into the export as today; it is the kamal-proxy health
endpoint.

Inter is self-hosted as one variable woff2 in `public/fonts/`, declared
with `font-display: block`. The file is served from the same origin and is
48 KB, so it is loaded before the block period ends and no swap happens;
`font-display: swap` is the only value that would cause a runtime swap,
and it is not used. No external font request ever happens.

## Changes

New app (branch `pj/4`, replacing `public/index.html`):

```text
package.json                  next, react, react-dom; dev: typescript,
                              eslint, vitest, playwright, stryker
next.config.ts                output: "export", distDir: "out"
tsconfig.json
eslint.config.mjs
vitest.config.ts
playwright.config.ts
stryker.config.mjs
src/
  app/
    layout.tsx                lang, metadata, theme inline script, fonts,
                              globals, Footer
    page.tsx                  meta refresh redirect to /design-preview
    globals.css               tokens + base styles (single token source)
    design-preview/page.tsx   v2 layout: sticky aside nav (>= 768 px),
                              five sections
  components/
    button.tsx  card.tsx  field.tsx  text.tsx
    footer.tsx  theme-toggle.tsx
  lib/
    theme.ts                  resolveTheme(persisted, systemPrefersDark)
    build-info.ts             footerLine(branch, commit)
    contrast.ts               WCAG relative luminance and contrast ratio
  i18n/
    messages.ts               every user-facing string
public/
  up                          unchanged, copied into the export
  fonts/inter-variable.woff2  self-hosted, 48 KB, latin, wght axis
test/
  e2e/preview.spec.ts         toggle persistence, keyboard toggle and
                              focus ring, footer, redirect, no external
                              font requests, sticky nav only at >= 768,
                              and per-section content assertions
scripts/
  serve.mjs                   static file server for out/, used by
                              Playwright and the screenshot run
  screenshots.mjs             full-page screenshots: 390, 640, 768, and
                              1440, in light and dark
```

Modified:

- `Dockerfile`: two stages. Stage 1, node:22-alpine: `npm ci`, then
  `next build` with `ENV NEXT_PUBLIC_BUILD_BRANCH` and
  `NEXT_PUBLIC_BUILD_COMMIT` set from `ARG BUILD_BRANCH=""` and
  `ARG BUILD_COMMIT=""`. Stage 2, nginx:1.27-alpine: `out/` copied to
  `/usr/share/nginx/html/`, the default 50x.html removed. The
  `ENVIRONMENT` arg and its placeholder replacement are gone: the new
  spec has no environment marker.
- `kamal-dev.yml`, `kamal-prod.yml`: `builder.args` gains
  `BUILD_BRANCH: ""` and `BUILD_COMMIT: ""`. Kamal 2.12 passes build args
  from the config file only (verified in the 2.12.0 source,
  `configuration/builder.rb`; confirmed by the round 1 reviewer), so the
  values are stamped per deploy.
- `.github/workflows/deploy.yml`: before `kamal deploy`, stamps the actual
  branch name and commit sha into the checked-out kamal config with sed,
  then fails the step if either stamped value is missing from the config
  (fail fast, so a stamping bug can never ship an empty footer silently).
  A manual deploy outside the workflow keeps the empty defaults and the
  footer degrades to the first line.
- `.github/workflows/ci.yml`: adds one node job — npm ci, lint (eslint +
  `tsc --noEmit`), unit tests (vitest), mutation tests (StrykerJS), e2e
  (Playwright, including the screenshots). The existing actionlint,
  gitleaks, and `kamal config` checks stay, and the three shell tests run
  against the updated scripts.
- `AGENTS.md`: stack line and the Build/Lint/Test commands.
- `README.md`: currently stale evidence for #3; rewritten for the new
  stack.
- `docs/`: ADR 0003 (static export on the nginx pipeline), `deployment.md`
  (build stage, build args, stamp step with its guard).

## Data model

None. The design system persists nothing on the server. The theme choice
lives in browser `localStorage`. No migration.

## Test plan

Acceptance criterion to test:

1. One token source — unit test: `globals.css` declares every required
   token name in `:root` and the dark theme, and no component style or
   inline style uses a raw hex color (the token table on the page shows
   hex values as text content, which is data, not style). The breakpoint
   table matches the media queries in the css.
2. Next.js + React, obligatory reference — `next build` passes; the four
   core components render on `/design-preview` (e2e: button, card, input,
   and text each present in the component stage); AGENTS.md names the
  stack (updated in this PR).
3. Light and dark, leading orange — unit: `--orange` is `#F97316` in both
   themes; `contrast.ts` verifies every spec-named pairing is at or above
   the WCAG 2.2 AA ratios (4.5 normal text, 3.0 large text and UI).
4. Inter, self-hosted, no swap — unit: the `@font-face` block references
   the local woff2 and its `font-display` is `block`, not `swap`; e2e:
   no request is made to a font host.
5. System-following theme, persisted toggle — unit: the full
   `resolveTheme(persisted, system)` matrix; e2e: toggling persists across
   a reload, and with no stored value the system preference is followed
   (emulated media). The toggle works by keyboard (Enter and Space) and
   shows a visible focus state, per the spec's Access section.
6. `/design-preview` follows v2 — e2e, at 1440 and 390: the aside nav is
   sticky at 1440 and not sticky at 390 (the mockup makes it sticky at
   768 and up); every section is present AND its required content is
   asserted: the color section shows each token name and both light and
   dark hex values, the typography section shows the display specimen and
   the four scale roles, the spacing section shows the 4 through 64
   values, the radius section shows 8 px controls and 12 px cards, the
   breakpoint section shows 640, 768, 1024, and 1280, and the component
   stage shows the button, input, card, and text components. Full-page
   screenshots at 390, 640, 768, and 1440 in both modes, saved as
   evidence.
7. Footer on every page — e2e: footer with branch and commit on
   `/design-preview`; docker page test: an image built with the args
   shows them on the served page, and an image built without them shows
   the first line only, with no second line at all.

Edge cases:

- No flash — the inline script sets `data-theme` before the stylesheet;
  unit test asserts the script content does the lookup in the right
  order; e2e asserts the correct attribute on first load in both modes.
- Missing branch or commit — unit test on `footerLine` plus the
  empty-args docker build.
- AA contrast — unit test on the token values, both themes.
- 640 px — e2e runs the content assertions at 640 as well as 390, and a
  screenshot exists at 640.

Mutation tests: StrykerJS (vitest runner) on `src/lib/theme.ts`,
`src/lib/build-info.ts`, and `src/lib/contrast.ts`. Every surviving
mutant is killed or explained in the PR.

## Docs

- `docs/adr/0003-static-export-on-nginx.md`: context (the spec says no
  server logic; kamal's shared proxy health-checks port 80; the live
  pipeline is nginx), decision (Next.js App Router + React + TypeScript,
  `output: "export"`, the existing nginx image, build-time build args for
  the footer), consequences (the Dockerfile is two stages with a node
  build stage, CI needs a node job, the redirect at `/` is a meta refresh,
  a node runtime is deliberately not introduced).
- `docs/deployment.md`: the image gains a node build stage; the pipeline
  diagram gains the stamp step with its fail-fast guard; the build args
  are documented.
- `AGENTS.md`: the stack line and the Build/Lint/Test commands change.
- `README.md`: rewritten for the new stack.
- No data model change: the system has no entities.

## Risks

- Build-time env plumbing. Kamal 2.12 reads build args from the config
  file only, so the deploy workflow stamps the config per deploy, with a
  fail-fast guard after the stamp. The checked-in configs carry empty
  defaults, so any deploy path degrades the footer to the first line at
  worst; literal placeholders never reach the image.
- The shared proxy (ADR 0002) is untouched: the app stays on port 80 and
  the proxy config is unchanged, which the round 1 reviewer confirmed is
  the reason both live environments deploy cleanly.
- CI changes are unavoidable for a stack switch. The changes are
  additive: the existing actionlint, gitleaks, and kamal config checks
  all stay.
- The `ENVIRONMENT` build arg and its "a build without it must fail"
  guard disappear with the old page. The replacement guard is the footer
  degradation, covered by unit and docker tests.
- The meta refresh redirect at `/` is the static-export idiom. It is
  browser-side, fires with content 0, and the e2e asserts the landing
  page is `/design-preview`.
- Playwright in CI downloads a browser once per run; the screenshots are
  full-page at four viewports, so they are stable enough to serve as
  evidence.
- The variable Inter woff2 is 48 KB, one file, all weights, latin
  subset. The site content is English; latin covers it.
- The design-preview page shows hex values as text in the token tables.
  Those are data, not styles; the no-raw-hex rule applies to styling
  only.
