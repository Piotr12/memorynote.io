# Kamal local image registry

## Context

The app image is built on the GitHub runner and deployed with kamal. The
image holds no credentials, so no external registry is needed, and a
deploy must not require a bootstrap step on the deploy host.

The first design ran a `registry:3` container on the deploy host and
pushed to it from the runner at `146.59.105.8:5000`. The deploy failed:
the runner could not reach that port, and the design required a bootstrap
step on the host.

## Decision

We use the local registry that kamal defines in its
[registry configuration documentation](https://kamal-deploy.org/docs/configuration/docker-registry/).
Both kamal configs set `registry.server: localhost:5000`. During a deploy,
kamal starts a `kamal-docker-registry` container on the machine that runs
the deploy, here the GitHub runner, and pushes the image to it. Kamal then
port-forwards `127.0.0.1:5000` on the deploy host over SSH, so the host
pulls the image through the tunnel.

The docker daemon treats localhost as an insecure registry by default, so
neither the runner nor the deploy host needs an `insecure-registries`
entry.

## Consequences

- The deploy host runs no registry and exposes no registry port. A deploy
  needs SSH access and docker on the host only.
- The registry container is ephemeral. It exists on the runner for the
  duration of the deploy and is gone when the run ends.
- The image travels from the runner to the host over the SSH tunnel, not
  over a public registry port.
- The registry holds no credentials and no secrets.
