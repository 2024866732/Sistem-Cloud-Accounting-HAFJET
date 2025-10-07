#!/usr/bin/env pwsh
# Complete Railway Setup - Final 10%
# This script completes the database configuration to reach 100%

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   HAFJET BUKKU - Complete Railway Setup (Final 10%)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Function to run railway commands with retry
function Invoke-RailwayCommand {
    param(
        [string]$Command,
        [int]$MaxRetries = 3
    )
    
    $attempt = 0
    while ($attempt -lt $MaxRetries) {
        try {
            $result = Invoke-Expression "railway $Command 2>&1"
            if ($LASTEXITCODE -eq 0) {
                return $result
            }
            $attempt++
            if ($attempt -lt $MaxRetries) {
                Write-Host "⏳ Retry $attempt/$MaxRetries..." -ForegroundColor Yellow
                Start-Sleep -Seconds 5
            }
        }
        catch {
            $attempt++
            if ($attempt -lt $MaxRetries) {
                Start-Sleep -Seconds 5
            }
        }
    }
    throw "Command failed after $MaxRetries attempts"
}

# Step 1: Check current service
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "Step 1: Checking Railway Project Status" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue

try {
    $status = railway status 2>&1 | Out-String
    Write-Host $status
    Write-Host "✅ Connected to Railway" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to connect to Railway" -ForegroundColor Red
    exit 1
}

# Step 2: Link to main application service
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "Step 2: Linking to Main Application Service" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue

# Interactive service selection - will prompt user
Write-Host "Please select 'HAFJET CLOUD ACCOUNTING SYSTEM' when prompted..." -ForegroundColor Yellow
railway service

# Step 3: Check current variables
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "Step 3: Current Variables Check" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue

$variables = railway variables 2>&1 | Out-String
Write-Host $variables

# Check if MONGO_URI exists
if ($variables -match "MONGO_URI") {
    Write-Host "✅ MONGO_URI already configured" -ForegroundColor Green
    $mongoConfigured = $true
}
else {
    Write-Host "⚠️  MONGO_URI not found - needs configuration" -ForegroundColor Yellow
    $mongoConfigured = $false
}

# Check if REDIS_URL exists
if ($variables -match "REDIS_URL") {
    Write-Host "✅ REDIS_URL already configured" -ForegroundColor Green
    $redisConfigured = $true
}
else {
    Write-Host "⚠️  REDIS_URL not found - needs configuration" -ForegroundColor Yellow
    $redisConfigured = $false
}

# Step 4: Get MongoDB connection string
if (-not $mongoConfigured) {
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    Write-Host "Step 4: Configuring MongoDB Connection" -ForegroundColor Blue
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    
    Write-Host "Switching to Mongo service..." -ForegroundColor Cyan
    railway service
    
    Write-Host "Getting MongoDB connection string..." -ForegroundColor Cyan
    $mongoVars = railway variables 2>&1 | Out-String
    
    # Extract MONGO_URL from output
    if ($mongoVars -match "MONGO_URL.*mongodb://") {
        # Extract the MongoDB connection string
        $mongoUrl = ($mongoVars | Select-String -Pattern "(mongodb://[^\s\r\n]+)" -AllMatches).Matches[0].Value
        Write-Host "[OK] Found MONGO_URL: $mongoUrl" -ForegroundColor Green
        
        # Switch back to main service
        Write-Host "Switching back to main application service..." -ForegroundColor Cyan
        railway service
        
        # Set MONGO_URI
        Write-Host "Setting MONGO_URI..." -ForegroundColor Cyan
        try {
            Invoke-RailwayCommand "variables --set `"MONGO_URI=$mongoUrl`""
            Write-Host "✅ MONGO_URI configured successfully" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Failed to set MONGO_URI: $_" -ForegroundColor Red
        }
    }
    else {
        Write-Host "⚠️  MongoDB is still provisioning. Please wait and run this script again." -ForegroundColor Yellow
        Write-Host "   Typical provisioning time: 1-2 minutes" -ForegroundColor Gray
    }
}

# Step 5: Verify REDIS_URL is linked
if (-not $redisConfigured) {
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    Write-Host "Step 5: Verifying Redis Connection" -ForegroundColor Blue
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    
    Write-Host "Redis connection should be automatically linked by Railway" -ForegroundColor Cyan
    Write-Host "If not visible, it will be available via service references" -ForegroundColor Gray
}

# Step 6: Deploy the application
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "Step 6: Deploying Application" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue

Write-Host "Triggering deployment..." -ForegroundColor Cyan
try {
    railway up --detach 2>&1
    Write-Host "✅ Deployment triggered successfully" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Deployment trigger: $_" -ForegroundColor Yellow
}

# Step 7: Final verification
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "Step 7: Final Verification" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue

Start-Sleep -Seconds 3

Write-Host "Checking all variables..." -ForegroundColor Cyan
$finalVars = railway variables 2>&1 | Out-String
Write-Host $finalVars

# Count configured items
$configuredCount = 0
$totalCount = 13  # 11 Malaysian + MONGO_URI + REDIS_URL

# Malaysian compliance variables
$requiredVars = @(
    "NODE_ENV", "PORT", "SST_RATE", "GST_RATE", "CURRENCY",
    "TIMEZONE", "LOCALE", "DATE_FORMAT", "FISCAL_YEAR_START",
    "JWT_SECRET", "JWT_EXPIRE"
)

foreach ($var in $requiredVars) {
    if ($finalVars -match $var) {
        $configuredCount++
    }
}

# Database variables
if ($finalVars -match "MONGO_URI") { $configuredCount++ }
if ($finalVars -match "REDIS_URL") { $configuredCount++ }

$percentage = [math]::Round(($configuredCount / $totalCount) * 100, 0)

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   SETUP COMPLETION STATUS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configured Variables: $configuredCount / $totalCount" -ForegroundColor White
Write-Host "Completion: $percentage%" -ForegroundColor $(if ($percentage -eq 100) { "Green" } else { "Yellow" })
Write-Host ""

if ($percentage -eq 100) {
    Write-Host "🎉 HAFJET BUKKU Railway setup is 100% COMPLETE!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Monitor deployment: railway logs --tail 100" -ForegroundColor Gray
    Write-Host "2. Open application: railway open" -ForegroundColor Gray
    Write-Host "3. Check health: https://[your-app].railway.app/api/health" -ForegroundColor Gray
}
elseif ($percentage -ge 90) {
    Write-Host "⚠️  Setup is $percentage% complete" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Remaining tasks:" -ForegroundColor Cyan
    if ($finalVars -notmatch "MONGO_URI") {
        Write-Host "• MongoDB still provisioning - run this script again in 1-2 minutes" -ForegroundColor Gray
    }
    if ($finalVars -notmatch "REDIS_URL") {
        Write-Host "• Redis connection will be auto-linked or already available" -ForegroundColor Gray
    }
}
else {
    Write-Host "❌ Setup incomplete - please review errors above" -ForegroundColor Red
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
