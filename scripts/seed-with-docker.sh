#!/usr/bin/env bash
set -euo pipefail

echo "Starting Docker Compose seed flow"
docker compose -f ../docker-compose.seed.yml up --build --abort-on-container-exit --exit-code-from backend-seed-runner
echo "Seed run complete"
