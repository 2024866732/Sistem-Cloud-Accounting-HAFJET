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

