# ============================================
# HAFJET Cloud Accounting - Health Check Monitor
# Monitors application health and sends alerts
# ============================================

param(
    [string]$BackendUrl = "http://localhost:3001",
    [string]$FrontendUrl = "http://localhost:5173",
    [string]$MongoHost = "localhost",
    [int]$MongoPort = 27017,
    [string]$RedisHost = "localhost",
    [int]$RedisPort = 6379,
    [switch]$Continuous,
    [int]$IntervalSeconds = 60
)

$ErrorActionPreference = "Continue"

function Test-BackendHealth {
    try {
        $response = Invoke-WebRequest -Uri "$BackendUrl/health" -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ Backend is healthy" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "✗ Backend health check failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    return $false
}

function Test-FrontendHealth {
    try {
        $response = Invoke-WebRequest -Uri $FrontendUrl -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ Frontend is accessible" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "✗ Frontend health check failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    return $false
}

function Test-MongoDBHealth {
    try {
        $result = & mongo --host $MongoHost --port $MongoPort --eval "db.adminCommand('ping')" --quiet 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ MongoDB is healthy" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "✗ MongoDB health check failed" -ForegroundColor Red
        return $false
    }
    return $false
}

function Test-RedisHealth {
    try {
        if (Get-Command "redis-cli" -ErrorAction SilentlyContinue) {
            $result = & redis-cli -h $RedisHost -p $RedisPort ping 2>&1
            if ($result -eq "PONG") {
                Write-Host "✓ Redis is healthy" -ForegroundColor Green
                return $true
            }
        } else {
            Write-Host "⚠ redis-cli not found, skipping Redis check" -ForegroundColor Yellow
            return $null
        }
    } catch {
        Write-Host "✗ Redis health check failed" -ForegroundColor Red
        return $false
    }
    return $false
}

function Get-SystemMetrics {
    $cpu = Get-WmiObject Win32_Processor | Measure-Object -Property LoadPercentage -Average | Select-Object -ExpandProperty Average
    $mem = Get-WmiObject Win32_OperatingSystem
    $memUsed = [math]::Round((($mem.TotalVisibleMemorySize - $mem.FreePhysicalMemory) / $mem.TotalVisibleMemorySize) * 100, 2)
    
    Write-Host "`nSystem Metrics:" -ForegroundColor Cyan
    Write-Host "  CPU Usage: $cpu%"
    Write-Host "  Memory Usage: $memUsed%"
    
    if ($cpu -gt 80) {
        Write-Host "  ⚠ WARNING: High CPU usage!" -ForegroundColor Yellow
    }
    if ($memUsed -gt 80) {
        Write-Host "  ⚠ WARNING: High memory usage!" -ForegroundColor Yellow
    }
}

function Send-Alert {
    param([string]$Message)
    
    # Log to file
    $logFile = "logs/health-check-$(Get-Date -Format 'yyyy-MM-dd').log"
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - $Message" | Out-File -FilePath $logFile -Append
    
    # Could integrate with email/Slack/Discord notifications here
    Write-Host "ALERT: $Message" -ForegroundColor Red
}

function Start-HealthCheck {
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "HAFJET Health Check Monitor" -ForegroundColor Cyan
    Write-Host "Started: $(Get-Date)" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""
    
    $allHealthy = $true
    
    # Check backend
    if (-not (Test-BackendHealth)) {
        $allHealthy = $false
        Send-Alert "Backend health check failed"
    }
    
    # Check frontend
    if (-not (Test-FrontendHealth)) {
        $allHealthy = $false
        Send-Alert "Frontend health check failed"
    }
    
    # Check MongoDB
    if (-not (Test-MongoDBHealth)) {
        $allHealthy = $false
        Send-Alert "MongoDB health check failed"
    }
    
    # Check Redis
    $redisHealth = Test-RedisHealth
    if ($redisHealth -eq $false) {
        $allHealthy = $false
        Send-Alert "Redis health check failed"
    }
    
    # Get system metrics
    Get-SystemMetrics
    
    Write-Host ""
    if ($allHealthy) {
        Write-Host "✓ All services are healthy" -ForegroundColor Green
    } else {
        Write-Host "✗ Some services are unhealthy" -ForegroundColor Red
    }
    
    Write-Host "============================================" -ForegroundColor Cyan
    
    return $allHealthy
}

# Main execution
if ($Continuous) {
    Write-Host "Starting continuous health monitoring (interval: $IntervalSeconds seconds)..." -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host ""
    
    while ($true) {
        Start-HealthCheck
        Write-Host "`nNext check in $IntervalSeconds seconds...`n" -ForegroundColor Gray
        Start-Sleep -Seconds $IntervalSeconds
    }
} else {
    $result = Start-HealthCheck
    exit $(if ($result) { 0 } else { 1 })
}
