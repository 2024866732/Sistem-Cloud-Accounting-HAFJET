param(
  [string]$MongoPort = '27018'
)

Write-Host "Starting Docker Compose seed flow (mongo on port $MongoPort)"

docker compose -f ..\docker-compose.seed.yml up --build --abort-on-container-exit --exit-code-from backend-seed-runner

Write-Host 'Seed run complete. Tip: if you want the DB to persist locally, map a volume to the host.'
