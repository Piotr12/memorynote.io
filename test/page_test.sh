#!/usr/bin/env bash
# Builds the app image and checks the served page, the redirect, and the
# health endpoint.
# With build args the footer must show the branch and commit. Without
# them it must degrade to the first line, with no empty build line.
# The root must redirect to /design-preview. The container must answer
# /up with a 200.
set -euo pipefail
cd "$(dirname "$0")/.."

fail() { echo "FAIL: $*" >&2; exit 1; }

serve() { # <tag> [branch commit]: starts the container, prints the served
  # page of /design-preview on stdout, leaves the port on stderr
  local tag=$1 branch=${2:-} commit=${3:-}
  local args=()
  [ -n "$branch" ] && args+=(--build-arg NEXT_PUBLIC_BUILD_BRANCH="$branch")
  [ -n "$commit" ] && args+=(--build-arg NEXT_PUBLIC_BUILD_COMMIT="$commit")
  docker build --quiet "${args[@]}" -t "memorynote-test-$tag" .
  docker rm -f "memorynote-test-$tag" 2>/dev/null || true
  docker run -d --name "memorynote-test-$tag" -p 127.0.0.1:0:80 "memorynote-test-$tag" >/dev/null
  local port
  port=$(docker port "memorynote-test-$tag" | awk -F: '{print $NF; exit}')
  # nginx needs a moment after the container starts.
  for _ in $(seq 1 20); do
    curl -fsS "http://127.0.0.1:$port/design-preview/" >/dev/null 2>&1 && break
    sleep 0.5
  done
  echo "port $port" >&2
  curl -fsS "http://127.0.0.1:$port/design-preview/"
}

stop() { # <tag>
  docker rm -f "memorynote-test-$1" >/dev/null
  docker rmi -f "memorynote-test-$1" >/dev/null
}

check_page() { # <tag> <branch> <commit>
  local tag=$1 branch=$2 commit=$3 body err port
  err=$(mktemp)
  body=$(serve "$tag" "$branch" "$commit" 2>"$err")
  port=$(awk '{print $2}' "$err")

  echo "$body" | grep -q "memorynote.io" \
    || fail "$tag: the page does not say memorynote.io"
  echo "$body" | grep -q "built on dgxspark in Jozefoslaw." \
    || fail "$tag: the footer has no first line"
  echo "$body" | grep -q "branch: $branch" \
    || fail "$tag: the footer does not show the branch $branch"
  echo "$body" | grep -q "commit: $commit" \
    || fail "$tag: the footer does not show the commit $commit"

  # the health endpoint answers 200
  curl -fsS "http://127.0.0.1:$port/up" >/dev/null \
    || fail "$tag: the /up health endpoint did not answer 200"

  # the root serves the redirect page, which the browser follows to the
  # one page (static export: no HTTP redirect, a meta refresh in the head)
  local root
  root=$(curl -fsS "http://127.0.0.1:$port/")
  echo "$root" | grep -q 'http-equiv="refresh" content="0; url=/design-preview/"' \
    || fail "$tag: the root does not redirect to /design-preview/"

  rm -f "$err"
  stop "$tag"
  echo "$tag page: ok"
}

check_page stamped main 8f3a2c1d

# without build args the footer degrades to the first line
serve_noargs() {
  local tag=$1
  docker build --quiet -t "memorynote-test-$tag" .
  docker rm -f "memorynote-test-$tag" 2>/dev/null || true
  docker run -d --name "memorynote-test-$tag" -p 127.0.0.1:0:80 "memorynote-test-$tag" >/dev/null
  local port
  port=$(docker port "memorynote-test-$tag" | awk -F: '{print $NF; exit}')
  for _ in $(seq 1 20); do
    curl -fsS "http://127.0.0.1:$port/design-preview/" >/dev/null 2>&1 && break
    sleep 0.5
  done
  local body
  body=$(curl -fsS "http://127.0.0.1:$port/design-preview/")
  echo "$body" | grep -q "built on dgxspark in Jozefoslaw." \
    || fail "noargs: the footer has no first line"
  if echo "$body" | grep -q "branch:" || echo "$body" | grep -q "commit:"; then
    fail "noargs: the footer shows an empty build line"
  fi
  curl -fsS "http://127.0.0.1:$port/up" >/dev/null \
    || fail "noargs: the /up health endpoint did not answer 200"
  stop "$tag"
  echo "noargs page: ok"
}

serve_noargs noargs

echo "page test: ok"
