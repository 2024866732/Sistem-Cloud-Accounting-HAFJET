# Auto-Configure Railway Databases
# Automatically gets database URLs and sets all environment variables

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "AUTO-CONFIGURE RAILWAY DATABASES" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

# Check Railway CLI
if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Railway CLI not found!" -ForegroundColor Red
    exit 1
}

Write-Host "[STEP 1] Getting MongoDB connection string..." -ForegroundColor Yellow

# Try to get MongoDB URL from Railway
Write-Host "  Linking to MongoDB service..." -ForegroundColor Gray
$mongoOutput = railway service MongoDB 2>&1
if ($LASTEXITCODE -eq 0) {
    $mongoVars = railway variables 2>&1 | Out-String
    
    # Extract MONGO_URL from output
    if ($mongoVars -match "MONGO_URL\s+│\s+(.+?)(?:\s+║|\r?\n)") {
        $mongoUrl = $matches[1].Trim()
        Write-Host "  [OK] Found MONGO_URL" -ForegroundColor Green
        Write-Host "  Value: $($mongoUrl.Substring(0, [Math]::Min(50, $mongoUrl.Length)))..." -ForegroundColor Gray
    } else {
        Write-Host "  [WARNING] Could not extract MONGO_URL automatically" -ForegroundColor Yellow
        $mongoUrl = Read-Host "  Please paste MONGO_URL from Railway dashboard"
    }
} else {
    Write-Host "  [INFO] Please get MONGO_URL from Railway dashboard" -ForegroundColor Yellow
    $mongoUrl = Read-Host "  Paste MONGO_URL here"
}

Write-Host "`n[STEP 2] Getting Redis connection string..." -ForegroundColor Yellow

# Try to get Redis URL from Railway
Write-Host "  Linking to Redis service..." -ForegroundColor Gray
$redisOutput = railway service Redis 2>&1
if ($LASTEXITCODE -eq 0) {
    $redisVars = railway variables 2>&1 | Out-String
    
    # Extract REDIS_URL from output
    if ($redisVars -match "REDIS_URL\s+│\s+(.+?)(?:\s+║|\r?\n)") {
        $redisUrl = $matches[1].Trim()
        Write-Host "  [OK] Found REDIS_URL" -ForegroundColor Green
        Write-Host "  Value: $($redisUrl.Substring(0, [Math]::Min(50, $redisUrl.Length)))..." -ForegroundColor Gray
    } else {
        Write-Host "  [WARNING] Could not extract REDIS_URL automatically" -ForegroundColor Yellow
        $redisUrl = Read-Host "  Please paste REDIS_URL from Railway dashboard"
    }
} else {
    Write-Host "  [INFO] Please get REDIS_URL from Railway dashboard" -ForegroundColor Yellow
    $redisUrl = Read-Host "  Paste REDIS_URL here"
}

# Get JWT secret
Write-Host "`n[STEP 3] Loading JWT secret..." -ForegroundColor Yellow
if (Test-Path .jwt-secret-backup) {
    $jwtSecret = (Get-Content .jwt-secret-backup -Raw).Trim()
    Write-Host "  [OK] JWT secret loaded from backup" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] .jwt-secret-backup not found!" -ForegroundColor Red
    exit 1
}

# Link back to main service
Write-Host "`n[STEP 4] Linking to backend service..." -ForegroundColor Yellow
railway service "HAFJET CLOUD ACCOUNTING SYSTEM" 2>&1 | Out-Null

# Build complete variables list
Write-Host "`n[STEP 5] Setting all environment variables..." -ForegroundColor Yellow

$allVariables = @"
NODE_ENV=production
PORT=3000
SST_RATE=0.06
GST_RATE=0.06
CURRENCY=MYR
TIMEZONE=Asia/Kuala_Lumpur
LOCALE=ms-MY
DATE_FORMAT=DD/MM/YYYY
FISCAL_YEAR_START=01-01
JWT_SECRET=$jwtSecret
JWT_EXPIRE=7d
MONGO_URI=$mongoUrl
REDIS_URL=$redisUrl
"@

# Save to file for reference
$allVariables | Out-File -FilePath ".railway-vars.env" -Encoding UTF8
Write-Host "  [SAVED] Variables saved to .railway-vars.env" -ForegroundColor Cyan

# Display for manual copying
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "VARIABLES TO SET IN RAILWAY DASHBOARD" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nGo to: https://railway.app/project" -ForegroundColor White
Write-Host "Select: HAFJET CLOUD ACCOUNTING SYSTEM service" -ForegroundColor White
Write-Host "Tab: Variables" -ForegroundColor White
Write-Host "Action: Paste these variables (one per line):`n" -ForegroundColor White

$allVariables -split "`n" | ForEach-Object {
    $line = $_.Trim()
    if ($line -ne "") {
        $parts = $line -split "=", 2
        $key = $parts[0]
        $value = $parts[1]
        
        $displayValue = $value
        if ($value.Length -gt 60) {
            $displayValue = $value.Substring(0, 57) + "..."
        }
        
        Write-Host "  $key" -NoNewline -ForegroundColor Green
        Write-Host "=" -NoNewline
        Write-Host "$displayValue" -ForegroundColor White
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "1. Copy variables above to Railway Dashboard" -ForegroundColor White
Write-Host "   OR copy from file: .railway-vars.env`n" -ForegroundColor Gray

Write-Host "2. Verify variables are set:" -ForegroundColor White
Write-Host "   railway variables`n" -ForegroundColor Cyan

Write-Host "3. Deploy to Railway:" -ForegroundColor White
Write-Host "   railway up`n" -ForegroundColor Cyan

Write-Host "4. Monitor deployment:" -ForegroundColor White
Write-Host "   railway logs --tail 100`n" -ForegroundColor Cyan

Write-Host "5. Check health:" -ForegroundColor White
Write-Host "   .\scripts\check-deployment.ps1`n" -ForegroundColor Cyan

Write-Host "========================================`n" -ForegroundColor Cyan

# Open Railway dashboard
Write-Host "[OPENING] Railway dashboard in browser..." -ForegroundColor Yellow
Start-Process "https://railway.app/project"

Write-Host "`n[READY] All information prepared!" -ForegroundColor Green
Write-Host "[ACTION] Please set variables in Railway Dashboard`n" -ForegroundColor Yellow
