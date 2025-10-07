# Railway Complete Auto-Setup
# Simple version without unicode issues

Write-Host "`nRAILWAY AUTO-CONFIGURATION STARTED" -ForegroundColor Green
Write-Host "===================================`n" -ForegroundColor Green

# Check Railway CLI
if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Railway CLI not installed" -ForegroundColor Red
    Write-Host "Install: npm install -g @railway/cli" -ForegroundColor Yellow
    exit 1
}

Write-Host "[1/5] Railway CLI: OK" -ForegroundColor Green

# Check auth
railway whoami 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Not logged in to Railway" -ForegroundColor Red
    Write-Host "Run: railway login" -ForegroundColor Yellow
    exit 1
}

Write-Host "[2/5] Authentication: OK" -ForegroundColor Green

# Load JWT secret
$jwtSecret = ""
if (Test-Path ".jwt-secret-backup") {
    $jwtSecret = (Get-Content ".jwt-secret-backup" -Raw).Trim()
    Write-Host "[3/5] JWT Secret: Loaded ($($jwtSecret.Length) chars)" -ForegroundColor Green
} else {
    $chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    $jwtSecret = -join ((1..32) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
    $jwtSecret | Out-File -FilePath ".jwt-secret-backup" -Encoding UTF8 -NoNewline
    Write-Host "[3/5] JWT Secret: Generated (32 chars)" -ForegroundColor Green
}

# Get current Railway variables
Write-Host "`n[4/5] Reading Railway services..." -ForegroundColor Yellow
$allVars = railway variables 2>&1 | Out-String

# Try to extract database URLs
$mongoUri = ""
$redisUrl = ""

# Parse Railway variables output
$lines = $allVars -split "`n"
foreach ($line in $lines) {
    if ($line -match "MONGO_URL") {
        # Extract URL after the pipe character
        $parts = $line -split "\|"
        if ($parts.Count -ge 2) {
            $mongoUri = $parts[1].Trim()
        }
    }
    if ($line -match "REDIS_URL" -and $line -notmatch "RAILWAY") {
        $parts = $line -split "\|"
        if ($parts.Count -ge 2) {
            $redisUrl = $parts[1].Trim()
        }
    }
}

if ($mongoUri) {
    Write-Host "  MongoDB: Detected" -ForegroundColor Green
} else {
    Write-Host "  MongoDB: Not found (will set placeholder)" -ForegroundColor Yellow
    $mongoUri = "mongodb://localhost:27017/hafjet-bukku"
}

if ($redisUrl) {
    Write-Host "  Redis: Detected" -ForegroundColor Green
} else {
    Write-Host "  Redis: Not found (will set placeholder)" -ForegroundColor Yellow
    $redisUrl = "redis://localhost:6379"
}

# Prepare all variables
Write-Host "`n[5/5] Setting environment variables..." -ForegroundColor Yellow

$variables = @(
    "NODE_ENV=production",
    "PORT=3000",
    "SST_RATE=0.06",
    "GST_RATE=0.06",
    "CURRENCY=MYR",
    "TIMEZONE=Asia/Kuala_Lumpur",
    "LOCALE=ms-MY",
    "DATE_FORMAT=DD/MM/YYYY",
    "FISCAL_YEAR_START=01-01",
    "JWT_SECRET=$jwtSecret",
    "JWT_EXPIRE=7d"
)

if ($mongoUri -and $mongoUri -ne "" -and $mongoUri -notmatch "localhost") {
    $variables += "MONGO_URI=$mongoUri"
}

if ($redisUrl -and $redisUrl -ne "" -and $redisUrl -notmatch "localhost") {
    $variables += "REDIS_URL=$redisUrl"
}

# Create env file for Railway
$envFile = ".env.railway"
$variables | Out-File -FilePath $envFile -Encoding UTF8

Write-Host "`nUploading $($variables.Count) variables to Railway..." -ForegroundColor Cyan

# Upload using Railway CLI
$uploadResult = railway variables --load $envFile 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: All variables uploaded!" -ForegroundColor Green
} else {
    Write-Host "WARNING: Upload may have failed. Trying alternative method..." -ForegroundColor Yellow
    
    # Alternative: Set individually
    $successCount = 0
    foreach ($var in $variables) {
        $parts = $var -split "=", 2
        $key = $parts[0]
        $value = $parts[1]
        
        Write-Host "  $key..." -NoNewline
        railway variables set "$key=$value" 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host " OK" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host " SKIP" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`nSet $successCount / $($variables.Count) variables" -ForegroundColor Cyan
}

# Clean up
if (Test-Path $envFile) {
    Remove-Item $envFile -Force
}

# Show current variables
Write-Host "`n====================================" -ForegroundColor Green
Write-Host "CURRENT RAILWAY VARIABLES" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
railway variables

Write-Host "`n====================================" -ForegroundColor Green
Write-Host "SETUP COMPLETE!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Verify variables above" -ForegroundColor White
Write-Host "2. Deploy: railway up" -ForegroundColor White
Write-Host "3. Monitor: railway logs --tail 100" -ForegroundColor White
Write-Host "4. Open app: railway open`n" -ForegroundColor White
