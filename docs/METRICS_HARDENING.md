# Metrics Hardening Guide

Goal: restrict access to `/api/metrics` so only authorized Prometheus scrapers can read it.

Approach
- Use a ServiceMonitor (Prometheus operator) to configure scraping with a bearer token stored in a Kubernetes Secret.
- Apply NetworkPolicy rules to only allow traffic from the Prometheus namespace (or specific Prometheus pods).
- Optionally, allow only cluster-internal access to the metrics endpoint (no external exposure).

Example steps
1. Create the bearer token secret (example):

```bash
kubectl create secret generic hafjet-metrics-secret --from-literal=bearer="$(openssl rand -hex 16)"
```

2. Apply the ServiceMonitor example in `deploy/k8s/metrics/service-monitor.yaml` (requires Prometheus operator).

3. Apply the NetworkPolicy in `deploy/k8s/metrics/networkpolicy-metrics.yaml` to limit ingress to pods with label `app: hafjet-backend`.

4. Configure Prometheus to select ServiceMonitors in the namespace where ServiceMonitor is deployed (typical operator config).

Notes
- If you cannot run Prometheus operator, configure Prometheus scrape config with `bearer_token_file` and mount the token from a secret.
- This guide is conservative: test policies in staging before applying to production to avoid accidentally blocking health checks.
