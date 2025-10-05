# Deployment (Docker Compose)

This folder contains a production-ready Docker Compose stack for quick deployments on a single host. It is intended as a reference and starting point — update secrets, volumes and networking to match your environment.

Run the stack:

```bash
cp .env.example .env
# Edit .env and set production secrets (SENTRY_DSN, GRAFANA_ADMIN_PASSWORD)
docker compose -f docker-compose.prod.yml up -d
```

Notes:
- `backend` and `frontend` images should be pushed to GHCR or your registry before starting.
- Prometheus and Grafana are included for quick monitoring; secure Grafana in production.
- Implement cron-style backups via host cron or a separate backup container that runs `mongodump` and stores artifacts externally.

Backup (Kubernetes CronJob)
---------------------------
A Kubernetes `CronJob` has been added at `deploy/k8s/backup-cronjob.yaml`. It runs daily at 02:00 and performs a `mongodump` into an ephemeral volume, then uploads backups to S3 using the AWS CLI. To configure:

- Create a K8s Secret `hafjet-backup-secrets` with keys: `aws_access_key_id`, `aws_secret_access_key`, `s3_bucket`, `aws_region`.
- Apply the CronJob with `kubectl apply -f deploy/k8s/backup-cronjob.yaml`.

Local backups
-------------
Use `deploy/scripts/mongo-backup-local.sh` for a one-off local backup. Example:

```bash
export MONGO_URI="mongodb://localhost:27017/hafjet-bukku"
./deploy/scripts/mongo-backup-local.sh ./backups
```

Restore from backup (Kubernetes)
--------------------------------
To perform a restore in Kubernetes, you can run the restore Job which will fetch the latest backup from S3 and restore it to the `mongo` service:

```bash
kubectl apply -f deploy/k8s/restore-job.yaml
kubectl wait --for=condition=complete job/hafjet-mongo-restore --timeout=600s
kubectl logs job/hafjet-mongo-restore
```

Persistent volume for backups
-----------------------------
The CronJob now writes backups to a `PersistentVolumeClaim` named `hafjet-backup-pvc` declared in `deploy/k8s/backup-pvc.yaml`. Ensure your cluster has a dynamic provisioner or create a PersistentVolume that satisfies the claim.

Local restore helper
--------------------
Use `deploy/scripts/restore-from-s3.sh` to download the latest backup from S3 and restore to a local MongoDB instance. Provide `S3_BUCKET` (or pass as arg1) and set `BACKUP_PASSPHRASE` if backups are encrypted.


