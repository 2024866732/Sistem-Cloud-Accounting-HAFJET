Grafana Kubernetes deployment
-----------------------------

This directory contains simple manifests to deploy Grafana and provision datasources/dashboards via ConfigMaps. Steps:

1. Edit `configmap-dashboards.yaml` and replace the placeholder `hafjet-overview.json` with the full dashboard JSON from `deploy/monitoring/grafana/dashboards/hafjet-overview.json`.
2. Apply manifests:

```bash
kubectl apply -f deploy/k8s/grafana/configmap-provisioning.yaml
kubectl apply -f deploy/k8s/grafana/configmap-dashboards.yaml
kubectl apply -f deploy/k8s/grafana/deployment.yaml
kubectl apply -f deploy/k8s/grafana/service.yaml
```

Notes:
- This is a minimal example suitable for staging. In production prefer to store dashboards in a repository and use Helm or a sidecar to manage updates.
