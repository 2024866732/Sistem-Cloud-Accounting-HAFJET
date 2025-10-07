# HAFJET BUKKU - Finalize Database Setup
# Simple script to complete the final database configuration

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "HAFJET BUKKU - Database Setup Finalizer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Switch to Mongo service and get connection string
Write-Host "[1/5] Switching to Mongo database service..." -ForegroundColor Yellow
railway service

Write-Host "[2/5] Getting MongoDB connection string..." -ForegroundColor Yellow
$mongoOutput = railway variables 2>&1 | Out-String

# Try to extract MONGO_URL
$mongoUrlMatch = $mongoOutput | Select-String -Pattern "(mongodb://[^\s\r\n]+)" -AllMatches
if ($mongoUrlMatch) {
    $mongoUrl = $mongoUrlMatch.Matches[0].Value
    Write-Host "[OK] MongoDB URL found!" -ForegroundColor Green
    Write-Host "     $mongoUrl" -ForegroundColor Gray
    
    # Step 2: Switch back to main app service
    Write-Host ""
    Write-Host "[3/5] Switching to main application service..." -ForegroundColor Yellow
    railway service
    
    # Step 3: Set MONGO_URI variable
    Write-Host "[4/5] Configuring MONGO_URI variable..." -ForegroundColor Yellow
    $setResult = railway variables --set "MONGO_URI=$mongoUrl" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] MONGO_URI configured successfully!" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Failed to set MONGO_URI" -ForegroundColor Red
        Write-Host $setResult
    }
    
    # Step 4: Trigger deployment
    Write-Host ""
    Write-Host "[5/5] Triggering deployment..." -ForegroundColor Yellow
    railway up --detach 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Deployment triggered!" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Deployment may have issues, check manually" -ForegroundColor Yellow
    }
    
    # Final verification
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "FINAL STATUS CHECK" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    Start-Sleep -Seconds 2
    $finalVars = railway variables 2>&1 | Out-String
    
    Write-Host ""
    Write-Host "Checking configured variables..." -ForegroundColor Cyan
    
    $checklist = @{
        "NODE_ENV" = $false
        "PORT" = $false
        "SST_RATE" = $false
        "GST_RATE" = $false
        "CURRENCY" = $false
        "TIMEZONE" = $false
        "LOCALE" = $false
        "DATE_FORMAT" = $false
        "FISCAL_YEAR_START" = $false
        "JWT_SECRET" = $false
        "JWT_EXPIRE" = $false
        "MONGO_URI" = $false
        "REDIS_URL" = $false
    }
    
    foreach ($key in $checklist.Keys) {
        if ($finalVars -match $key) {
            Write-Host "[OK] $key" -ForegroundColor Green
            $checklist[$key] = $true
        } else {
            Write-Host "[MISSING] $key" -ForegroundColor Red
        }
    }
    
    $configuredCount = ($checklist.Values | Where-Object { $_ -eq $true }).Count
    $totalCount = $checklist.Count
    $percentage = [math]::Round(($configuredCount / $totalCount) * 100, 0)
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "COMPLETION: $configuredCount/$totalCount variables ($percentage%)" -ForegroundColor $(if ($percentage -eq 100) { "Green" } elseif ($percentage -ge 90) { "Yellow" } else { "Red" })
    Write-Host "========================================" -ForegroundColor Cyan
    
    if ($percentage -eq 100) {
        Write-Host ""
        Write-Host "SUCCESS! Railway setup is 100% complete!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "  1. railway logs --tail 50" -ForegroundColor Gray
        Write-Host "  2. railway open" -ForegroundColor Gray
        Write-Host "  3. Test /api/health endpoint" -ForegroundColor Gray
    } else {
        Write-Host ""
        Write-Host "Setup is $percentage% complete" -ForegroundColor Yellow
        Write-Host "Missing variables will be configured automatically by Railway" -ForegroundColor Gray
    }
    
} else {
    Write-Host "[ERROR] MongoDB MONGO_URL not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "This means MongoDB is still provisioning." -ForegroundColor Yellow
    Write-Host "Please wait 1-2 minutes and run this script again:" -ForegroundColor Yellow
    Write-Host "  .\scripts\finalize-db-setup.ps1" -ForegroundColor Gray
}

Write-Host ""
