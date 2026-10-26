# pj-review round 1 — PR #11 (issue #4), 2026-10-26

Verdict: 1 blocking, 11 non-blocking (5 in the review, 6 in the supplement).
Review: https://github.com/Piotr12/memorynote.io/pull/11#pullrequestreview-5657798888
Supplement: https://github.com/Piotr12/memorynote.io/pull/11#issuecomment-6425965808

## Checks (fresh worktree at 8e139e7)

| Check | Result |
|---|---|
| docker build (two-stage node→nginx) | pass |
| test/page_test.sh | pass |
| test/image_test.sh | pass |
| test/config_test.sh | pass |
| npm run lint (eslint + tsc) | pass |
| unit tests (vitest) | 31 pass |
| e2e (playwright, fresh stamped build) | 12 pass |
| mutation (stryker) | 98.85%, 1 documented survivor, threshold 98 |
| actionlint | pass |
| gitleaks | pass |
| er_limit.py | pass |
| vale docs/ AGENTS.md | no new violations (15 pre-existing on main) |
| markdownlint-cli2 docs/ AGENTS.md | identical to main baseline |
| kamal config -c kamal-dev.yml | not run locally (needs ruby); CI covers it |

## Findings (review)

- Blocking: deploy.yml stamp step lacks the fail-fast guard required by the
  approved design (design.md lines 112–115, 199); the deployment.md Pipeline
  diagram lacks the stamp step; not recorded in Agent decisions.
- Non-blocking: type scale table drops the role names shown in mockup v2
  (e2e asserts only the meta strings).
- Non-blocking: AGENTS.md App checks chain fails on a fresh checkout (e2e
  needs a stamped out/ and matching env vars; the playwright.config.ts
  comment claims the e2e run builds).
- Non-blocking: reuseExistingServer lets a local e2e run silently reuse a
  stale server on 4173 (demonstrated during this review).
- Non-blocking: tautological assertion in tokens.test.ts (cannot fail).
- Non-blocking: no-op ternary in the nav label lookup (page.tsx line 52).

## Findings (supplement, from the independent first pass)

- Non-blocking: screenshots.mjs captures 2 of the 4 design-mandated
  viewports; 640/768 evidence screenshots missing (design.md lines 94–95,
  167–168, 182–183); unrecorded.
- Non-blocking: --space-* tokens declared but consumed zero times; layout
  rules hardcode px values.
- Non-blocking: the no-flash e2e auto-retries, so a post-paint script would
  still pass (behaviour itself is correct).
- Non-blocking: input/secondary-button borders ≈1.49:1 (light) and ≈2.26:1
  (dark), below WCAG 1.4.11's 3:1 non-text minimum (spec line 30 AA);
  the approved mockup uses the same tokens, so the human may waive it.
- Non-blocking: Dockerfile COPY . . after npm ci with .dockerignore missing
  node_modules/out (local builds can shadow installed dependencies).
- Non-blocking: PR body Agent decisions names BUILD_BRANCH/BUILD_COMMIT;
  the implementation uses NEXT_PUBLIC_BUILD_* (justified, unrecorded).

Dropped after verification: serve.mjs path guard (Node's URL class
collapses %2e/%2F dot segments; boundary tested live, safe) and the deploy
concurrency group (expression resolves per environment correctly).
