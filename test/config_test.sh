#!/usr/bin/env bash
# The dev and prod kamal configs must target different apps, images and
# domains, so a dev deploy can never replace the prod app.
set -euo pipefail
cd "$(dirname "$0")/.."

fail() { echo "FAIL: $*" >&2; exit 1; }

python3 - <<'PY' || fail "the dev and prod configs are cross-wired"
import sys, yaml

dev = yaml.safe_load(open("kamal-dev.yml"))
prod = yaml.safe_load(open("kamal-prod.yml"))

checks = {
    "different services": dev["service"] != prod["service"],
    "different images": dev["image"] != prod["image"],
    "different proxy hosts": set(dev["proxy"]["hosts"]) != set(prod["proxy"]["hosts"]),
    "dev environment arg": dev["builder"]["args"]["ENVIRONMENT"] == "dev",
    "prod environment arg": prod["builder"]["args"]["ENVIRONMENT"] == "prod",
    "same registry": dev["registry"]["server"] == prod["registry"]["server"],
    "same servers": dev["servers"] == prod["servers"],
}
bad = [name for name, ok in checks.items() if not ok]
if bad:
    print("bad checks:", ", ".join(bad), file=sys.stderr)
    sys.exit(1)
PY

echo "config test: ok"
