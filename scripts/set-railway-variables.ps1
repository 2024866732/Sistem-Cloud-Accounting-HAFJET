# Set Railway Variables - Malaysian Compliance
# This script sets all Malaysian accounting compliance variables in Railway

param(
    [Parameter(Mandatory=$false)]
    [string]$MongoUri = "",
    
    [Parameter(Mandatory=$false)]
    [string]$RedisUrl = ""
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Set Railway Variables - Malaysian Compliance" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check Railway CLI
if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Railway CLI not found!" -ForegroundColor Red
    exit 1
}

# Read JWT secret from backup
$jwtSecret = ""
if (Test-Path .jwt-secret-backup) {
    $jwtSecret = Get-Content .jwt-secret-backup -Raw
    Write-Host "[OK] JWT secret loaded from backup" -ForegroundColor Green
} else {
    Write-Host "[ERROR] .jwt-secret-backup not found! Run setup-railway-safe.ps1 first" -ForegroundColor Red
    exit 1
}

# Prompt for MongoDB URI if not provided
if ($MongoUri -eq "") {
    Write-Host "`n[INPUT] Please enter MongoDB URI from Railway:" -ForegroundColor Yellow
    Write-Host "  (Leave empty to skip)" -ForegroundColor Gray
    $MongoUri = Read-Host "MONGO_URI"
}

# Prompt for Redis URL if not provided
if ($RedisUrl -eq "") {
    Write-Host "`n[INPUT] Please enter Redis URL from Railway:" -ForegroundColor Yellow
    Write-Host "  (Leave empty to skip)" -ForegroundColor Gray
    $RedisUrl = Read-Host "REDIS_URL"
}

# Build variables object
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
    "JWT_SECRET" = $jwtSecret.Trim()
    "JWT_EXPIRE" = "7d"
}

if ($MongoUri -ne "") {
    $variables["MONGO_URI"] = $MongoUri
}

if ($RedisUrl -ne "") {
    $variables["REDIS_URL"] = $RedisUrl
}

# Create .env file content for Railway
Write-Host "`n[CREATE] Creating Railway variables file..." -ForegroundColor Yellow
$envContent = ""
foreach ($key in $variables.Keys) {
    $value = $variables[$key]
    $envContent += "$key=$value`n"
}

# Save to temporary file
$tempFile = ".railway-env-temp"
$envContent | Out-File -FilePath $tempFile -Encoding UTF8 -NoNewline

Write-Host "[OK] Variables file created: $tempFile" -ForegroundColor Green

# Display variables to copy
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "COPY THESE VARIABLES TO RAILWAY DASHBOARD" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nGo to Railway Dashboard > Service > Variables Tab" -ForegroundColor White
Write-Host "Then paste these one by one:`n" -ForegroundColor White

foreach ($key in $variables.Keys) {
    $value = $variables[$key]
    $displayValue = $value
    
    # Truncate long values for display
    if ($value.Length -gt 50) {
        $displayValue = $value.Substring(0, 47) + "..."
    }
    
    Write-Host "  $key" -NoNewline -ForegroundColor Green
    Write-Host "=" -NoNewline
    Write-Host "$displayValue" -ForegroundColor White
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "AUTOMATED VARIABLE SETTING" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Attempting to set variables using Railway CLI..." -ForegroundColor Yellow
Write-Host "(Note: This may not work for all Railway CLI versions)`n" -ForegroundColor Gray

$successCount = 0
$failCount = 0

foreach ($key in $variables.Keys) {
    $value = $variables[$key]
    Write-Host "Setting $key..." -NoNewline
    
    try {
        # Try multiple Railway CLI command formats
        $result = railway variables --set "${key}=${value}" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host " [OK]" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host " [FAILED]" -ForegroundColor Red
            $failCount++
        }
    } catch {
        Write-Host " [ERROR]" -ForegroundColor Red
        $failCount++
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Summary: $successCount succeeded, $failCount failed" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

if ($failCount -gt 0) {
    Write-Host "[WARNING] Some variables could not be set via CLI." -ForegroundColor Yellow
    Write-Host "Please set them manually in Railway Dashboard." -ForegroundColor Yellow
    Write-Host "`nVariables are saved in: $tempFile" -ForegroundColor Cyan
    Write-Host "You can copy them from there to Railway Dashboard`n" -ForegroundColor Cyan
}

Write-Host "[NEXT] After setting variables:" -ForegroundColor Cyan
Write-Host "  1. Verify with: railway variables" -ForegroundColor White
Write-Host "  2. Deploy with: railway up" -ForegroundColor White
Write-Host "  3. Or trigger GitHub Actions: gh workflow run deploy-railway.yml`n" -ForegroundColor White
