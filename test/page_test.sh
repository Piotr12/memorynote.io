#!/usr/bin/env bash
# Builds the app image for dev and prod and checks the served page.
# The page must say "Hello world", show the right environment marker,
# mention neither the other environment nor the raw placeholder,
# and a build without ENVIRONMENT must fail.
set -euo pipefail
cd "$(dirname "$0")/.."

fail() { echo "FAIL: $*" >&2; exit 1; }

serve() { # <env>: prints the served page on stdout
  local env=$1
  docker build --quiet --build-arg ENVIRONMENT="$env" -t "memorynote-test-$env" .
  docker rm -f "memorynote-test-$env" 2>/dev/null || true
  docker run -d --name "memorynote-test-$env" -p 127.0.0.1:0:80 "memorynote-test-$env" >/dev/null
  local port
  port=$(docker port "memorynote-test-$env" | awk -F: '{print $NF; exit}')
  curl -fsS "http://127.0.0.1:$port/"
}

check_page() { # <env>
  local env=$1 other body
  if [ "$env" = dev ]; then other=prod; else other=dev; fi
  body=$(serve "$env")
  echo "$body" | grep -q "Hello world" || fail "$env: the page does not say Hello world"
  echo "$body" | grep -q "$env" || fail "$env: the page has no $env marker"
  echo "$body" | grep -q "$other" && fail "$env: the page mentions the $other environment"
  echo "$body" | grep -q "__ENVIRONMENT__" && fail "$env: the page still has the placeholder"
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
