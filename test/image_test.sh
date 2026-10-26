#!/usr/bin/env bash
# The image must hold no credentials.
# It may set no credential-like environment variable. The html directory
# must hold the static export: the redirect page, the page itself, the
# health endpoint file, and the font. The old nginx default page must be
# gone.
set -euo pipefail
cd "$(dirname "$0")/.."

fail() { echo "FAIL: $*" >&2; exit 1; }

IMAGE=memorynote-test-image
BASE=nginx:1.27-alpine
docker pull "$BASE"
docker build --quiet -t "$IMAGE" .

base_env=$(docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' "$BASE")
app_env=$(docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' "$IMAGE")

while IFS= read -r line; do
  grep -Fxq "$line" <<< "$base_env" \
    || fail "the image adds a new environment variable: $line"
done <<< "$app_env"

check_file() { # <path>: exists and is not empty
  docker run --rm "$IMAGE" test -s "/usr/share/nginx/html/$1" \
    || fail "the export is missing $1"
}

check_file index.html
check_file design-preview/index.html
check_file up
check_file fonts/inter-variable.woff2

docker run --rm "$IMAGE" test ! -e /usr/share/nginx/html/50x.html \
  || fail "the nginx default page is still in the image"

docker rmi -f "$IMAGE" >/dev/null
echo "image test: ok"
