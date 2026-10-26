# pj-review round 1 — PR #11 (issue #4), 2026-10-26

Verdict: 1 blocking, 20 non-blocking (5 review + 6 supplement + 9 supplement 2).
Review: https://github.com/Piotr12/memorynote.io/pull/11#pullrequestreview-5657798888
Supplement: https://github.com/Piotr12/memorynote.io/pull/11#issuecomment-6425965808
Supplement 2: https://github.com/Piotr12/memorynote.io/pull/11#issuecomment-6426659088

## Checks (fresh worktree at 8e139e7)

| Check | Result |
|---|---|
| docker build (two-stage node→nginx) | pass |
| test/page_test.sh | pass |
| test/image_test.sh | pass |
| test/config_test.sh | pass |
| npm run lint (eslint + tsc) | pass |
| npm run lint after `rm -rf .next` (fresh-clone check) | pass |
| unit tests (vitest) | 31 pass |
| e2e (playwright, fresh stamped build) | 12 pass |
| mutation (stryker) | 98.85%, 1 documented survivor, threshold 98 |
| actionlint | pass |
| gitleaks | pass |
| er_limit.py | pass |
| vale docs/ AGENTS.md | no new violations (15 pre-existing on main) |
| markdownlint-cli2 docs/ AGENTS.md | identical to main baseline |
| kamal config -c kamal-dev.yml | not run locally (needs ruby); CI covers it |

## Findings (review, 1B+5NB)

- Blocking: deploy.yml stamp step lacks the fail-fast guard required by the
  approved design (design.md lines 112–115, 199); the deployment.md Pipeline
  diagram lacks the stamp step; not recorded in Agent decisions.
- Non-blocking: type scale table drops the role names shown in mockup v2.
- Non-blocking: AGENTS.md App checks chain fails on a fresh checkout.
- Non-blocking: reuseExistingServer lets a local e2e run reuse a stale
  server on 4173 (demonstrated during this review).
- Non-blocking: tautological assertion in tokens.test.ts.
- Non-blocking: no-op ternary in the nav label lookup.

## Findings (supplement, 6NB)

- screenshots.mjs captures 2 of the 4 design-mandated viewports.
- --space-* tokens declared but consumed zero times.
- The no-flash e2e auto-retries, so it cannot fail.
- Input/secondary-button borders ≈1.49:1 light / ≈2.26:1 dark, below
  WCAG 1.4.11 3:1 (approved mockup uses the same tokens; human may waive).
- Dockerfile COPY . . after npm ci; .dockerignore missing node_modules/out.
- PR body names BUILD_* but the implementation uses NEXT_PUBLIC_BUILD_*.

## Findings (supplement 2, 9NB)

- Inline user-facing copy in the spec-strip caption (page.tsx:122).
- Display copy in the tokens.ts data module (breakpoint uses, notes,
  samples).
- Magic number: style={{ marginTop: 8 }} (page.tsx:280).
- README checks table: screenshots are not part of npm run e2e.
- Theme toggle label wrong on first paint in dark mode (state init).
- Font assertion in preview.spec.ts cannot fail (tautology).
- contrast.test.ts AA pairings hardcode hex instead of token values.
- colorTokens holds 5 of 13 CSS color tokens; dark --text #fafafa drifts
  from mockup v2 #FAFAF9 and no test can see it.
- page.tsx comment + PR body claim the meta refresh is hoisted into
  <head>; App Router renders it in <body>.

Dropped after verification:
- serve.mjs path guard (URL class collapses %2e/%2F; tested live, safe).
- deploy concurrency group (resolves per environment correctly).
- next-env.d.ts → .next/types imports before build (lint passes on a fresh
  clone; skipLibCheck suppresses the unresolved .d.ts imports).
