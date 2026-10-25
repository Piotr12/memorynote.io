#!/usr/bin/env bash
# Idempotent bootstrap of the deploy host (146.59.105.8).
# The deploy workflow runs this as: ssh debian@host 'sudo -n bash -s' < host-bootstrap.sh
# Reaching this script already proves that debian has passwordless sudo.
set -euo pipefail

HOST_IP=146.59.105.8
REGISTRY_NAME=registry
REGISTRY_IMAGE=registry:3
REGISTRY_PORT=5000
REGISTRY_DATA_VOLUME=registry-data

echo "passwordless sudo: ok"

if ! command -v docker >/dev/null 2>&1; then
  echo "error: docker is not installed on the deploy host" >&2
  exit 1
fi
echo "docker: ok"

# Kamal runs its remote docker commands as debian. The first deploy must
# leave that user able to talk to the docker daemon.
if ! su -s /bin/sh debian -c "docker version" >/dev/null 2>&1; then
  echo "granting debian access to docker"
  usermod -aG docker debian
fi

# Trust the host-local registry from the docker daemon. First run only:
# the daemon restart brings existing containers back automatically.
DAEMON_JSON=/etc/docker/daemon.json
if ! grep -q "$HOST_IP:$REGISTRY_PORT" "$DAEMON_JSON" 2>/dev/null; then
  echo "adding $HOST_IP:$REGISTRY_PORT to docker insecure-registries"
  mkdir -p /etc/docker
  python3 - "$DAEMON_JSON" "$HOST_IP:$REGISTRY_PORT" <<'PY'
import json, sys

path, registry = sys.argv[1], sys.argv[2]
try:
    with open(path) as f:
        config = json.load(f)
except (FileNotFoundError, json.JSONDecodeError):
    config = {}
config.setdefault("insecure-registries", [])
if registry not in config["insecure-registries"]:
    config["insecure-registries"].append(registry)
    with open(path, "w") as f:
        json.dump(config, f, indent=2)
PY
  systemctl restart docker
  echo "docker restarted (existing containers come back automatically)"
fi

# The registry container. Unauthenticated: the images hold no credentials.
if ! docker image inspect "$REGISTRY_IMAGE" >/dev/null 2>&1; then
  docker pull "$REGISTRY_IMAGE"
fi
if docker inspect "$REGISTRY_NAME" >/dev/null 2>&1; then
  docker start "$REGISTRY_NAME" 2>/dev/null || true
else
  docker volume create "$REGISTRY_DATA_VOLUME"
  docker run -d \
    --name "$REGISTRY_NAME" \
    --restart unless-stopped \
    -p "$REGISTRY_PORT:$REGISTRY_PORT" \
    -v "$REGISTRY_DATA_VOLUME:/var/lib/registry" \
    "$REGISTRY_IMAGE"
fi

# The firewall must let the GitHub runner push to the registry.
if command -v ufw >/dev/null 2>&1 && ufw status 2>/dev/null | grep -q "Status: active"; then
  ufw allow "$REGISTRY_PORT/tcp"
fi

for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:$REGISTRY_PORT/v2/" >/dev/null 2>&1; then
    echo "registry: ok on port $REGISTRY_PORT"
    exit 0
  fi
  sleep 2
done
echo "error: the registry did not come up on port $REGISTRY_PORT" >&2
exit 1
