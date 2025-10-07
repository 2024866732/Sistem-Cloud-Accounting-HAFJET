<#
.SYNOPSIS
    Check HAFJET Railway deployment status and health
.DESCRIPTION
    PowerShell-friendly health check for Railway deployed services
.PARAMETER BackendURL
    Railway backend URL (e.g., https://backend-production-xxxx.up.railway.app)
.PARAMETER FrontendURL
    Railway frontend URL (e.g., https://frontend-production-xxxx.up.railway.app)
.EXAMPLE
    .\scripts\check-deployment.ps1 -BackendURL "https://backend-xxx.railway.app" -FrontendURL "https://frontend-xxx.railway.app"
#>

param(
    [string]$BackendURL,
    [string]$FrontendURL
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"

Write-Host "`n🏥 HAFJET Deployment Health Check" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Check Railway CLI available
if (Get-Command railway -ErrorAction SilentlyContinue) {
    Write-Host "`n📦 Railway Status:" -ForegroundColor Cyan
    railway status
} else {
    Write-Host "`n⚠️  Railway CLI not installed" -ForegroundColor Yellow
}

# If URLs not provided, try environment variables
if (-not $BackendURL) { $BackendURL = $env:RAILWAY_BACKEND_URL }
if (-not $FrontendURL) { $FrontendURL = $env:RAILWAY_FRONTEND_URL }

# Backend health check
if ($BackendURL) {
    Write-Host "`n🔧 Backend Health Check" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "URL: $BackendURL" -ForegroundColor Gray
    
    try {
        $healthEndpoint = "$BackendURL/api/health"
        Write-Host "`n⏳ Testing: $healthEndpoint" -ForegroundColor Gray
        
        $response = Invoke-WebRequest -Uri $healthEndpoint -Method GET -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Backend HEALTHY (HTTP $($response.StatusCode))" -ForegroundColor Green
            
            try {
                $content = $response.Content | ConvertFrom-Json
                Write-Host "`n📊 Response:" -ForegroundColor Cyan
                Write-Host ($content | ConvertTo-Json -Depth 3) -ForegroundColor Gray
            } catch {
                Write-Host "Response: $($response.Content)" -ForegroundColor Gray
            }
        } else {
            Write-Host "⚠️  Backend responded with HTTP $($response.StatusCode)" -ForegroundColor Yellow
        }
        
        # Test auth status
        Write-Host "`n⏳ Testing: $BackendURL/api/auth/status" -ForegroundColor Gray
        try {
            $authResponse = Invoke-WebRequest -Uri "$BackendURL/api/auth/status" -Method GET -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
            Write-Host "✅ Auth endpoint reachable (HTTP $($authResponse.StatusCode))" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Auth endpoint: $($_.Exception.Message)" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "❌ Backend health check FAILED" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "`n💡 Troubleshooting:" -ForegroundColor Yellow
        Write-Host "  • Backend may still be starting (wait 2-3 minutes)" -ForegroundColor Gray
        Write-Host "  • Check Railway logs: railway logs" -ForegroundColor Gray
        Write-Host "  • Verify MONGO_URI and REDIS_URL are set" -ForegroundColor Gray
        Write-Host "  • Check Railway dashboard for deployment status" -ForegroundColor Gray
    }
} else {
    Write-Host "`n⚠️  Backend URL not provided" -ForegroundColor Yellow
    Write-Host "Usage: .\scripts\check-deployment.ps1 -BackendURL `"https://...`" -FrontendURL `"https://...`"" -ForegroundColor Gray
    Write-Host "`nGet URLs from Railway dashboard: https://railway.app" -ForegroundColor Cyan
}

# Frontend health check
if ($FrontendURL) {
    Write-Host "`n🎨 Frontend Health Check" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "URL: $FrontendURL" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $FrontendURL -Method GET -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Frontend ACCESSIBLE (HTTP $($response.StatusCode))" -ForegroundColor Green
            
            # Check for React indicators
            if ($response.Content -match "root" -or $response.Content -match "vite") {
                Write-Host "✅ React/Vite app detected" -ForegroundColor Green
            }
            
            # Check content length
            $sizeKB = [math]::Round($response.Content.Length / 1KB, 2)
            Write-Host "📦 Page size: $sizeKB KB" -ForegroundColor Gray
        } else {
            Write-Host "⚠️  Frontend responded with HTTP $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Frontend health check FAILED" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "`n💡 Troubleshooting:" -ForegroundColor Yellow
        Write-Host "  • Frontend may still be deploying" -ForegroundColor Gray
        Write-Host "  • Check Railway logs for frontend service" -ForegroundColor Gray
        Write-Host "  • Verify frontend build completed successfully" -ForegroundColor Gray
    }
} else {
    Write-Host "`n⚠️  Frontend URL not provided" -ForegroundColor Yellow
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎯 Health Check Complete" -ForegroundColor Green
Write-Host "`n📚 Useful Commands:" -ForegroundColor Cyan
Write-Host "  railway logs --tail 100           # View recent logs" -ForegroundColor Gray
Write-Host "  railway status                    # Check project status" -ForegroundColor Gray
Write-Host "  railway open                      # Open Railway dashboard" -ForegroundColor Gray
Write-Host "  railway variables list            # List environment variables" -ForegroundColor Gray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
