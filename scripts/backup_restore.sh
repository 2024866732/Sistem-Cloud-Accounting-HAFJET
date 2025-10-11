#!/usr/bin/env bash
# backup_restore.sh
set -euo pipefail

usage() {
  cat <<EOF
Usage: $0 backup <out-dir>
       $0 restore <in-dir>

backup: create a dump of MongoDB (requires MONGO_URI)
restore: restore a dump created by backup
EOF
}

if [ "$#" -lt 2 ]; then
  usage
  exit 1
fi

COMMAND=$1
DIR=$2

if [ "$COMMAND" = "backup" ]; then
  mkdir -p "$DIR"
  echo "Dumping MongoDB to $DIR/mongo-dump"
  mongodump --uri="$MONGO_URI" --archive="$DIR/mongo-dump.gz" --gzip
  echo "Backup complete"
  exit 0
elif [ "$COMMAND" = "restore" ]; then
  if [ ! -f "$DIR/mongo-dump.gz" ]; then
    echo "Restore archive not found: $DIR/mongo-dump.gz"
    exit 1
  fi
  echo "Restoring MongoDB from $DIR/mongo-dump.gz"
  mongorestore --uri="$MONGO_URI" --archive="$DIR/mongo-dump.gz" --gzip --drop
  echo "Restore complete"
  exit 0
else
  usage
  exit 1
fi
