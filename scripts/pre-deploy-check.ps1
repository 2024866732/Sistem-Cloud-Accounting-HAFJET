#!/usr/bin/env pwsh
# =============================================================================
# Pre-Deployment Validation Script
# =============================================================================
# Script ini akan validate semua requirements sebelum push ke Git
# Run script ini sebelum setiap deployment untuk ensure quality
#
# Usage: .\scripts\pre-deploy-check.ps1
# =============================================================================

param(
    [switch]$SkipBuild,
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"
$script:errorCount = 0
$script:warningCount = 0

function Write-Check {
    param([string]$Message, [string]$Status)
    
    $icon = switch ($Status) {
        "pass" { "[PASS]"; $color = "Green" }
        "fail" { "[FAIL]"; $color = "Red"; $script:errorCount++ }
        "warn" { "[WARN]"; $color = "Yellow"; $script:warningCount++ }
        "info" { "[INFO]"; $color = "Cyan" }
        default { "[----]"; $color = "White" }
    }
    
    Write-Host "$icon $Message" -ForegroundColor $color
}

Write-Host "`nHAFJET Bukku - Pre-Deployment Validation" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan

# =============================================================================
# Check 1: GitHub CLI & Authentication
# =============================================================================
Write-Host "`n1️⃣ Checking GitHub CLI..." -ForegroundColor Yellow

try {
    $ghVersion = gh --version 2>&1 | Select-Object -First 1
    Write-Check "GitHub CLI installed: $ghVersion" "pass"
    
    $ghAuth = gh auth status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Check "GitHub authenticated" "pass"
    } else {
        Write-Check "GitHub not authenticated - run 'gh auth login'" "fail"
    }
} catch {
    Write-Check "GitHub CLI not found - install from https://cli.github.com" "fail"
}

# =============================================================================
# Check 2: Required Secrets
# =============================================================================
Write-Host "`n2️⃣ Checking GitHub Secrets..." -ForegroundColor Yellow

try {
    $secrets = gh secret list 2>&1
    
    if ($secrets -match "RAILWAY_TOKEN") {
        Write-Check "RAILWAY_TOKEN secret found" "pass"
    } else {
        Write-Check "RAILWAY_TOKEN secret missing" "fail"
    }
    
    if ($secrets -match "RAILWAY_PROJECT") {
        Write-Check "RAILWAY_PROJECT secret found" "pass"
    } else {
        Write-Check "RAILWAY_PROJECT secret missing" "fail"
    }
} catch {
    Write-Check "Cannot check secrets - ensure gh CLI is authenticated" "fail"
}

# =============================================================================
# Check 3: Workflow YAML Syntax
# =============================================================================
Write-Host "`n3️⃣ Validating Workflow YAML..." -ForegroundColor Yellow

$workflowDir = ".github/workflows"
if (Test-Path $workflowDir) {
    $yamlFiles = Get-ChildItem "$workflowDir/*.yml"
    
    foreach ($file in $yamlFiles) {
        $content = Get-Content $file.FullName -Raw
        
        # Check for inline comments after run:
        if ($content -match '(?m)^\s+run:.*#') {
            Write-Check "$($file.Name): Contains inline comment after 'run:'" "fail"
        }
        
        # Check for LocalStack references (should be removed)
        if ($content -match 'localstack|--endpoint-url.*4566') {
            Write-Check "$($file.Name): Contains LocalStack references" "warn"
        }
        
        # Check for proper if: syntax (no dollar-brace wrapper)
        if ($content -match 'if:\s*\$\{\{\s*(success|failure|always)\(\)') {
            Write-Check "$($file.Name): Unnecessary dollar-brace-brace wrapper in if: expression" "fail"
        }
    }
    
    Write-Check "Analyzed $($yamlFiles.Count) workflow files" "pass"
} else {
    Write-Check "Workflow directory not found" "fail"
}

# =============================================================================
# Check 4: Frontend Build
# =============================================================================
Write-Host "`n4️⃣ Testing Frontend..." -ForegroundColor Yellow

if (-not $SkipBuild) {
    Push-Location frontend -ErrorAction SilentlyContinue
    
    if ($?) {
        # Check package.json exists
        if (Test-Path "package.json") {
            Write-Check "Frontend package.json found" "pass"
            
            # Test build
            Write-Host "   Building frontend (this may take a moment)..." -ForegroundColor Gray
            $buildOutput = npm run build 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Check "Frontend build successful" "pass"
                
                # Check dist folder
                if (Test-Path "dist") {
                    Write-Check "Frontend dist/ folder created" "pass"
                } else {
                    Write-Check "Frontend dist/ folder not found" "warn"
                }
            } else {
                Write-Check "Frontend build failed" "fail"
                if ($Verbose) {
                    Write-Host $buildOutput -ForegroundColor Red
                }
            }
        } else {
            Write-Check "Frontend package.json not found" "fail"
        }
        
        Pop-Location
    } else {
        Write-Check "Frontend directory not found" "fail"
    }
} else {
    Write-Check "Frontend build check skipped (-SkipBuild)" "info"
}

