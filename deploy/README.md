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
