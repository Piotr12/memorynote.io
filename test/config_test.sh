#!/usr/bin/env bash
# The dev and prod kamal configs must target different apps, images and
# domains, so a dev deploy can never replace the prod app.
# Both configs must enable proxy TLS, so the domains serve HTTPS.
# Both configs must carry empty build-arg defaults: the deploy workflow
# stamps the real branch and commit into the file before it deploys, and
# a checked-in value would leak into every manual build.
set -euo pipefail
cd "$(dirname "$0")/.."

fail() { echo "FAIL: $*" >&2; exit 1; }

python3 - <<'PY' || fail "the dev and prod configs are cross-wired"
import sys, yaml

dev = yaml.safe_load(open("kamal-dev.yml"))
prod = yaml.safe_load(open("kamal-prod.yml"))

def args(config):
    return config["builder"]["args"]

checks = {
    "different services": dev["service"] != prod["service"],
    "different images": dev["image"] != prod["image"],
    "different proxy hosts": set(dev["proxy"]["hosts"]) != set(prod["proxy"]["hosts"]),
    "dev branch arg is empty": args(dev)["NEXT_PUBLIC_BUILD_BRANCH"] == "",
    "prod branch arg is empty": args(prod)["NEXT_PUBLIC_BUILD_BRANCH"] == "",
    "dev commit arg is empty": args(dev)["NEXT_PUBLIC_BUILD_COMMIT"] == "",
    "prod commit arg is empty": args(prod)["NEXT_PUBLIC_BUILD_COMMIT"] == "",
    "same registry": dev["registry"]["server"] == prod["registry"]["server"],
    "same servers": dev["servers"] == prod["servers"],
    "dev proxy ssl": dev["proxy"].get("ssl") is True,
    "prod proxy ssl": prod["proxy"].get("ssl") is True,
}
bad = [name for name, ok in checks.items() if not ok]
if bad:
    print("bad checks:", ", ".join(bad), file=sys.stderr)
    sys.exit(1)
PY

echo "config test: ok"
