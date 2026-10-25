# Design: #3 static hello world app, kamal deploy

## Approach

The app is a single static page served by nginx in a container. Kamal 2.12 deploys it to
146.59.105.8 as two separate kamal apps: `memorynote-dev` (serves `dev.memorynote.io`) and
`memorynote-prod` (serves `memorynote.io` and `www.memorynote.io`). Each app has its own kamal
config file, its own image name, and its own `ENVIRONMENT` build arg, so the dev/prod marker
baked into the page can never be crossed.

Both apps register with the host's single shared `kamal-proxy` container — the one that already
runs for the existing cpg.baby app (verified in the kamal 2.12 source: one `kamal-proxy` container
per host on the shared `kamal` docker network, per-app config under a shared `apps-config`
directory, automatic Let's Encrypt TLS). No per-app proxy, no port conflicts.

The image is built on the GitHub runner (kamal's buildx flow with `builder.args`) and pushed to
an unauthenticated `registry:3` container that a host bootstrap script creates idempotently on
146.59.105.8 (port 5000, public binding so the runner can reach it; kamal's own `localhost`
registry feature binds 127.0.0.1 and is therefore unsuitable). No external registry is used.

The host bootstrap runs over SSH with the existing `SSH_DEPLOY_KEY` (user `debian`) before every
deploy. It verifies passwordless sudo (the spec's edge case: the first deploy must verify it),
verifies docker, creates the registry if missing, opens port 5000 in ufw if active, and adds the
registry to the host docker daemon's `insecure-registries` exactly once (guarded, one-time
`systemctl restart docker`; existing containers restart automatically).

GitHub Actions: a `deploy` workflow on pushes to `dev` (deploys dev) and `main` (deploys prod)
plus a manual dispatch for either environment. A concurrency group keyed per environment (`deploy-<env>`) with
`cancel-in-progress: true` cancels an in-flight deploy when a newer push to the same
branch lands (branch and environment are 1:1 for pushes), while a manual dispatch of the
other environment never cancels it. A `ci` workflow lints and tests on every PR and push.

## Changes

- `public/index.html` — the page: "Hello world" plus a marker showing `dev` or `prod`. A single
  `__ENVIRONMENT__` placeholder, substituted at build time.
- `Dockerfile` — `nginx:1.27-alpine`; the build fails unless `ENVIRONMENT` is `dev` or `prod`;
  substitutes the placeholder. No credentials, no ENV vars added.
- `kamal-dev.yml`, `kamal-prod.yml` — the two kamal apps: service, image, host-local registry
  (`146.59.105.8:5000`), the single server, proxy hosts, `builder.args.ENVIRONMENT`, ssh
  (user `debian`, key at `/home/runner/.ssh/deploy_key`). Kamal requires `registry.username` /
  `registry.password` in config for non-localhost registries; the values are
  `anonymous` / `unauthenticated` placeholders. The registry is unauthenticated (spec: the
  image holds no secrets), so `docker login` never challenges them; they hold no privilege.
- `scripts/host-bootstrap.sh` — idempotent host bootstrap (see Approach).
- `.github/workflows/deploy.yml` — configure the deploy key, trust the host registry in the
  runner docker daemon, bootstrap the host, `kamal deploy -c kamal-<env>.yml` (kamal 2.12
  pinned). Concurrency group `deploy-<env>`, cancel-in-progress.
- `.github/workflows/ci.yml` — actionlint on the workflows, `kamal config` on both configs,
  gitleaks scan, the page test, the image test, the config test.
- `test/page_test.sh` — builds the dev and prod images, serves them, asserts the page says
  "Hello world", shows the right marker, and mentions neither the other environment nor the
  raw placeholder. Also asserts a build without `ENVIRONMENT` fails.
- `test/image_test.sh` — builds the dev image, asserts its environment variables are a
  subset of the base image's (no new ENV at all) and the html directory holds only
  `index.html`.
- `test/config_test.sh` — asserts the dev and prod configs target different services,
  images and domains, and the same registry and servers, so a cross-wired config fails CI.
- `AGENTS.md` — Project section: stack, build, lint, test commands.
- `docs/deployment.md` (new) — the current deploy state: environments table, pipeline diagram.
- `docs/adr/0001-host-local-image-registry.md` — registry on the deploy host, unauthenticated.
- `docs/adr/0002-shared-kamal-proxy-for-all-apps.md` — all apps share the host kamal-proxy.

## Data model

None. The app is static files; there is no persistence.

## Test plan

| Acceptance criterion | Test |
|---|---|
| Push to `dev` deploys to `dev.memorynote.io` over HTTPS | The `deploy` workflow itself; runtime proof after the merge (curl of the URL, workflow run log). |
| Push to `main` deploys to `memorynote.io` and `www.memorynote.io` over HTTPS | Same, for prod (manual dispatch until `main` carries the pipeline). |
| Page shows "Hello world" plus the environment marker | `test/page_test.sh` for both images. |
| Deploys run in GitHub Actions, kamal on the host, `SSH_DEPLOY_KEY` | `ci.yml` validates both kamal configs; the workflow run is the runtime proof. |
| Image built on the runner, pushed to the private registry on the host | The `deploy` workflow builds via kamal buildx and pushes to `146.59.105.8:5000`; `ci.yml` keeps the configs valid. |
| In-flight deploy cancelled on a newer push to the same branch | Concurrency block in `deploy.yml` (actionlint-checked); a runtime two-push check can be done after the merge. |
| Failed deploy leaves the last good version running | Kamal 2.12 starts the new version and registers it with the proxy before stopping the old one; on failure the new version is stopped and the old keeps serving. No extra work needed. |
| Repo and image hold no credentials | gitleaks in `ci.yml`; `test/image_test.sh`; the Dockerfile adds no ENV. |
| Dev deploy never touches prod (edge case) | `test/config_test.sh`; separate kamal services, images and proxy hosts per environment. |

Mutation: `test/page_test.sh` covers the only real logic (the marker substitution and the
build guard). Verified locally by mutating the `sed` pattern and the guard line: the test
fails for each mutation.

## Docs

- `docs/deployment.md`: environments table (env, branch, domains, kamal app, image), a mermaid
  flowchart of the pipeline, host prerequisites.
- ADR-0001: the host-local unauthenticated registry (spec agent decision Q-001, recorded as a
  hard-to-reverse architecture choice).
- ADR-0002: relying on the shared host `kamal-proxy` instead of per-app proxies.
- `AGENTS.md` Project commands updated from TBD.

## Risks

- The host already serves cpg.baby through the shared `kamal-proxy` on 80/443. Kamal 2.12
  reuses the running proxy as long as it is at least v0.9.2, so the deploys are
  proxy-no-ops. If the running proxy is older, the deploy fails visibly and names the
  `kamal proxy reboot` command; that manual reboot briefly takes every app on the host
  down, cpg.baby included. There is no automatic proxy reboot on deploy.
- The first deploy verifies `debian` passwordless sudo and docker (spec edge case). A failure
  stops the pipeline with a clear message from the bootstrap script.
- The bootstrap may open port 5000 in ufw when ufw is active, a host firewall
  change documented in `docs/deployment.md`.
- The one-time `systemctl restart docker` on the host briefly restarts existing containers
  (they come back automatically). It runs only when `daemon.json` lacks the registry entry.
- The runner's docker daemon is configured with `insecure-registries` for the host IP
  (ephemeral runner state; nothing is written to the repo).
- The registry is publicly reachable and unauthenticated. The spec accepts this because the
  image holds no secrets; the page is the only content. Kamal prunes app containers and
  images on each deploy but never the registry; at this image size the growth is
  negligible.
- Kamal is pinned to 2.12.0 in both workflows. The design relies on 2.12-specific
  validation and proxy behavior.
- TLS is automatic via the shared proxy (Let's Encrypt) for all three domains; DNS already
  points at the host (spec Q-002).
