param(
    [string]$RunId,
    [string]$Repo = '2024866732/Sistem-Cloud-Accounting-HAFJET'
)

if (-not $RunId) {
    $RunId = Read-Host 'Enter Actions run id (e.g., 18236494660)'
}

Write-Host "This script downloads and extracts GitHub Actions logs for run $RunId in repo $Repo." -ForegroundColor Cyan
Write-Host "You will be prompted for a Personal Access Token (PAT) with 'repo' (and 'workflow' if available) scope." -ForegroundColor Yellow

# Read PAT as secure string and convert to plaintext temporarily
$secure = Read-Host 'Paste PAT (input hidden)' -AsSecureString
$ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
$token = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($ptr)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)

$uri = "https://api.github.com/repos/$Repo/actions/runs/$RunId/logs"
$outZip = Join-Path -Path (Get-Location) -ChildPath "run-$RunId-logs.zip"
$outDir = Join-Path -Path (Get-Location) -ChildPath "run-$RunId-logs"

try {
    Write-Host "Downloading logs from: $uri" -ForegroundColor Green
    Invoke-RestMethod -Uri $uri -Headers @{ Authorization = "token $token"; 'User-Agent' = 'PowerShell' } -OutFile $outZip -UseBasicParsing
    Write-Host "Download complete. Extracting to: $outDir" -ForegroundColor Green
    if (Test-Path $outDir) { Remove-Item -Recurse -Force $outDir }
    Expand-Archive -Path $outZip -DestinationPath $outDir -Force
    Write-Host "Logs extracted. File list:" -ForegroundColor Green
    Get-ChildItem $outDir -Recurse | Select-Object FullName | ForEach-Object { Write-Host $_.FullName }
    Write-Host "\nOpen the directory and find the step file(s) for failing jobs. Paste the failing step output here for analysis." -ForegroundColor Cyan
} catch {
    Write-Error "Failed to download or extract logs: $_"
} finally {
    # zero-out sensitive variable
    $token = $null
    $secure = $null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}

Write-Host "Done. Remember to delete the ZIP and extracted logs when finished to avoid leaving logs on disk." -ForegroundColor Yellow
Write-Host "To remove artifacts:" -ForegroundColor Yellow
Write-Host "Remove-Item -Recurse -Force ./run-$RunId-logs ./run-$RunId-logs.zip" -ForegroundColor Yellow
