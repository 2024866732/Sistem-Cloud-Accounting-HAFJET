#!/bin/sh
set -euo pipefail
BUCKET=${1:-$S3_BUCKET}
REGION=${2:-${AWS_REGION:-ap-southeast-1}}
TMPDIR=${3:-./tmp_restore}
mkdir -p "$TMPDIR"
FILE=$(aws --region "$REGION" s3 ls s3://$BUCKET/ --recursive | sort | tail -n1 | awk '{print $4}')
echo "Downloading $FILE"
aws --region "$REGION" s3 cp "s3://$BUCKET/$FILE" "$TMPDIR/$FILE"
if [ -n "${BACKUP_PASSPHRASE:-}" ]; then
  openssl enc -d -aes-256-cbc -pbkdf2 -in "$TMPDIR/$FILE" -out "$TMPDIR/restored.gz" -pass pass:"$BACKUP_PASSPHRASE"
  FILE_TO_RESTORE="$TMPDIR/restored.gz"
else
  FILE_TO_RESTORE="$TMPDIR/$FILE"
fi
mongorestore --uri="${MONGO_URI:-mongodb://localhost:27017/hafjet-bukku}" --archive="$FILE_TO_RESTORE" --gzip --drop
echo "Restore complete"
