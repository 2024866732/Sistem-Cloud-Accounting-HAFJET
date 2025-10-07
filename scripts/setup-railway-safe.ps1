# Railway Setup Script - PowerShell 5.1 Compatible
# Sets up Railway project with Malaysian accounting defaults

param(
    [switch]$SkipJWT
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Railway Setup - Malaysian Compliance" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check Railway CLI
Write-Host "[CHECK] Checking Railway CLI..." -ForegroundColor Yellow
if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Railway CLI not found!" -ForegroundColor Red
    Write-Host "Install: npm install -g @railway/cli" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Railway CLI found" -ForegroundColor Green

# Check authentication
Write-Host "`n[CHECK] Verifying Railway authentication..." -ForegroundColor Yellow
$authStatus = railway whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Not logged in to Railway!" -ForegroundColor Red
    Write-Host "Run: railway login" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Logged in: $authStatus" -ForegroundColor Green

# Check project status
Write-Host "`n[CHECK] Checking Railway project..." -ForegroundColor Yellow
$projectStatus = railway status 2>&1
Write-Host $projectStatus
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] No Railway project linked!" -ForegroundColor Red
    Write-Host "Run: railway link" -ForegroundColor Yellow
    exit 1
}

# Generate JWT secret
$jwtSecret = ""
if (-not $SkipJWT) {
    Write-Host "`n[JWT] Generating JWT secret..." -ForegroundColor Yellow
    $chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    $jwtSecret = -join ((1..32) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
    Write-Host "[OK] Generated JWT_SECRET (32 chars)" -ForegroundColor Green
    
    # Backup JWT secret
    $jwtSecret | Out-File -FilePath ".jwt-secret-backup" -Encoding UTF8 -NoNewline
    Write-Host "[BACKUP] Saved to .jwt-secret-backup" -ForegroundColor Cyan
} else {
    Write-Host "`n[SKIP] JWT generation skipped" -ForegroundColor Yellow
}

# Malaysian compliance defaults
$malaysianDefaults = @{
    "NODE_ENV" = "production"
    "PORT" = "3000"
    "SST_RATE" = "0.06"
    "GST_RATE" = "0.06"
    "CURRENCY" = "MYR"
    "TIMEZONE" = "Asia/Kuala_Lumpur"
    "LOCALE" = "ms-MY"
    "DATE_FORMAT" = "DD/MM/YYYY"
    "FISCAL_YEAR_START" = "01-01"
    "JWT_EXPIRE" = "7d"
}

if ($jwtSecret -ne "") {
    $malaysianDefaults["JWT_SECRET"] = $jwtSecret
}

# Set variables in Railway
Write-Host "`n[CONFIG] Setting environment variables..." -ForegroundColor Yellow
foreach ($key in $malaysianDefaults.Keys) {
    Write-Host "  $key..." -NoNewline
    $value = $malaysianDefaults[$key]
    
    # Try to set variable
    try {
        $result = railway variables set "${key}=$value" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host " [OK]" -ForegroundColor Green
        } else {
            Write-Host " [SKIPPED]" -ForegroundColor Yellow
        }
    } catch {
        Write-Host " [ERROR]" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nMalaysian Compliance Configured:" -ForegroundColor White
Write-Host "  - SST Rate: 6%" -ForegroundColor White
Write-Host "  - Currency: MYR" -ForegroundColor White
Write-Host "  - Timezone: Asia/Kuala_Lumpur" -ForegroundColor White
Write-Host "  - Locale: ms-MY" -ForegroundColor White
if ($jwtSecret -ne "") {
    Write-Host "  - JWT Secret: Generated and backed up" -ForegroundColor White
}

# Next steps
Write-Host "`n[NEXT STEPS]" -ForegroundColor Cyan
Write-Host "1. Add MongoDB in Railway dashboard:" -ForegroundColor White
Write-Host "   - Go to: https://railway.app/project" -ForegroundColor Gray
Write-Host "   - New -> Database -> MongoDB" -ForegroundColor Gray
Write-Host "   - Copy MONGO_URL variable" -ForegroundColor Gray
Write-Host "`n2. Add Redis in Railway dashboard:" -ForegroundColor White
Write-Host "   - New -> Database -> Redis" -ForegroundColor Gray
Write-Host "   - Copy REDIS_URL variable" -ForegroundColor Gray
Write-Host "`n3. Set database URLs:" -ForegroundColor White
Write-Host "   railway variables set MONGO_URI=<MONGO_URL>" -ForegroundColor Gray
Write-Host "   railway variables set REDIS_URL=<REDIS_URL>" -ForegroundColor Gray
Write-Host "`n4. Deploy to Railway:" -ForegroundColor White
Write-Host "   .\scripts\deploy-now.ps1 -SkipSetup" -ForegroundColor Gray
Write-Host "`n========================================`n" -ForegroundColor Cyan
