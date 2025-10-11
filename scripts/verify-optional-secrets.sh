#!/usr/bin/env bash
# verify-optional-secrets.sh
# Emits warnings for optional secrets (non-fatal). Use in CI to surface missing optional secrets.
set -euo pipefail

OPTIONAL=("GHCRPAT" "KUBECONFIG" "AWS_ACCESS_KEY_ID" "AWS_SECRET_ACCESS_KEY")
MISSING=()
for v in "${OPTIONAL[@]}"; do
  if [ -z "${!v-}" ]; then
    MISSING+=("$v")
  fi
done

if [ ${#MISSING[@]} -ne 0 ]; then
  echo "Warning: Optional secrets missing: ${MISSING[*]}"
  exit 0
else
  echo "All optional secrets present"
  exit 0
fi
