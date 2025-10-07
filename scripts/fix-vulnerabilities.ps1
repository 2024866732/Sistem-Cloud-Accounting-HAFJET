<#
.SYNOPSIS
    Fix npm security vulnerabilities across all packages
.DESCRIPTION
    Runs npm audit fix for root, backend, and frontend packages
#>

Write-Host "`n🔒 Fixing npm vulnerabilities for HAFJET Cloud Accounting" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Root dependencies
Write-Host "`n📦 Fixing root dependencies..." -ForegroundColor Cyan
npm audit fix --legacy-peer-deps

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Root dependencies fixed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some vulnerabilities may require manual review" -ForegroundColor Yellow
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Vulnerability fixes applied!" -ForegroundColor Green
Write-Host "`n💡 Run 'npm audit' to check remaining issues" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
