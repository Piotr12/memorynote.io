<!-- pj:spec sha256:a7f97e95450cbe11774951c2b759eef3b79d341a6df3c03d4ecd566e124dbe5d -->
## Spec
### Acceptance criteria
- A push to `dev` deploys the app to `dev.memorynote.io` over HTTPS.
- A push to `main` deploys the app to `memorynote.io` and `www.memorynote.io` over HTTPS.
- The page shows "Hello world" plus a marker naming the environment (dev or prod).
- Deploys run in GitHub Actions, use kamal on 146.59.105.8, and authenticate with the existing `SSH_DEPLOY_KEY` secret.
- The image is built on the GitHub runner and pushed to a private registry on the deploy host; no external registry.
- An in-flight deploy is cancelled when a newer push to the same branch lands.
- The repo and the image hold no credentials.

Out of scope: real app features, data, and auth; this issue covers the hello world app and the deploy pipeline only.
### Bug details
N/A, not a bug.
### Data model
N/A, no persistence; the app is static files.
### Mockup
N/A, Q-006: the placeholder page has nothing to design.
### Edge cases
- A dev deploy never touches the prod environment; dev and prod are separate kamal apps.
- A failed deploy leaves the last good version running (kamal rollback).
- Both prod hostnames serve the same app instance.
- The deploy user `debian` needs passwordless sudo for kamal setup; the first deploy verifies it.
### Performance
N/A, one small static page; the web server caches it.
### Security
The deploy authenticates only with the existing `SSH_DEPLOY_KEY` secret. TLS is issued automatically by Caddy. The image holds no secrets, so the registry on the host can be unauthenticated. No new secrets are added to the repo.
### Access
The workflow runs on pushes to `dev` and `main`. A manual trigger deploys either environment. Anyone who can push to the branch can trigger a deploy.
### Human decisions
Q-001: No external registry; the image is built on the GitHub runner.
Q-002: All three domains already point to 146.59.105.8.
Q-003: The deploy key logs in as user `debian`.
Q-004: The implementation creates `dev` from `main`.
Q-005: Prod deploys on every push to `main`, plus a manual trigger for both environments.
Q-006: No mockup; the placeholder page has nothing to design.
Q-007: The page shows "Hello world" plus a dev/prod marker.
Q-008: An in-flight deploy is cancelled; only the newest per branch runs.
### Agent decisions
Q-001: Kamal deploys an image from a registry; a private registry runs on 146.59.105.8, and the runner pushes to it.
