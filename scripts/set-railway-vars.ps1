# Railway Variables Setup - Working Version
# Properly sets all environment variables using correct Railway CLI syntax

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  RAILWAY VARIABLES CONFIGURATION" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan

# Check Railway CLI
if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Railway CLI not installed" -ForegroundColor Red
    exit 1
}

# Get service name
Write-Host "[INFO] Getting Railway service info..." -ForegroundColor Yellow
$status = railway status 2>&1 | Out-String
$serviceName = ""

if ($status -match "Service:\s+(.+)") {
    $serviceName = $matches[1].Trim()
    Write-Host "[OK] Service: $serviceName" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Could not detect service name" -ForegroundColor Yellow
    $serviceName = "HAFJET CLOUD ACCOUNTING SYSTEM"
}

# Load or generate JWT
$jwtSecret = ""
if (Test-Path ".jwt-secret-backup") {
    $jwtSecret = (Get-Content ".jwt-secret-backup" -Raw).Trim()
    Write-Host "[OK] JWT loaded: $($jwtSecret.Length) characters" -ForegroundColor Green
} else {
    $chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    $jwtSecret = -join ((1..32) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
    $jwtSecret | Out-File -FilePath ".jwt-secret-backup" -Encoding UTF8 -NoNewline
    Write-Host "[OK] JWT generated: 32 characters" -ForegroundColor Green
}

# Define all variables
$variables = @{
    "NODE_ENV" = "production"
    "PORT" = "3000"
    "SST_RATE" = "0.06"
    "GST_RATE" = "0.06"
    "CURRENCY" = "MYR"
    "TIMEZONE" = "Asia/Kuala_Lumpur"
    "LOCALE" = "ms-MY"
    "DATE_FORMAT" = "DD/MM/YYYY"
    "FISCAL_YEAR_START" = "01-01"
    "JWT_SECRET" = $jwtSecret
    "JWT_EXPIRE" = "7d"
}

Write-Host "`n[UPLOAD] Setting $($variables.Count) variables..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$successCount = 0
$skipCount = 0

foreach ($key in $variables.Keys) {
    $value = $variables[$key]
    Write-Host "$key..." -NoNewline -ForegroundColor White
    
    # Use proper Railway CLI format
    $cmd = "railway"
    $args = @("variables", "--set", "${key}=${value}", "--skip-deploys")
    
    try {
        $output = & $cmd $args 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host " [OK]" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host " [SKIP]" -ForegroundColor Yellow
            $skipCount++
        }
    } catch {
        Write-Host " [ERROR]" -ForegroundColor Red
        $skipCount++
    }
    
    Start-Sleep -Milliseconds 200
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "SUCCESS: $successCount variables set" -ForegroundColor Green
if ($skipCount -gt 0) {
    Write-Host "SKIPPED: $skipCount variables" -ForegroundColor Yellow
}
Write-Host "========================================`n" -ForegroundColor Cyan

# Show current variables
Write-Host "[VERIFY] Current Railway Variables:" -ForegroundColor Cyan
railway variables

Write-Host "`n[IMPORTANT] Database Connection Strings" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "You need to manually set these from Railway dashboard:" -ForegroundColor White
Write-Host ""
Write-Host "1. Go to Railway Dashboard > MongoDB service > Variables tab" -ForegroundColor Gray
Write-Host "   Copy the MONGO_URL value" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Go to your main service > Variables tab" -ForegroundColor Gray
Write-Host "   Add variable: MONGO_URI = <paste MONGO_URL>" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Same for Redis:" -ForegroundColor Gray
Write-Host "   REDIS_URL should auto-link from Redis service" -ForegroundColor Gray
Write-Host ""
Write-Host "Or run this command after copying URLs:" -ForegroundColor White
Write-Host "  railway variables --set ""MONGO_URI=mongodb://..."" " -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Yellow

Write-Host "[NEXT] Deploy to Railway:" -ForegroundColor Green
Write-Host "  railway up" -ForegroundColor White
Write-Host "  OR" -ForegroundColor White
Write-Host "  gh workflow run deploy-railway.yml`n" -ForegroundColor White
