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
  echo "Preparing backup to $DIR/mongo-dump.gz"

  if command -v mongodump >/dev/null 2>&1; then
    echo "Using local mongodump"
    mongodump --uri="$MONGO_URI" --archive="$DIR/mongo-dump.gz" --gzip
    echo "Backup complete (local mongodump)"
    exit 0
  fi

  if command -v docker >/dev/null 2>&1; then
    echo "mongodump not found. Falling back to Docker image (mongo)
Using docker to perform mongodump..."
    docker run --rm \
      -v "$DIR":/dump \
      --network host \
      mongo:6.0 \
      bash -lc "mongodump --uri='$MONGO_URI' --archive=/dump/mongo-dump.gz --gzip"
    echo "Backup complete (docker)"
    exit 0
  fi

  echo "Error: neither mongodump nor docker available. Install MongoDB Database Tools or Docker."
  exit 1
elif [ "$COMMAND" = "restore" ]; then
  if [ ! -f "$DIR/mongo-dump.gz" ]; then
    echo "Restore archive not found: $DIR/mongo-dump.gz"
    exit 1
  fi

  if command -v mongorestore >/dev/null 2>&1; then
    echo "Using local mongorestore"
    mongorestore --uri="$MONGO_URI" --archive="$DIR/mongo-dump.gz" --gzip --drop
    echo "Restore complete (local mongorestore)"
    exit 0
  fi

  if command -v docker >/dev/null 2>&1; then
    echo "mongorestore not found. Falling back to Docker image (mongo)
Using docker to perform mongorestore..."
    docker run --rm \
      -v "$DIR":/dump \
      --network host \
      mongo:6.0 \
      bash -lc "mongorestore --uri='$MONGO_URI' --archive=/dump/mongo-dump.gz --gzip --drop"
    echo "Restore complete (docker)"
    exit 0
  fi

  echo "Error: neither mongorestore nor docker available. Install MongoDB Database Tools or Docker."
  exit 1
else
  usage
  exit 1
fi
