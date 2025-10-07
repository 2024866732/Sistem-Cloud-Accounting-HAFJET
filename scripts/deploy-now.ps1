<#
.SYNOPSIS
    One-command deployment to Railway for HAFJET Cloud Accounting System
.DESCRIPTION
    Automated deployment pipeline: setup → build → deploy → verify
.PARAMETER SkipSetup
    Skip Railway setup (if already configured)
.PARAMETER SkipBuild
    Skip local build test
.EXAMPLE
    .\scripts\deploy-now.ps1
    .\scripts\deploy-now.ps1 -SkipSetup
#>

param(
    [switch]$SkipSetup = $false,
    [switch]$SkipBuild = $false
)

Write-Host "`n🚀 HAFJET One-Command Deployment to Railway" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Step 1: Railway setup
if (-not $SkipSetup) {
    Write-Host "`n1️⃣  Setting up Railway services..." -ForegroundColor Cyan
    & "$PSScriptRoot/setup-railway.ps1"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Railway setup failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "`n⏸️  IMPORTANT: Configure databases in Railway dashboard" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
    Write-Host "   1. Go to https://railway.app" -ForegroundColor Gray
    Write-Host "   2. Add MongoDB service: Click '+ New' → Database → MongoDB" -ForegroundColor Gray
    Write-Host "   3. Add Redis service: Click '+ New' → Database → Redis" -ForegroundColor Gray
    Write-Host "   4. Copy MONGO_URL from MongoDB service variables" -ForegroundColor Gray
    Write-Host "   5. Copy REDIS_URL from Redis service variables" -ForegroundColor Gray
    Write-Host "   6. Set them in your backend service:" -ForegroundColor Gray
    Write-Host "      railway variables set MONGO_URI=<MONGO_URL>" -ForegroundColor White
    Write-Host "      railway variables set REDIS_URL=<REDIS_URL>" -ForegroundColor White
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
    Write-Host "`n   Press ANY KEY after URLs are configured..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Step 2: Local build test
if (-not $SkipBuild) {
    Write-Host "`n2️⃣  Testing local build..." -ForegroundColor Cyan
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed! Fix errors before deploying." -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Build successful" -ForegroundColor Green
}

# Step 3: Trigger GitHub Actions deployment
Write-Host "`n3️⃣  Triggering GitHub Actions deployment workflow..." -ForegroundColor Cyan
gh workflow run deploy-railway.yml --ref main

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to trigger workflow" -ForegroundColor Red
    Write-Host "   Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   • Check: gh auth status" -ForegroundColor Gray
    Write-Host "   • Login: gh auth login" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ Deployment workflow triggered!" -ForegroundColor Green

# Wait for workflow to start
Write-Host "`n⏳ Waiting for workflow to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Step 4: Watch deployment
Write-Host "`n4️⃣  Monitoring deployment progress..." -ForegroundColor Cyan
Write-Host "   (Press Ctrl+C to exit monitoring, deployment will continue in background)" -ForegroundColor Gray
Write-Host ""

try {
    gh run watch
} catch {
    Write-Host "`n⚠️  Monitoring interrupted, but deployment is still running" -ForegroundColor Yellow
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Deployment pipeline initiated!" -ForegroundColor Green
Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "  1️⃣  Check deployment status: gh run list" -ForegroundColor White
Write-Host "  2️⃣  View logs: gh run view --log" -ForegroundColor White
Write-Host "  3️⃣  Get service URLs from Railway dashboard: https://railway.app" -ForegroundColor White
Write-Host "  4️⃣  Run health check:" -ForegroundColor White
Write-Host '     .\scripts\check-deployment.ps1 -BackendURL "https://..." -FrontendURL "https://..."' -ForegroundColor Gray
Write-Host "  5️⃣  Test Malaysian features (SST 6%, MYR currency, Asia/KL timezone)" -ForegroundColor White
Write-Host "`n🌐 Railway Dashboard: https://railway.app" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
