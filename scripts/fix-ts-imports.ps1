# ============================================================================
# Fix TypeScript Relative Imports - Add .js Extensions
# ============================================================================
# Script ini menambah .js extension pada semua relative import dalam 
# TypeScript files untuk compliance dengan Node16/NodeNext ESM resolution
# ============================================================================

param(
    [string]$RootPath = "..\backend\src"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fix TypeScript Relative Imports" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$targetPath = Join-Path $scriptDir $RootPath | Resolve-Path

Write-Host "[INFO] Target directory: $targetPath" -ForegroundColor Green
Write-Host ""

# Find all TypeScript files
$tsFiles = Get-ChildItem -Path $targetPath -Filter "*.ts" -Recurse -File | Where-Object {
    $_.Name -notlike "*.d.ts"
}

Write-Host "[INFO] Found $($tsFiles.Count) TypeScript files" -ForegroundColor Green
Write-Host ""

$totalFixed = 0
$filesModified = 0

foreach ($file in $tsFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    $fileFixed = 0
    
    # Pattern 1: import ... from '../path' or '../../path'
    # Match relative imports without .js extension
    $pattern1 = "from\s+['""](\.\./[^'""]+?)(?<!\.js|\.json|\.mjs|\.cjs)['""]"
    $content = $content -replace $pattern1, "from '`$1.js'"
    
    # Pattern 2: import ... from './path'
    $pattern2 = "from\s+['""](\./[^'""]+?)(?<!\.js|\.json|\.mjs|\.cjs)['""]"
    $content = $content -replace $pattern2, "from '`$1.js'"
    
    if ($content -ne $originalContent) {
        # Count how many replacements were made
        $matches1 = [regex]::Matches($originalContent, $pattern1)
        $matches2 = [regex]::Matches($originalContent, $pattern2)
        $fileFixed = $matches1.Count + $matches2.Count
        
        # Write the updated content back
        Set-Content -Path $file.FullName -Value $content -NoNewline
        
        $relativePath = $file.FullName.Replace($targetPath, "").TrimStart("\")
        Write-Host "[FIXED] $relativePath - $fileFixed imports updated" -ForegroundColor Yellow
        
        $totalFixed += $fileFixed
        $filesModified++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[SUMMARY]" -ForegroundColor Green
Write-Host "  Files modified: $filesModified" -ForegroundColor White
Write-Host "  Total imports fixed: $totalFixed" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[NEXT] Run 'npm run build' in backend to verify" -ForegroundColor Magenta
