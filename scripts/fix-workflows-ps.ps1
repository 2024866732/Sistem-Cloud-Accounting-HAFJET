<#
Ensure all YAML workflow files in .github/workflows are single-document,
start with '---', have no trailing whitespace on any line, and end with a newline.
Also warn when a line exceeds 200 characters.
#>

$workflowDir = Join-Path $PSScriptRoot '..' | Join-Path -ChildPath '.github\workflows'
if (-not (Test-Path $workflowDir)) {
    Write-Error "Workflows directory not found: $workflowDir"
    exit 1
}

Get-ChildItem -Path $workflowDir -Filter "*.yml" -File | ForEach-Object {
    $path = $_.FullName
    Write-Host "Processing $path"
    $lines = Get-Content $path -Raw -ErrorAction Stop -Encoding UTF8 -Delimiter "`n" | Out-String
    # Normalize line endings to LF
    $content = $lines -replace "`r`n", "`n" -replace "`r", "`n"

    # Remove extra '---' separators beyond the first
    $parts = $content -split "`n---`n"
    if ($parts.Count -gt 1) {
        Write-Host "Found multiple YAML documents in $path; keeping first document"
    }
    $newContent = $parts[0]

    # Ensure it starts with ---
    if (-not $newContent.TrimStart().StartsWith('---')) {
        $newContent = "---`n" + $newContent.TrimStart()
    }

    # Remove trailing spaces
    $newContent = ($newContent -split "`n") | ForEach-Object { $_.TrimEnd() } | Out-String
    $newContent = $newContent -replace "`r`n", "`n"

    # Ensure final newline
    if (-not $newContent.EndsWith("`n")) { $newContent += "`n" }

    # Warn about long lines
    $idx = 0
    ($newContent -split "`n") | ForEach-Object {
        $idx++
        if ($_.Length -gt 200) { Write-Warning "$path line $idx length $($_.Length)" }
    }

    # Write back
    Set-Content -Path $path -Value $newContent -Encoding UTF8
}

Write-Host "Workflow files normalized. Review changes and commit if OK."
