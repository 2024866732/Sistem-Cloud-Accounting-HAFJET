# install-localstack.ps1
# Automated LocalStack CLI installer for Windows PowerShell
# Requirements: Python 3, pip, awslocal, persistent env vars, error handling, colored output, rollback, sample S3 bucket

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Green }
function Write-ErrorMsg($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }
function Write-Warn($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Rollback {
    Write-ErrorMsg "Rolling back installation..."
    try {
        python3 -m pip uninstall -y localstack awscli-local
        Write-Info "Uninstalled LocalStack CLI and awslocal."
    } catch {
        Write-Warn "Rollback failed. Manual cleanup may be required."
    }
}

# Execution policy bypass
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

Write-Info "Checking Python 3 installation..."
$python = Get-Command python3 -ErrorAction SilentlyContinue
if (-not $python) {
    Write-ErrorMsg "Python 3 not found. Please install Python 3 from https://www.python.org/downloads/ and re-run this script."
    exit 1
} else {
    $pyver = python3 --version 2>&1
    Write-Info "Python found: $pyver"
}

Write-Info "Checking pip installation..."
$pip = Get-Command pip -ErrorAction SilentlyContinue
if (-not $pip) {
    Write-Warn "pip not found. Using python3 -m pip for installation."
    $pipCmd = "python3 -m pip"
} else {
    $pipCmd = "pip"
}

try {
    Write-Info "Installing/Upgrading LocalStack CLI..."
    & $pipCmd install --upgrade localstack
    Write-Info "LocalStack CLI installed/upgraded."
} catch {
    Write-ErrorMsg "Failed to install LocalStack CLI."
    Rollback
    exit 1
}

try {
    Write-Info "Setting persistent environment variables..."
    setx LOCALSTACK_AUTH_TOKEN "ls-kitUDIKa-TupI-DUfE-2300-qajEjemU52f9" | Out-Null
    setx AWS_ACCESS_KEY_ID "test" | Out-Null
    setx AWS_SECRET_ACCESS_KEY "test" | Out-Null
    setx AWS_DEFAULT_REGION "us-east-1" | Out-Null
    $env:LOCALSTACK_AUTH_TOKEN = "ls-kitUDIKa-TupI-DUfE-2300-qajEjemU52f9"
    $env:AWS_ACCESS_KEY_ID = "test"
    $env:AWS_SECRET_ACCESS_KEY = "test"
    $env:AWS_DEFAULT_REGION = "us-east-1"
    Write-Info "Environment variables set."
} catch {
    Write-ErrorMsg "Failed to set environment variables."
    Rollback
    exit 1
}

try {
    Write-Info "Installing awslocal CLI..."
    & $pipCmd install awscli-local
    Write-Info "awslocal CLI installed."
} catch {
    Write-ErrorMsg "Failed to install awslocal CLI."
    Rollback
    exit 1
}

try {
    Write-Info "Verifying LocalStack installation..."
    $ver = localstack --version 2>&1
    if ($LASTEXITCODE -ne 0) { throw "LocalStack CLI not found or failed." }
    Write-Info "LocalStack CLI version: $ver"
} catch {
    Write-ErrorMsg "LocalStack CLI verification failed."
    Rollback
    exit 1
}

try {
    Write-Info "Testing LocalStack start..."
    Start-Process -NoNewWindow -FilePath "localstack" -ArgumentList "start -d"
    Start-Sleep -Seconds 10
    Write-Info "LocalStack started in background."
} catch {
    Write-ErrorMsg "Failed to start LocalStack."
    Rollback
    exit 1
}

try {
    Write-Info "Creating sample S3 bucket (hafjet-local-bucket)..."
    awslocal s3 mb s3://hafjet-local-bucket
    Write-Info "Sample S3 bucket created."
} catch {
    Write-Warn "Failed to create S3 bucket. It may already exist or LocalStack is not ready."
}

Write-Info "LocalStack CLI setup complete!"
