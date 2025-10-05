# Restore Runbook

This runbook describes how to restore the MongoDB data for HAFJET Bukku from backups (S3 or local), how to verify a restore, and how to rotate secrets used by the backup process. It is written to be safe and actionable for an on-call engineer.

WARNING: Restoring will overwrite data in the target database. Always take a fresh backup before attempting a restore.

## Important secrets and environment variables
- `KUBE_CONFIG` (repo secret): base64-encoded kubeconfig used by deploy workflows.
- `BACKUP_S3_BUCKET` / `s3_bucket`: S3 bucket name used by backups (stored in k8s secret `hafjet-backup-secrets`).
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: credentials used by the backup uploader (k8s secret `hafjet-backup-secrets`).
- `BACKUP_PASSPHRASE` (optional): passphrase used to encrypt backups (k8s secret or CI secret).

## Quick checklist (safe path)
1. Ensure you have the right permissions to access S3 and cluster; get an approver if needed.
2. Take a fresh backup immediately and store it as a snapshot before restoring:

   - Kubernetes CronJob: run an on-demand backup pod or use the helper script (local):

     ```bash
     ./deploy/scripts/mongo-backup-local.sh ./backups
     ```

   - Or trigger the k8s CronJob manually by creating a Job from the CronJob template.

3. Identify the backup file to restore (S3 key or local path). If backups are encrypted, obtain the `BACKUP_PASSPHRASE`.

4. If restoring to a Kubernetes `mongo` service:

   - Apply the restore job manifest (it will fetch and restore the latest backup from S3):

     ```bash
     kubectl apply -f deploy/k8s/restore-job.yaml
     kubectl wait --for=condition=complete job/hafjet-mongo-restore --timeout=600s
     kubectl logs job/hafjet-mongo-restore
     ```

   - The restore job expects a `hafjet-backup-secrets` k8s secret with keys: `aws_access_key_id`, `aws_secret_access_key`, `s3_bucket`, `aws_region`, and optional `backup_passphrase`.

5. If restoring locally (to a local MongoDB instance):

   - Download the backup from S3 using `deploy/scripts/restore-from-s3.sh`:

     ```bash
     ./deploy/scripts/restore-from-s3.sh <s3-bucket> ./backups/latest.tar.gz
     # If encrypted, set BACKUP_PASSPHRASE env var before running
     BACKUP_PASSPHRASE=... ./deploy/scripts/restore-from-s3.sh <s3-bucket> ./backups/latest.tar.gz
     ```

   - Then restore with mongorestore:

     ```bash
     mongorestore --drop --gzip --archive=./backups/latest.tar.gz
     ```

## Verification steps
- After restore completes, run quick smoke checks against the application API (or directly query Mongo):

  - Check that the critical collections exist (example):

    ```bash
    mongosh --eval "db.getCollectionNames()" mongodb://localhost:27017/hafjet-bukku
    ```

  - Verify sample record counts against expectations, or use an application-level health endpoint if available.

  - Check notifications and other business flows in a staging environment before restoring production traffic.

## Rollback plan
- If the restore causes data issues, you can restore from the pre-restore snapshot created in step 2.
- If any application-level migration is required for new backups, coordinate with the development team and apply migrations in a maintenance window.

## Secret rotation guidance
- To rotate `hafjet-backup-secrets`:

  1. Create new IAM credentials with the minimum permissions for the backup uploader:
     - `s3:PutObject`, `s3:GetObject`, `s3:ListBucket` on the backup bucket; optionally `s3:DeleteObject` if lifecycle/cleanup is needed.
  2. Update the `hafjet-backup-secrets` Kubernetes secret with the new keys:

     ```bash
     kubectl create secret generic hafjet-backup-secrets \
       --from-literal=aws_access_key_id=NEW_ID \
       --from-literal=aws_secret_access_key=NEW_SECRET \
       --from-literal=s3_bucket=YOUR_BUCKET \
       --from-literal=aws_region=YOUR_REGION \
       --dry-run=client -o yaml | kubectl apply -f -
     ```

  3. Test an on-demand backup job and verify new objects appear in S3.
  4. Revoke the old IAM credentials after confirming new backups are successful.

## CI / Automation notes
- Add a scheduled verification job (weekly) that performs backup -> drop -> restore -> verify in an ephemeral environment. This ensures backups are usable.
- If using encrypted backups, ensure CI has access to the passphrase (store in GitHub Secrets or a KMS-managed secret).

Metrics endpoint protection
---------------------------
The backend exposes `/api/metrics`. In production prefer to protect access using network policies and Prometheus scrape configuration. As an alternative the server supports `METRICS_BEARER_TOKEN` or `METRICS_BASIC_AUTH` for simple token-based protection. Set `METRICS_BEARER_TOKEN` in your environment and configure Prometheus to use the token when scraping.

## Contact / escalation
- On-call / Primary: ops@example.com
- Dev owner: devteam@example.com

---
Last updated: 2025-10-05
