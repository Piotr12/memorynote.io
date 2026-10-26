#!/usr/bin/env bash
# Builds the app image for dev and prod and checks the served page
# and the health endpoint.
# The page must say "Hello world", show the right environment marker,
# and mention neither the other environment nor the raw placeholder.
# The container must answer /up with a 200.
# A build without ENVIRONMENT must fail.
set -euo pipefail
cd "$(dirname "$0")/.."

fail() { echo "FAIL: $*" >&2; exit 1; }

serve() { # <env>: prints the served page on stdout
  local env=$1 port body
  docker build --quiet --build-arg ENVIRONMENT="$env" -t "memorynote-test-$env" .
  docker rm -f "memorynote-test-$env" 2>/dev/null || true
  docker run -d --name "memorynote-test-$env" -p 127.0.0.1:0:80 "memorynote-test-$env" >/dev/null
  port=$(docker port "memorynote-test-$env" | awk -F: '{print $NF; exit}')
  # nginx needs a moment after the container starts.
  for _ in $(seq 1 20); do
    body=$(curl -fsS "http://127.0.0.1:$port/" 2>/dev/null) && break
    sleep 0.5
  done
  [ -n "${body:-}" ] || fail "$env: the page did not come up on 127.0.0.1:$port"
  curl -fsS "http://127.0.0.1:$port/up" >/dev/null \
    || fail "$env: the /up health endpoint did not answer 200"
  printf '%s\n' "$body"
}

check_page() { # <env>
  local env=$1 other body
  if [ "$env" = dev ]; then other=prod; else other=dev; fi
  body=$(serve "$env")
  echo "$body" | grep -q "Hello world" || fail "$env: the page does not say Hello world"
  echo "$body" | grep -q "class=\"marker\">$env<" || fail "$env: the page has no $env marker"
  if echo "$body" | grep -q "class=\"marker\">$other<"; then
    fail "$env: the page shows the $other marker"
  fi
  if echo "$body" | grep -q "__ENVIRONMENT__"; then
    fail "$env: the page still has the placeholder"
  fi
  docker rm -f "memorynote-test-$env" >/dev/null
  docker rmi -f "memorynote-test-$env" >/dev/null
  echo "$env page: ok"
}

check_page dev
check_page prod

if docker build --quiet --build-arg ENVIRONMENT= -t memorynote-test-bad . 2>/dev/null; then
  fail "a build without ENVIRONMENT succeeded"
fi
docker rmi -f memorynote-test-bad >/dev/null 2>&1 || true
echo "page test: ok"
