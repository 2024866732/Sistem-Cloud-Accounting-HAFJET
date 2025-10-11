#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WORKFLOW_DIR="$ROOT_DIR/.github/workflows"

if [ ! -d "$WORKFLOW_DIR" ]; then
  echo "Workflows directory not found: $WORKFLOW_DIR" >&2
  exit 1
fi

for f in "$WORKFLOW_DIR"/*.yml; do
  [ -e "$f" ] || continue
  echo "Processing $f"
  # Normalize to LF, remove repeated --- documents keeping first
  content=$(awk 'BEGIN{RS=""; ORS="\n"} {gsub("\r\n","\n"); print}' "$f")
  # Split on document separator and keep the first document
  first=$(printf "%s" "$content" | awk 'BEGIN{FS="\n---\n"} {print $1}')
  # Ensure leading ---
  if ! printf "%s" "$first" | sed -n '1p' | grep -q '^---'; then
    first="---\n${first#\n}"
  fi
  # Remove trailing spaces from each line
  cleaned=$(printf "%s" "$first" | sed -E 's/[[:space:]]+$//')
  # Ensure final newline
  printf "%s\n" "$cleaned" > "$f"
  # Warn about long lines
  nl -ba "$f" | awk 'length($0) > 220 { print "LONG LINE: " NR ":" length($0) }'
done

echo "Workflow files normalized. Review changes and commit if OK."
