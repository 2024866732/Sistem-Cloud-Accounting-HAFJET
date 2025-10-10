#!/usr/bin/env bash
# Remove AWS-related GitHub repository secrets using gh CLI
# Usage: bash scripts/remove-aws-secrets.sh

set -euo pipefail

REPO="${GITHUB_REPOSITORY:-2024866732/Sistem-Cloud-Accounting-HAFJET}"
SECRETS=(AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_REGION S3_BUCKET)

if ! command -v gh &>/dev/null; then
  echo "gh CLI not found. Install from https://cli.github.com/"
  exit 1
fi

echo "Repository: $REPO"
for s in "${SECRETS[@]}"; do
  echo "Deleting secret: $s"
  gh secret remove "$s" --repo "$REPO" || echo "Secret $s not found or failed to delete"
done

echo "Done."
