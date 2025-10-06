# verify-lockfile.ps1
# Run this from the repo root in PowerShell. Copies backend package files to a temp folder and runs npm ci.
param()
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$tmp = New-Item -ItemType Directory -Path (Join-Path $env:TEMP ([System.Guid]::NewGuid().ToString()))
Write-Host "Using temp dir: $($tmp.FullName)"
Copy-Item -Path (Join-Path $root 'backend\package.json') -Destination $tmp.FullName
Copy-Item -Path (Join-Path $root 'backend\package-lock.json') -Destination $tmp.FullName
Push-Location $tmp.FullName
# skip lifecycle scripts to avoid husky prepare errors
npm ci --ignore-scripts --legacy-peer-deps --no-audit --no-fund
Write-Host "npm ci succeeded in clean environment"
Pop-Location
Remove-Item -Recurse -Force $tmp
