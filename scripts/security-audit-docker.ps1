# ============================================
# HAFJET Cloud Accounting - Docker Security Audit
# Automated security audit for Docker Compose configurations
# ============================================

param(
    [string]$ComposeFile = "deploy/docker-compose.prod.yml",
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"

$ERRORS = 0
$WARNINGS = 0
$INFO = 0

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "HAFJET Docker Security Audit" -ForegroundColor Cyan
Write-Host "File: $ComposeFile" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if file exists
if (-not (Test-Path $ComposeFile)) {
    Write-Host "✗ ERROR: File not found: $ComposeFile" -ForegroundColor Red
    exit 1
}

# Read docker-compose file
$content = Get-Content $ComposeFile -Raw

Write-Host "=== Security Checks ===" -ForegroundColor Yellow
Write-Host ""

# 1. Check for exposed ports
Write-Host "1. Checking for exposed ports..." -ForegroundColor Yellow
$exposedPorts = @()
if ($content -match "ports:\s*\n\s*-\s*['""]?(\d+):") {
    $matches = [regex]::Matches($content, "- ['""]?(\d+):(\d+)['""]?")
    foreach ($match in $matches) {
        $hostPort = $match.Groups[1].Value
        $containerPort = $match.Groups[2].Value
        $exposedPorts += "${hostPort}:${containerPort}"
        
        # Check for dangerous ports
        if ($hostPort -in @("27017", "6379", "9090")) {
            Write-Host "   ⚠ WARNING: Database/monitoring port $hostPort exposed to host" -ForegroundColor Yellow
            $WARNINGS++
        } else {
            Write-Host "   ℹ INFO: Port $hostPort exposed" -ForegroundColor Gray
            $INFO++
        }
    }
}

if ($exposedPorts.Count -eq 0) {
    Write-Host "   ✓ No ports exposed" -ForegroundColor Green
}
Write-Host ""

# 2. Check for hardcoded secrets
Write-Host "2. Checking for hardcoded secrets..." -ForegroundColor Yellow
$secretPatterns = @{
    "JWT_SECRET.*=.*[a-zA-Z0-9]{10,}" = "JWT Secret"
    "PASSWORD.*=.*[a-zA-Z0-9]{5,}" = "Password"
    "API_KEY.*=.*[a-zA-Z0-9]{10,}" = "API Key"
    "SECRET.*=.*[a-zA-Z0-9]{10,}" = "Secret"
}

$foundSecrets = $false
foreach ($pattern in $secretPatterns.Keys) {
    if ($content -match $pattern) {
        $matches = [regex]::Matches($content, $pattern)
        foreach ($match in $matches) {
            if ($match.Value -notmatch '\$\{|\$\(' -and $match.Value -notmatch 'change_me') {
                Write-Host "   ✗ ERROR: Hardcoded $($secretPatterns[$pattern]) found: $($match.Value)" -ForegroundColor Red
                $ERRORS++
                $foundSecrets = $true
            }
        }
    }
}

if (-not $foundSecrets) {
    Write-Host "   ✓ No hardcoded secrets found" -ForegroundColor Green
}
Write-Host ""

# 3. Check for environment variable usage
Write-Host "3. Checking environment variable usage..." -ForegroundColor Yellow
if ($content -match '\$\{[A-Z_]+\}') {
    Write-Host "   ✓ Using environment variables for secrets" -ForegroundColor Green
} else {
    Write-Host "   ⚠ WARNING: Not using environment variables for configuration" -ForegroundColor Yellow
    $WARNINGS++
}
Write-Host ""

# 4. Check restart policies
Write-Host "4. Checking restart policies..." -ForegroundColor Yellow
if ($content -match "restart:\s*(unless-stopped|always)") {
    Write-Host "   ✓ Restart policy configured" -ForegroundColor Green
} else {
    Write-Host "   ⚠ WARNING: No restart policy configured" -ForegroundColor Yellow
    $WARNINGS++
}
Write-Host ""

# 5. Check for volume permissions
Write-Host "5. Checking volume configurations..." -ForegroundColor Yellow
if ($content -match "volumes:") {
    $volumeMatches = [regex]::Matches($content, "- ([^:\n]+):([^:\n]+)(:ro)?")
    foreach ($match in $volumeMatches) {
        $hostPath = $match.Groups[1].Value.Trim()
        $containerPath = $match.Groups[2].Value.Trim()
        $readOnly = $match.Groups[3].Value
        
        if ($readOnly -eq ":ro") {
            Write-Host "   ✓ Volume $hostPath mounted as read-only" -ForegroundColor Green
        } elseif ($containerPath -match "/etc/|/config") {
            Write-Host "   ⚠ WARNING: Config volume $hostPath not read-only" -ForegroundColor Yellow
            $WARNINGS++
        } else {
            Write-Host "   ℹ INFO: Volume $hostPath mounted as read-write" -ForegroundColor Gray
            $INFO++
        }
    }
} else {
    Write-Host "   ℹ INFO: No volumes configured" -ForegroundColor Gray
}
Write-Host ""

# 6. Check for health checks
Write-Host "6. Checking health checks..." -ForegroundColor Yellow
$services = [regex]::Matches($content, "^\s{2}([a-z_]+):", [System.Text.RegularExpressions.RegexOptions]::Multiline)
foreach ($service in $services) {
    $serviceName = $service.Groups[1].Value
    if ($serviceName -in @("mongo", "redis", "backend", "frontend")) {
        $serviceSection = [regex]::Match($content, "$serviceName:(.+?)(?=^\s{2}[a-z_]+:|^volumes:|^$)", [System.Text.RegularExpressions.RegexOptions]::Singleline -bor [System.Text.RegularExpressions.RegexOptions]::Multiline)
        if ($serviceSection.Value -match "healthcheck:|health_check:") {
            Write-Host "   ✓ Health check configured for $serviceName" -ForegroundColor Green
        } else {
            Write-Host "   ⚠ WARNING: No health check for $serviceName" -ForegroundColor Yellow
            $WARNINGS++
        }
    }
}
Write-Host ""

# 7. Check for security options
Write-Host "7. Checking security options..." -ForegroundColor Yellow
if ($content -match "security_opt:") {
    Write-Host "   ✓ Security options configured" -ForegroundColor Green
} else {
    Write-Host "   ℹ INFO: No security options configured (optional)" -ForegroundColor Gray
    $INFO++
}
Write-Host ""

# 8. Check for resource limits
Write-Host "8. Checking resource limits..." -ForegroundColor Yellow
if ($content -match "deploy:\s*\n\s*resources:") {
    Write-Host "   ✓ Resource limits configured" -ForegroundColor Green
} else {
    Write-Host "   ⚠ WARNING: No resource limits configured" -ForegroundColor Yellow
    $WARNINGS++
}
Write-Host ""

# 9. Check for logging configuration
Write-Host "9. Checking logging configuration..." -ForegroundColor Yellow
if ($content -match "logging:") {
    Write-Host "   ✓ Logging configured" -ForegroundColor Green
} else {
    Write-Host "   ℹ INFO: Default logging used (consider custom config)" -ForegroundColor Gray
    $INFO++
}
Write-Host ""

# 10. Check for network configuration
Write-Host "10. Checking network configuration..." -ForegroundColor Yellow
if ($content -match "networks:") {
    Write-Host "   ✓ Custom networks configured" -ForegroundColor Green
} else {
    Write-Host "   ℹ INFO: Using default network (consider custom networks)" -ForegroundColor Gray
    $INFO++
}
Write-Host ""

# Summary
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Audit Summary" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "File: $ComposeFile"
Write-Host ""
Write-Host "Errors: $ERRORS" -ForegroundColor $(if ($ERRORS -gt 0) { "Red" } else { "Green" })
Write-Host "Warnings: $WARNINGS" -ForegroundColor $(if ($WARNINGS -gt 0) { "Yellow" } else { "Green" })
Write-Host "Info: $INFO" -ForegroundColor Gray
Write-Host ""

# Recommendations
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Recommendations" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 🔒 Use environment variables for ALL secrets (JWT, passwords, API keys)"
Write-Host "2. 🚪 Don't expose database ports (27017, 6379) to host in production"
Write-Host "3. 🏥 Add health checks for all critical services"
Write-Host "4. 📊 Configure resource limits (CPU, memory) to prevent DoS"
Write-Host "5. 🔐 Mount config files as read-only (:ro) where possible"
Write-Host "6. 🌐 Use custom Docker networks for service isolation"
Write-Host "7. 📝 Configure logging with rotation to prevent disk issues"
Write-Host "8. 🛡️ Consider adding security_opt for AppArmor/SELinux"
Write-Host ""

if ($ERRORS -gt 0) {
    Write-Host "✗ AUDIT FAILED - Critical security issues found" -ForegroundColor Red
    exit 1
} elseif ($WARNINGS -gt 5) {
    Write-Host "⚠ AUDIT PASSED WITH WARNINGS - Consider addressing issues" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "✓ AUDIT PASSED - Configuration looks secure" -ForegroundColor Green
    exit 0
}
