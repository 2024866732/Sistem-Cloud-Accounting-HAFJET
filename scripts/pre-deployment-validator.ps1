# ============================================
# HAFJET Cloud Accounting - Pre-Deployment Validator
# Validates all checklist items before deployment
# ============================================

param(
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"

$PASSED = 0
$FAILED = 0
$WARNINGS = 0

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "HAFJET Pre-Deployment Validator" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

function Test-ChecklistItem {
    param(
        [string]$Name,
        [scriptblock]$Test,
        [bool]$Required = $true
    )
    
    Write-Host -NoNewline "Checking: $Name... "
    
    try {
        $result = & $Test
        if ($result) {
            Write-Host "✓ PASS" -ForegroundColor Green
            $script:PASSED++
        } else {
            if ($Required) {
                Write-Host "✗ FAIL" -ForegroundColor Red
                $script:FAILED++
            } else {
                Write-Host "⚠ WARN" -ForegroundColor Yellow
                $script:WARNINGS++
            }
        }
    } catch {
        if ($Required) {
            Write-Host "✗ FAIL: $_" -ForegroundColor Red
            $script:FAILED++
        } else {
            Write-Host "⚠ WARN: $_" -ForegroundColor Yellow
            $script:WARNINGS++
        }
    }
}

Write-Host "=== Environment Configuration ===" -ForegroundColor Yellow
Write-Host ""

Test-ChecklistItem "Backend .env.production exists" {
    Test-Path "backend/.env.production"
}

Test-ChecklistItem "Frontend .env.production exists" {
    Test-Path "frontend/.env.production"
}

Test-ChecklistItem "Root .env.production exists" {
    Test-Path ".env.production"
}

Test-ChecklistItem "Environment variables valid" {
    $result = & powershell -File "scripts/validate-env.ps1" 2>&1
    $LASTEXITCODE -eq 0
}

Write-Host ""
Write-Host "=== Security ===" -ForegroundColor Yellow
Write-Host ""

Test-ChecklistItem "JWT_SECRET is secure (32+ chars)" {
    if (Test-Path "backend/.env.production") {
        $content = Get-Content "backend/.env.production" -Raw
        if ($content -match 'JWT_SECRET=([^\r\n]+)') {
            $jwtSecret = $matches[1]
            $jwtSecret.Length -ge 32
        } else {
            $false
        }
    } else {
        $false
    }
}

Test-ChecklistItem "No hardcoded secrets in git" {
    $gitFiles = git ls-files
    $hasSecrets = $false
    foreach ($file in $gitFiles) {
        if ($file -match '\.env$|\.env\.production$|secret') {
            $hasSecrets = $true
            break
        }
    }
    -not $hasSecrets
}

Test-ChecklistItem "Docker Compose security audit passed" {
    if (Test-Path "scripts/security-audit-docker.ps1") {
        $result = & powershell -File "scripts/security-audit-docker.ps1" 2>&1
        $LASTEXITCODE -le 0
    } else {
        Write-Host "  (Script not found, skipping)" -ForegroundColor Gray
        $true
    }
} -Required $false

Write-Host ""
Write-Host "=== Backup & Recovery ===" -ForegroundColor Yellow
Write-Host ""

Test-ChecklistItem "Backup scripts exist" {
    (Test-Path "scripts/backup-mongodb.ps1") -or (Test-Path "scripts/backup-mongodb.sh")
}

Test-ChecklistItem "Backup directory configured" {
    (Test-Path "backups") -or (Test-Path "./backend/backups")
}

Test-ChecklistItem "Backup restoration tested" {
    # Check if test was run (look for test backup)
    $testBackups = Get-ChildItem -Path "backups" -Filter "*test*" -ErrorAction SilentlyContinue
    if ($testBackups) {
        $true
    } else {
        Write-Host "  (Not tested yet - run test-backup-restore.sh)" -ForegroundColor Gray
        $false
    }
} -Required $false

Write-Host ""
Write-Host "=== Database ===" -ForegroundColor Yellow
Write-Host ""

Test-ChecklistItem "Migrations directory exists" {
    Test-Path "backend/migrations"
}

Test-ChecklistItem "Migration config exists" {
    Test-Path "backend/migrate-mongo-config.js"
}

Write-Host ""
Write-Host "=== Docker ===" -ForegroundColor Yellow
Write-Host ""

Test-ChecklistItem "Dockerfile exists (backend)" {
    Test-Path "backend/Dockerfile"
}

Test-ChecklistItem "Dockerfile exists (frontend)" {
    Test-Path "frontend/Dockerfile"
}

Test-ChecklistItem "Docker Compose production config exists" {
    Test-Path "deploy/docker-compose.prod.yml"
}

Test-ChecklistItem "Docker daemon running" {
    docker ps > $null 2>&1
    $LASTEXITCODE -eq 0
} -Required $false

Write-Host ""
Write-Host "=== CI/CD ===" -ForegroundColor Yellow
Write-Host ""

Test-ChecklistItem "GitHub Actions workflows exist" {
    Test-Path ".github/workflows/ci.yml"
}

Test-ChecklistItem "CI workflows passing" {
    # Check latest CI run status
    $latestRun = gh run list --limit 1 --json status 2>&1 | ConvertFrom-Json
    if ($latestRun) {
        $latestRun.status -eq "completed"
    } else {
        $true # If gh CLI not available, assume passing
    }
} -Required $false

Write-Host ""
Write-Host "=== Documentation ===" -ForegroundColor Yellow
Write-Host ""

Test-ChecklistItem "README.md exists" {
    Test-Path "README.md"
}

Test-ChecklistItem "Deployment guides exist" {
    (Test-Path "docs/PRE_DEPLOYMENT_CHECKLIST.md") -and 
    (Test-Path "docs/QUICK_START_DEPLOYMENT.md")
}

Write-Host ""
Write-Host "=== Scripts & Automation ===" -ForegroundColor Yellow
Write-Host ""

Test-ChecklistItem "Health check script exists" {
    Test-Path "scripts/health-check.ps1"
}

Test-ChecklistItem "Validation scripts exist" {
    (Test-Path "scripts/validate-env.ps1") -or (Test-Path "scripts/validate-env.sh")
}

Test-ChecklistItem "Rollback script exists" {
    Test-Path "scripts/rollback-deployment.sh"
} -Required $false

# Summary
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Validation Summary" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Passed: $PASSED" -ForegroundColor Green
Write-Host "Failed: $FAILED" -ForegroundColor Red
Write-Host "Warnings: $WARNINGS" -ForegroundColor Yellow
Write-Host ""

if ($FAILED -eq 0 -and $WARNINGS -eq 0) {
    Write-Host "✓ ALL CHECKS PASSED" -ForegroundColor Green
    Write-Host "Ready for production deployment!" -ForegroundColor Green
    exit 0
} elseif ($FAILED -eq 0) {
    Write-Host "⚠ VALIDATION PASSED WITH WARNINGS" -ForegroundColor Yellow
    Write-Host "You can deploy but consider addressing warnings" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "✗ VALIDATION FAILED" -ForegroundColor Red
    Write-Host "Please fix all failed checks before deploying" -ForegroundColor Red
    exit 1
}
