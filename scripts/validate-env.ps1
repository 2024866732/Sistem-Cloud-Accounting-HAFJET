# ============================================
# HAFJET Cloud Accounting - Environment Validator (PowerShell)
# Validates all required environment variables before deployment
# ============================================

$ErrorActionPreference = "Continue"

$ERRORS = 0
$WARNINGS = 0

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "HAFJET Environment Validation" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Function to check required variable
function Test-RequiredVariable {
    param(
        [string]$VarName,
        [string]$VarValue,
        [int]$MinLength = 1
    )
    
    if ([string]::IsNullOrEmpty($VarValue)) {
        Write-Host "✗ ERROR: $VarName is not set" -ForegroundColor Red
        $script:ERRORS++
        return $false
    } elseif ($VarValue.Length -lt $MinLength) {
        Write-Host "✗ ERROR: $VarName is too short (min: $MinLength chars, current: $($VarValue.Length))" -ForegroundColor Red
        $script:ERRORS++
        return $false
    } else {
        Write-Host "✓ $VarName is set" -ForegroundColor Green
        return $true
    }
}

# Function to check optional variable
function Test-OptionalVariable {
    param(
        [string]$VarName,
        [string]$VarValue
    )
    
    if ([string]::IsNullOrEmpty($VarValue)) {
        Write-Host "⚠ WARNING: $VarName is not set (optional)" -ForegroundColor Yellow
        $script:WARNINGS++
    } else {
        Write-Host "✓ $VarName is set" -ForegroundColor Green
    }
}

# Function to validate URL
function Test-Url {
    param(
        [string]$VarName,
        [string]$VarValue,
        [bool]$IsRequired = $false
    )
    
    if ([string]::IsNullOrEmpty($VarValue)) {
        if ($IsRequired) {
            Write-Host "✗ ERROR: $VarName (URL) is not set" -ForegroundColor Red
            $script:ERRORS++
        } else {
            Write-Host "⚠ WARNING: $VarName (URL) is not set" -ForegroundColor Yellow
            $script:WARNINGS++
        }
        return
    }
    
    if ($VarValue -notmatch '^https?://') {
        Write-Host "✗ ERROR: $VarName is not a valid URL (must start with http:// or https://)" -ForegroundColor Red
        $script:ERRORS++
    } else {
        Write-Host "✓ $VarName is valid URL" -ForegroundColor Green
    }
}

# Load environment from .env.production or backend/.env.production
$EnvFile = $null
if (Test-Path ".env.production") {
    $EnvFile = ".env.production"
    Write-Host "Loading .env.production..." -ForegroundColor Yellow
} elseif (Test-Path "backend\.env.production") {
    $EnvFile = "backend\.env.production"
    Write-Host "Loading backend\.env.production..." -ForegroundColor Yellow
} elseif (Test-Path ".env") {
    $EnvFile = ".env"
    Write-Host "Loading .env..." -ForegroundColor Yellow
} else {
    Write-Host "No .env file found. Checking system environment..." -ForegroundColor Yellow
}

# Parse .env file and set variables
if ($EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Variable -Name $key -Value $value -Scope Script
        }
    }
}

Write-Host ""
Write-Host "=== Critical Backend Variables ===" -ForegroundColor Cyan
Test-RequiredVariable "NODE_ENV" $NODE_ENV
Test-RequiredVariable "PORT" $PORT
Test-RequiredVariable "JWT_SECRET" $JWT_SECRET 32
Test-RequiredVariable "MONGO_URI" $MONGO_URI 20
Test-Url "FRONTEND_URL" $FRONTEND_URL $true

Write-Host ""
Write-Host "=== Database Configuration ===" -ForegroundColor Cyan
if (![string]::IsNullOrEmpty($MONGO_URI)) {
    if ($MONGO_URI -match '^mongodb://') {
        Write-Host "✓ MongoDB URI format valid" -ForegroundColor Green
    } else {
        Write-Host "✗ ERROR: MONGO_URI must start with mongodb://" -ForegroundColor Red
        $ERRORS++
    }
}

Write-Host ""
Write-Host "=== Redis Configuration ===" -ForegroundColor Cyan
Test-OptionalVariable "REDIS_URL" $REDIS_URL

Write-Host ""
Write-Host "=== Security Configuration ===" -ForegroundColor Cyan
if (![string]::IsNullOrEmpty($JWT_SECRET)) {
    if ($JWT_SECRET.Length -ge 32) {
        Write-Host "✓ JWT_SECRET length is secure ($($JWT_SECRET.Length) chars)" -ForegroundColor Green
    } else {
        Write-Host "⚠ WARNING: JWT_SECRET should be at least 32 characters (current: $($JWT_SECRET.Length))" -ForegroundColor Yellow
        $WARNINGS++
    }
}

Write-Host ""
Write-Host "=== Malaysian Tax Configuration ===" -ForegroundColor Cyan
Test-OptionalVariable "SST_RATE" $SST_RATE
Test-OptionalVariable "GST_RATE" $GST_RATE

if (![string]::IsNullOrEmpty($SST_RATE)) {
    if ($SST_RATE -eq "0.06") {
        Write-Host "✓ SST_RATE is set to 6% (correct)" -ForegroundColor Green
    } else {
        Write-Host "⚠ WARNING: SST_RATE is $SST_RATE, expected 0.06 (6%)" -ForegroundColor Yellow
        $WARNINGS++
    }
}

Write-Host ""
Write-Host "=== Optional Services ===" -ForegroundColor Cyan
Test-OptionalVariable "LHDN_API_KEY" $LHDN_API_KEY
Test-OptionalVariable "EMAIL_HOST" $EMAIL_HOST
Test-OptionalVariable "SENTRY_DSN" $SENTRY_DSN

Write-Host ""
Write-Host "=== Frontend Configuration ===" -ForegroundColor Cyan
Test-Url "VITE_API_URL" $VITE_API_URL $true
Test-Url "VITE_APP_URL" $VITE_APP_URL $true

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Validation Summary" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Errors: $ERRORS" -ForegroundColor $(if ($ERRORS -gt 0) { "Red" } else { "Green" })
Write-Host "Warnings: $WARNINGS" -ForegroundColor $(if ($WARNINGS -gt 0) { "Yellow" } else { "Green" })
Write-Host ""

if ($ERRORS -gt 0) {
    Write-Host "✗ VALIDATION FAILED" -ForegroundColor Red
    Write-Host "Please fix all errors before deploying to production."
    exit 1
} elseif ($WARNINGS -gt 0) {
    Write-Host "⚠ VALIDATION PASSED WITH WARNINGS" -ForegroundColor Yellow
    Write-Host "Consider addressing warnings for optimal configuration."
    exit 0
} else {
    Write-Host "✓ VALIDATION PASSED" -ForegroundColor Green
    Write-Host "All checks passed! Ready for deployment."
    exit 0
}
