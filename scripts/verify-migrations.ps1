<#
.SYNOPSIS
    Verifies database migrations for HAFJET Cloud Accounting

.DESCRIPTION
    This script checks the database migration configuration, validates migration files,
    and optionally runs migrations in dry-run mode.

.PARAMETER MongoUri
    MongoDB connection string (default: mongodb://localhost:27017/hafjet-bukku)

.PARAMETER DryRun
    Run in dry-run mode without applying migrations

.EXAMPLE
    .\scripts\verify-migrations.ps1
    .\scripts\verify-migrations.ps1 -MongoUri "mongodb://localhost:27017/hafjet-bukku" -DryRun

.NOTES
    Author: HAFJET Development Team
    Date: 2025
#>

param(
    [string]$MongoUri = "mongodb://localhost:27017/hafjet-bukku",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Success { Write-Host "✓ $args" -ForegroundColor Green }
function Write-Warning { Write-Host "⚠ $args" -ForegroundColor Yellow }
function Write-Error { Write-Host "✗ $args" -ForegroundColor Red }
function Write-Info { Write-Host "ℹ $args" -ForegroundColor Cyan }

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "HAFJET Database Migrations Verification" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$BackendDir = "backend"
$MigrationsDir = Join-Path $BackendDir "migrations"
$ConfigFile = Join-Path $BackendDir "migrate-mongo-config.js"
$FailedChecks = 0

# Check 1: Verify migrations directory exists
Write-Info "Checking migrations directory..."
if (Test-Path $MigrationsDir) {
    Write-Success "Migrations directory exists: $MigrationsDir"
} else {
    Write-Error "Migrations directory not found: $MigrationsDir"
    $FailedChecks++
}

# Check 2: Verify migrate-mongo-config.js exists
Write-Info "Checking migrate-mongo configuration..."
if (Test-Path $ConfigFile) {
    Write-Success "Configuration file exists: $ConfigFile"
} else {
    Write-Error "Configuration file not found: $ConfigFile"
    $FailedChecks++
}

# Check 3: List migration files
Write-Info "Listing migration files..."
$MigrationFiles = Get-ChildItem -Path $MigrationsDir -Filter "*.js" -File | Where-Object { $_.Name -ne "README.md" }
if ($MigrationFiles.Count -gt 0) {
    Write-Success "Found $($MigrationFiles.Count) migration file(s):"
    foreach ($file in $MigrationFiles) {
        Write-Host "  - $($file.Name)" -ForegroundColor Gray
    }
} else {
    Write-Warning "No migration files found in $MigrationsDir"
}

# Check 4: Validate migration file structure
Write-Info "Validating migration file structure..."
$ValidMigrations = 0
$InvalidMigrations = 0

foreach ($file in $MigrationFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Check for required exports
    $hasUp = $content -match "exports\.up\s*="
    $hasDown = $content -match "exports\.down\s*="
    
    if ($hasUp -and $hasDown) {
        Write-Success "Valid migration: $($file.Name)"
        $ValidMigrations++
    } else {
        Write-Error "Invalid migration: $($file.Name) (missing up/down functions)"
        $InvalidMigrations++
        $FailedChecks++
    }
}

Write-Host "`nValidation Summary:" -ForegroundColor Cyan
Write-Host "  Valid: $ValidMigrations" -ForegroundColor Green
Write-Host "  Invalid: $InvalidMigrations" -ForegroundColor Red

# Check 5: Verify Node.js and npm
Write-Info "Checking Node.js and npm..."
try {
    $nodeVersion = node --version 2>$null
    $npmVersion = npm --version 2>$null
    Write-Success "Node.js: $nodeVersion, npm: $npmVersion"
} catch {
    Write-Error "Node.js or npm not found. Please install Node.js."
    $FailedChecks++
}

# Check 6: Verify migrate-mongo package
Write-Info "Checking migrate-mongo installation..."
Push-Location $BackendDir
try {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    if ($packageJson.devDependencies."migrate-mongo") {
        Write-Success "migrate-mongo is in package.json: $($packageJson.devDependencies.'migrate-mongo')"
    } else {
        Write-Warning "migrate-mongo not found in package.json devDependencies"
        $FailedChecks++
    }
    
    # Check if migrate-mongo is installed
    $migrateMongoCli = Join-Path "node_modules" ".bin" "migrate-mongo"
    if (Test-Path $migrateMongoCli) {
        Write-Success "migrate-mongo CLI is installed"
    } else {
        Write-Warning "migrate-mongo CLI not installed. Run 'npm install' in backend/"
    }
} catch {
    Write-Error "Failed to read package.json: $_"
    $FailedChecks++
} finally {
    Pop-Location
}

# Check 7: Test MongoDB connection
Write-Info "Testing MongoDB connection..."
try {
    # Try to connect using mongosh or mongo
    $mongoTest = $null
    
    # Try mongosh first (new MongoDB shell)
    try {
        $mongoTest = mongosh $MongoUri --eval "db.runCommand({ping: 1})" --quiet 2>$null
    } catch {
        # Fallback to mongo (legacy)
        try {
            $mongoTest = mongo $MongoUri --eval "db.runCommand({ping: 1})" --quiet 2>$null
        } catch {
            Write-Warning "MongoDB shell not found. Cannot test connection."
        }
    }
    
    if ($mongoTest) {
        Write-Success "Successfully connected to MongoDB: $MongoUri"
    } else {
        Write-Warning "Could not connect to MongoDB: $MongoUri (shell not available)"
    }
} catch {
    Write-Warning "MongoDB connection test failed: $_"
}

# Check 8: Run migrate-mongo status (if not dry-run)
if (-not $DryRun) {
    Write-Info "Checking migration status..."
    Push-Location $BackendDir
    try {
        $env:MONGODB_URI = $MongoUri
        $statusOutput = npx migrate-mongo status 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Migration status check successful"
            Write-Host "`nMigration Status:" -ForegroundColor Cyan
            Write-Host $statusOutput -ForegroundColor Gray
        } else {
            Write-Warning "Failed to check migration status"
            Write-Host $statusOutput -ForegroundColor Yellow
        }
    } catch {
        Write-Warning "Failed to run migrate-mongo status: $_"
    } finally {
        Pop-Location
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Verification Summary" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

if ($FailedChecks -eq 0) {
    Write-Success "All checks passed! Migrations are ready."
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "  1. Run 'cd backend && npx migrate-mongo status' to check applied migrations" -ForegroundColor Gray
    Write-Host "  2. Run 'npx migrate-mongo up' to apply pending migrations" -ForegroundColor Gray
    Write-Host "  3. Run 'npx migrate-mongo down' to rollback last migration" -ForegroundColor Gray
    exit 0
} else {
    Write-Error "`n$FailedChecks check(s) failed. Please fix the issues above."
    exit 1
}
