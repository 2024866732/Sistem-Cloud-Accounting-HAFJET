#!/bin/sh
# Simple local mongo backup helper
set -euo pipefail
TIMESTAMP=$(date +"%F_%H%M%S")
OUTDIR=${1:-./backups}
mkdir -p "$OUTDIR"
FILE="$OUTDIR/backup-$TIMESTAMP.gz"
echo "Running mongodump to $FILE"
mongodump --uri="${MONGO_URI:-mongodb://localhost:27017/hafjet-bukku}" --archive="$FILE" --gzip
echo "Backup complete: $FILE"
