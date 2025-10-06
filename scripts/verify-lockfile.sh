#!/usr/bin/env bash
# verify-lockfile.sh
# Run this from the repo root. Creates a temporary directory and runs a clean npm ci
# to verify that backend/package-lock.json is valid for npm ci.
set -euo pipefail
ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
TMPDIR=$(mktemp -d)
echo "Using temp dir: $TMPDIR"
cp -r "$ROOT_DIR/backend/package.json" "$TMPDIR/"
cp -r "$ROOT_DIR/backend/package-lock.json" "$TMPDIR/"
cd "$TMPDIR"
# skip lifecycle scripts to avoid husky prepare errors in CI-less env
npm ci --ignore-scripts --legacy-peer-deps --no-audit --no-fund
echo "npm ci succeeded in clean environment"
rm -rf "$TMPDIR"
exit 0
