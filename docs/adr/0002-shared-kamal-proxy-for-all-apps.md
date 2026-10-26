# All apps share the host kamal-proxy

## Context

Kamal 2.12 deploys each app's container on a shared docker network called
`kamal`. One container named `kamal-proxy` per host routes traffic for
every kamal app on that host and issues Let's Encrypt certificates for
their domains. The deploy host already runs the cpg.baby app this way.

## Decision

The `memorynote-dev` and `memorynote-prod` apps register with the same
shared `kamal-proxy` container. We do not run per-app proxies.

## Consequences

- Dev and prod deploys share one TLS-terminating component. A manual
  `kamal proxy reboot` briefly drains all apps on the host, including
  cpg.baby.
- Adding a domain to another kamal app on this host is a config change
  in that app, not a new proxy.
- Kamal reuses the running proxy as long as it is at least v0.9.2.
  An older proxy fails the deploy visibly and names the `kamal proxy
  reboot` command. There is no automatic reboot on deploy.
