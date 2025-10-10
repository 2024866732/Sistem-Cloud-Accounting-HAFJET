# PowerShell script to remove AWS-related GitHub repo secrets using gh CLI
# Usage: .\scripts\remove-aws-secrets.ps1
param(
  [string]$Repo = "$env:GITHUB_REPOSITORY"
)

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Error "gh CLI not found. Install from https://cli.github.com/"
  exit 1
}

$secrets = @('AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY','AWS_REGION','S3_BUCKET')

foreach ($s in $secrets) {
  Write-Host "Removing secret: $s"
  gh secret remove $s --repo $Repo -s 2>$null -ErrorAction SilentlyContinue
}

Write-Host "Done."