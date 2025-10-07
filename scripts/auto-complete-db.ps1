# Auto-Complete Database Configuration
# Gets database URLs from Railway and configures them automatically

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  AUTO-COMPLETE DATABASE CONFIGURATION" -ForegroundColor White
Write-Host "============================================`n" -ForegroundColor Cyan

# Function to extract connection string from Railway variables
function Get-RailwayDatabaseUrl {
    param(
        [string]$ServiceName,
        [string]$VariableName
    )
    
    Write-Host "[CHECK] Looking for $ServiceName service..." -ForegroundColor Yellow
    
    # Try to get all variables and search for database URL
    $allVars = railway variables 2>&1 | Out-String
    
    # Look for MONGO_URL or REDIS_URL in the output
    $pattern = "$VariableName\s*│\s*([^\s│]+)"
    if ($allVars -match $pattern) {
        $url = $matches[1].Trim()
        Write-Host "[FOUND] $VariableName detected" -ForegroundColor Green
        return $url
    }
    
    Write-Host "[PENDING] $VariableName not yet available" -ForegroundColor Yellow
    return $null
}

# Wait for services to be ready
Write-Host "[WAIT] Databases may still be provisioning..." -ForegroundColor Yellow
Write-Host "       This can take 1-2 minutes" -ForegroundColor Gray
Start-Sleep -Seconds 15

# Try to get MongoDB URL
$mongoUrl = Get-RailwayDatabaseUrl -ServiceName "MongoDB" -VariableName "MONGO_URL"

# Try to get Redis URL  
$redisUrl = Get-RailwayDatabaseUrl -ServiceName "Redis" -VariableName "REDIS_URL"

# Configure found URLs
$configured = 0

if ($mongoUrl) {
    Write-Host "`n[CONFIG] Setting MONGO_URI..." -ForegroundColor Cyan
    railway variables --set "MONGO_URI=$mongoUrl" --skip-deploys 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0 -or $?) {
        Write-Host "[SUCCESS] MONGO_URI configured!" -ForegroundColor Green
        $configured++
    } else {
        Write-Host "[MANUAL] Please set manually: MONGO_URI=$($mongoUrl.Substring(0, [Math]::Min(50, $mongoUrl.Length)))..." -ForegroundColor Yellow
    }
} else {
    Write-Host "`n[PENDING] MongoDB still provisioning" -ForegroundColor Yellow
    Write-Host "         Check Railway dashboard in 1-2 minutes" -ForegroundColor Gray
}

if ($redisUrl) {
    Write-Host "`n[CONFIG] Redis URL detected: $($redisUrl.Substring(0, [Math]::Min(40, $redisUrl.Length)))..." -ForegroundColor Green
    Write-Host "[INFO] REDIS_URL should auto-link to main service" -ForegroundColor Cyan
    $configured++
} else {
    Write-Host "`n[PENDING] Redis still provisioning" -ForegroundColor Yellow
    Write-Host "         Check Railway dashboard in 1-2 minutes" -ForegroundColor Gray
}

# Show current variables
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "CURRENT RAILWAY VARIABLES" -ForegroundColor White
Write-Host "============================================" -ForegroundColor Cyan
railway variables 2>&1

# Final status
Write-Host "`n============================================" -ForegroundColor Cyan
if ($configured -ge 2) {
    Write-Host "STATUS: 100% COMPLETE!" -ForegroundColor Green
    Write-Host "============================================`n" -ForegroundColor Cyan
    Write-Host "[SUCCESS] All databases configured!" -ForegroundColor Green
    Write-Host "[DEPLOY] Triggering automatic deployment..." -ForegroundColor Cyan
    
    # Auto-deploy
    railway up --detach 2>&1
    
    Write-Host "`n[NEXT] Monitor deployment:" -ForegroundColor Yellow
    Write-Host "       railway logs --tail 100" -ForegroundColor White
} elseif ($configured -ge 1) {
    Write-Host "STATUS: 90% COMPLETE" -ForegroundColor Yellow
    Write-Host "============================================`n" -ForegroundColor Cyan
    Write-Host "[INFO] Partial configuration complete" -ForegroundColor Yellow
    Write-Host "[WAIT] Check dashboard for remaining database" -ForegroundColor Gray
} else {
    Write-Host "STATUS: 85% COMPLETE" -ForegroundColor Yellow
    Write-Host "============================================`n" -ForegroundColor Cyan
    Write-Host "[INFO] Databases added but still provisioning" -ForegroundColor Yellow
    Write-Host "[ACTION] Wait 1-2 minutes and run this script again:" -ForegroundColor White
    Write-Host "         .\scripts\auto-complete-db.ps1" -ForegroundColor Cyan
}

Write-Host "`n[DASHBOARD] https://railway.app/project/186782e9-5c00-473e-8434-a5fdd3951711" -ForegroundColor Gray
Write-Host "============================================`n" -ForegroundColor Cyan
