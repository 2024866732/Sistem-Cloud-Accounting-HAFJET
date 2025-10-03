# Smoke test for HAFJET Bukku stack
# Usage: Open PowerShell, cd to repo root and run: .\scripts\smoke-test.ps1

Write-Host "Bringing up services (rebuild)..."
docker compose up -d --build | Write-Host

Write-Host "Listing services:"
docker compose ps | Write-Host

Write-Host "Checking backend readiness (container):"
$ready = docker compose exec backend wget -qO- http://localhost:3000/api/ready
if ($LASTEXITCODE -eq 0) { Write-Host "Backend ready: $ready" } else { Write-Host "Backend readiness FAILED"; exit 2 }

Write-Host "Checking backend health (container):"
$health = docker compose exec backend wget -qO- http://localhost:3000/api/health
if ($LASTEXITCODE -eq 0) { Write-Host "Backend health: $health" } else { Write-Host "Backend health FAILED"; exit 3 }

Write-Host "Checking frontend on host: http://localhost:8080"
try {
  $resp = Invoke-WebRequest -Uri http://localhost:8080 -UseBasicParsing -Method Head -ErrorAction Stop
  Write-Host "Frontend returned status: $($resp.StatusCode)"
} catch {
  Write-Host "Frontend request failed: $_"
  exit 4
}

Write-Host "Smoke test completed successfully."