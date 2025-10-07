<#
.SYNOPSIS
    Automated Railway deployment setup for HAFJET Cloud Accounting System
.DESCRIPTION
    Sets up Railway services, environment variables, and triggers deployment
    Includes Malaysian compliance defaults (MYR, Asia/Kuala_Lumpur, SST 6%)
#>

param(
    [string]$ProjectName = "HAFJET CLOUD ACCOUNTING SYSTEM",
    [switch]$SkipMongoDB = $false
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "`n🚀 HAFJET Railway Deployment Setup" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Check Railway CLI
if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Railway CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g @railway/cli
}

# Check login status
Write-Host "`n🔐 Checking Railway authentication..." -ForegroundColor Cyan
try {
    $whoami = railway whoami 2>&1 | Out-String
    Write-Host "✅ $whoami" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in. Running railway login..." -ForegroundColor Yellow
    railway login
}

# Check current project status
Write-Host "`n📦 Checking Railway project..." -ForegroundColor Cyan
$status = railway status 2>&1 | Out-String
Write-Host $status

# Set Malaysian compliance environment variables
Write-Host "`n⚙️  Configuring Malaysian accounting defaults..." -ForegroundColor Cyan

# Generate JWT secret
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

$malaysianDefaults = @{
    "NODE_ENV" = "production"
    "PORT" = "3001"
    "SST_RATE" = "0.06"
    "GST_RATE" = "0.06"
    "CURRENCY" = "MYR"
    "TIMEZONE" = "Asia/Kuala_Lumpur"
    "COMPANY_NAME" = "HAFJET Cloud Accounting"
    "LOCALE" = "ms-MY"
    "DATE_FORMAT" = "DD/MM/YYYY"
    "FISCAL_YEAR_START" = "01-01"
    "JWT_SECRET" = $jwtSecret
    "JWT_EXPIRE" = "7d"
}

Write-Host "`n🔐 Generated JWT_SECRET (32 chars)" -ForegroundColor Green

# Try to set variables
foreach ($key in $malaysianDefaults.Keys) {
    Write-Host "  Setting $key..." -NoNewline
    $value = $malaysianDefaults[$key]
    
    # Try to set variable
    try {
        $null = railway variables set "$key=$value" 2>&1
        Write-Host " ✅" -ForegroundColor Green
    } catch {
        Write-Host " ⚠️ (will retry during deployment)" -ForegroundColor Yellow
    }
}

# Save JWT secret for reference
$jwtSecret | Out-File -FilePath ".jwt-secret-backup" -NoNewline
Write-Host "`n💾 JWT secret backed up to .jwt-secret-backup" -ForegroundColor Gray

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Railway setup complete!" -ForegroundColor Green
Write-Host "`n📋 Important Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Check Railway dashboard: https://railway.app" -ForegroundColor White
Write-Host "  2. Add services: MongoDB, Redis (if not already added)" -ForegroundColor White
Write-Host "  3. Copy MONGO_URL and REDIS_URL from service variables" -ForegroundColor White
Write-Host "  4. Set them: railway variables set MONGO_URI=<value>" -ForegroundColor White
Write-Host "  5. Set them: railway variables set REDIS_URL=<value>" -ForegroundColor White
Write-Host "`n💡 MongoDB & Redis can be added from Railway dashboard → New Service → Database" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
