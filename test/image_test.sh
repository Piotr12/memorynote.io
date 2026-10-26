#!/usr/bin/env bash
# The image must hold no credentials.
# It may set no credential-like environment variable, and the html
# directory must hold only the page and the health endpoint file.
set -euo pipefail
cd "$(dirname "$0")/.."

fail() { echo "FAIL: $*" >&2; exit 1; }

IMAGE=memorynote-test-image
BASE=nginx:1.27-alpine
docker pull "$BASE"
docker build --quiet --build-arg ENVIRONMENT=dev -t "$IMAGE" .

base_env=$(docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' "$BASE")
app_env=$(docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' "$IMAGE")

while IFS= read -r line; do
  grep -Fxq "$line" <<< "$base_env" \
    || fail "the image adds a new environment variable: $line"
done <<< "$app_env"

files=$(docker run --rm "$IMAGE" ls -1 /usr/share/nginx/html/)
expected="$(printf 'index.html\nup')"
[ "$files" = "$expected" ] || fail "the html directory holds: $files"

docker rmi -f "$IMAGE" >/dev/null
echo "image test: ok"