# =============================================================================
# Check 5: Backend Build
# =============================================================================
Write-Host "`n5️⃣ Testing Backend..." -ForegroundColor Yellow

if (-not $SkipBuild) {
    Push-Location backend -ErrorAction SilentlyContinue
    
    if ($?) {
        if (Test-Path "package.json") {
            Write-Check "Backend package.json found" "pass"
            
            Write-Host "   Building backend (this may take a moment)..." -ForegroundColor Gray
            $buildOutput = npm run build 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Check "Backend build successful" "pass"
            } else {
                Write-Check "Backend build failed" "fail"
                if ($Verbose) {
                    Write-Host $buildOutput -ForegroundColor Red
                }
            }
        } else {
            Write-Check "Backend package.json not found" "fail"
        }
        
        Pop-Location
    } else {
        Write-Check "Backend directory not found" "fail"
    }
} else {
    Write-Check "Backend build check skipped (-SkipBuild)" "info"
}

# =============================================================================
# Check 6: Railway CLI (Optional)
# =============================================================================
Write-Host "`n6️⃣ Checking Railway CLI..." -ForegroundColor Yellow

try {
    $railwayVersion = railway --version 2>&1
    Write-Check "Railway CLI installed: $railwayVersion" "pass"
    
    $railwayStatus = railway status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Check "Railway project linked" "pass"
    } else {
        Write-Check "Railway project not linked (optional for CI)" "info"
    }
} catch {
    Write-Check "Railway CLI not installed (optional for CI)" "info"
}

# =============================================================================
# Check 7: Git Status
# =============================================================================
Write-Host "`n7️⃣ Checking Git Status..." -ForegroundColor Yellow

try {
    $gitStatus = git status --porcelain 2>&1
    
    if ($gitStatus) {
        $fileCount = ($gitStatus | Measure-Object).Count
        Write-Check "$fileCount uncommitted file(s)" "info"
        
        # Check for potential secrets in diffs
        $gitDiff = git diff 2>&1
        if ($gitDiff -match '(secret|token|password|api_key|private_key)') {
            Write-Check "Potential secrets in uncommitted changes - review carefully!" "warn"
        }
    } else {
        Write-Check "Working directory clean" "pass"
    }
    
    $branch = git branch --show-current 2>&1
    Write-Check "Current branch: $branch" "info"
} catch {
    Write-Check "Git not available or not a git repository" "fail"
}

# =============================================================================
# Check 8: Required Files
# =============================================================================
Write-Host "`n8️⃣ Checking Required Files..." -ForegroundColor Yellow

$requiredFiles = @(
    ".github/workflows/deploy.yml",
    ".github/workflows/monitor-deploy.yml",
    "frontend/package.json",
    "backend/package.json",
    "README.md"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Check "$file exists" "pass"
    } else {
        Write-Check "$file missing" "fail"
    }
}

# =============================================================================
# Summary
# =============================================================================
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan

if ($script:errorCount -eq 0 -and $script:warningCount -eq 0) {
    Write-Host "[PASS] ALL CHECKS PASSED - Safe to deploy!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "  git add ." -ForegroundColor White
    Write-Host "  git commit -m 'your message'" -ForegroundColor White
    Write-Host "  git push origin main" -ForegroundColor White
    Write-Host "  gh run watch" -ForegroundColor White
    exit 0
    
} elseif ($script:errorCount -eq 0) {
    Write-Host "[WARN] $script:warningCount WARNING(S) - Review before deploying" -ForegroundColor Yellow
    Write-Host "`nYou can proceed, but review warnings carefully." -ForegroundColor Yellow
    exit 0
    
} else {
    Write-Host "[FAIL] $script:errorCount ERROR(S) found - Fix before deploying!" -ForegroundColor Red
    if ($script:warningCount -gt 0) {
        Write-Host "[WARN] $script:warningCount WARNING(S) also found" -ForegroundColor Yellow
    }
    
    Write-Host "`nFix the errors above before pushing to Git." -ForegroundColor Red
    Write-Host "Run with -Verbose flag for detailed error messages." -ForegroundColor Yellow
    exit 1
}

