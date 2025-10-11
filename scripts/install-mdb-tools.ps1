<#
Install MongoDB Database Tools (Windows)
- Downloads the zip to $env:TEMP
- Extracts with -Force
- If running as Administrator: installs to C:\Program Files\MongoDB\Tools\bin and optionally updates Machine PATH
- If not admin: installs to $env:USERPROFILE\mongodb-tools\bin and updates User PATH
#>
param(
    [switch]$SystemInstall
)

function Write-Ok($m){ Write-Host "[OK] $m" -ForegroundColor Green }
function Write-Warn($m){ Write-Host "[WARN] $m" -ForegroundColor Yellow }
function Write-Err($m){ Write-Host "[ERR] $m" -ForegroundColor Red }

$zipUrl = 'https://fastdl.mongodb.org/tools/db/mongodb-database-tools-windows-x86_64-100.5.2.zip'
$zipPath = Join-Path $env:TEMP 'mdbtools.zip'
$extractRoot = Join-Path $env:TEMP 'mongodb-tools'

if (Test-Path $extractRoot) {
    Write-Warn "Removing existing $extractRoot"
    Remove-Item -Recurse -Force $extractRoot
}

Write-Host "Downloading MongoDB Database Tools..."
Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath

Write-Host "Extracting..."
Expand-Archive -Path $zipPath -DestinationPath $extractRoot -Force

# Find the bin folder inside extracted archive
$binSrc = Get-ChildItem -Path $extractRoot -Directory | ForEach-Object {
    Get-ChildItem -Path $_.FullName -Directory -Filter 'bin' -ErrorAction SilentlyContinue
} | Select-Object -First 1

if (-not $binSrc) {
    Write-Err "Could not locate bin folder inside extracted archive"
    exit 1
}
$binSrcPath = $binSrc.FullName

# Decide destination
if ($SystemInstall -or ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    $dest = 'C:\Program Files\MongoDB\Tools\bin'
    # Create folder
    if (-not (Test-Path $dest)) { New-Item -ItemType Directory -Path $dest -Force | Out-Null }
    Write-Host "Copying binaries to $dest (requires Admin)"
    Copy-Item -Path (Join-Path $binSrcPath '*') -Destination $dest -Recurse -Force
    # Update system PATH if admin
    try {
        $machinePath = [Environment]::GetEnvironmentVariable('Path',[EnvironmentVariableTarget]::Machine)
        if ($machinePath -notlike "*\Program Files\MongoDB\Tools\bin*") {
            [Environment]::SetEnvironmentVariable('Path', $machinePath + ';C:\Program Files\MongoDB\Tools\bin',[EnvironmentVariableTarget]::Machine)
            Write-Ok "Added to Machine PATH. A restart of the shell (or system) may be required."
        } else {
            Write-Ok "Machine PATH already contains MongoDB Tools path"
        }
    } catch {
        Write-Warn "Unable to update Machine PATH: $_"
    }
} else {
    # User-local install
    $dest = Join-Path $env:USERPROFILE 'mongodb-tools\bin'
    if (-not (Test-Path $dest)) { New-Item -ItemType Directory -Path $dest -Force | Out-Null }
    Write-Host "Copying binaries to $dest (user install)"
    Copy-Item -Path (Join-Path $binSrcPath '*') -Destination $dest -Recurse -Force
    # Update user PATH
    try {
        $userPath = [Environment]::GetEnvironmentVariable('Path',[EnvironmentVariableTarget]::User)
        if ($userPath -notlike "*$dest*") {
            [Environment]::SetEnvironmentVariable('Path', $userPath + ";$dest",[EnvironmentVariableTarget]::User)
            Write-Ok "Added tools to User PATH. Restart your shell to use them."
        } else {
            Write-Ok "User PATH already contains tools path"
        }
    } catch {
        Write-Warn "Unable to update User PATH: $_"
    }
}

Write-Ok "MongoDB Database Tools installation finished. Run 'mongodump --version' in a new shell to verify."
exit 0
