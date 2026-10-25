# Host-local, unauthenticated image registry

## Context

The spec for #3 requires that the app image is built on the GitHub runner
and pushed to a registry on the deploy host, with no external registry.
The image holds no credentials, so the registry needs no authentication.

## Decision

We run a `registry:3` container on the deploy host, bound to port 5000 on
all interfaces. The GitHub runner pushes to it over plain HTTP. The
host bootstrap script creates the container idempotently and adds the
registry to the docker daemon's `insecure-registries` exactly once.

Kamal requires `registry.username` and `registry.password` in its config
for non-localhost registries. We set them to `anonymous` and
`unauthenticated`. The registry issues no challenge, so `docker login`
succeeds and the values hold no privilege.

## Consequences

- The registry is publicly reachable and unauthenticated. Anyone can
  pull the images and push to the image names. The images hold no
  secrets, so the exposure is the static page only.
- The docker daemon on the deploy host carries a one-time configuration
  change and one restart. Existing containers come back automatically.
- Moving to an external registry later is a config change in the two
  kamal files and the workflow.
