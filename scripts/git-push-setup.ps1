<#
Simple helper to add a remote and push the current main branch.
Usage: Open PowerShell in repo root and run: .\scripts\git-push-setup.ps1
#>

Param(
  [string]$RemoteUrl
)

if (-not $RemoteUrl) {
  $RemoteUrl = Read-Host "Enter remote URL (e.g. git@github.com:youruser/yourrepo.git)"
}

if (-not $RemoteUrl) {
  Write-Error "Remote URL is required."
  exit 1
}

# Add remote and push
try {
  git remote add origin $RemoteUrl
} catch {
  Write-Host "Remote 'origin' already exists, updating URL..."
  git remote set-url origin $RemoteUrl
}

Write-Host "Pushing to origin main..."

git push -u origin main
if ($LASTEXITCODE -ne 0) {
  Write-Error "Push failed. Check your credentials and remote URL."
  exit $LASTEXITCODE
}

Write-Host "Push succeeded."
