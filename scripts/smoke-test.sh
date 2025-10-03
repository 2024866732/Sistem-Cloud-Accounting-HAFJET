#!/usr/bin/env bash
# Cross-shell smoke test for CI / Linux / macOS
set -euo pipefail

echo "Bringing up services (rebuild)..."
docker compose up -d --build

echo "Listing services:"
docker compose ps

echo "Checking backend readiness (container)..."
docker compose exec backend wget -qO- http://localhost:3000/api/ready || { echo 'Backend readiness FAILED'; exit 2; }

echo "Checking backend health (container)..."
docker compose exec backend wget -qO- http://localhost:3000/api/health || { echo 'Backend health FAILED'; exit 3; }

echo "Checking frontend on host: http://localhost:8080"
status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 || true)
if [ "$status" = "200" ]; then
  echo "Frontend returned status: $status"
else
  echo "Frontend request failed or returned $status"; exit 4
fi

echo "Smoke test completed successfully."