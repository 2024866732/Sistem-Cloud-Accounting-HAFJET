# ============================================
# HAFJET Cloud Accounting - Automated Backup (PowerShell)
# This script creates secure backups of MongoDB
# ============================================

param(
    [string]$MongoHost = "localhost",
    [int]$MongoPort = 27017,
    [string]$MongoDb = "hafjet-bukku",
    [string]$MongoUser = "admin",
    [string]$MongoPassword = "",
    [string]$BackupRoot = ".\backups",
    [int]$RetentionDays = 7,
    [switch]$UploadToS3,
    [string]$S3Bucket = ""
)

$ErrorActionPreference = "Stop"

# Get current timestamp
$BackupDate = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupDir = Join-Path $BackupRoot $BackupDate
$BackupFile = "$BackupDir.tar.gz"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "HAFJET Cloud Accounting - MongoDB Backup" -ForegroundColor Cyan
Write-Host "Started: $(Get-Date)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Create backup directory
New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null

# Build mongodump command
$mongodumpArgs = @(
    "--host=$MongoHost",
    "--port=$MongoPort",
    "--db=$MongoDb",
    "--out=$BackupDir"
)

if ($MongoPassword) {
    $mongodumpArgs += "--username=$MongoUser"
    $mongodumpArgs += "--password=$MongoPassword"
    $mongodumpArgs += "--authenticationDatabase=admin"
}

# Perform MongoDB backup
Write-Host "Creating MongoDB backup..." -ForegroundColor Yellow
try {
    & mongodump $mongodumpArgs
    Write-Host "MongoDB backup created successfully" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to create MongoDB backup: $_" -ForegroundColor Red
    exit 1
}

# Compress backup using 7-Zip or tar (if available)
Write-Host "Compressing backup..." -ForegroundColor Yellow

if (Get-Command "7z" -ErrorAction SilentlyContinue) {
    & 7z a -tgzip "$BackupDir.tar.gz" "$BackupDir\*"
} elseif (Get-Command "tar" -ErrorAction SilentlyContinue) {
    tar -czf "$BackupDir.tar.gz" -C $BackupRoot $BackupDate
} else {
    Write-Host "WARNING: Neither 7z nor tar found. Creating ZIP instead..." -ForegroundColor Yellow
    Compress-Archive -Path $BackupDir -DestinationPath "$BackupDir.zip"
    $BackupFile = "$BackupDir.zip"
}

# Remove uncompressed backup directory
Remove-Item -Path $BackupDir -Recurse -Force

# Get backup size
$BackupSize = (Get-Item $BackupFile).Length / 1MB
Write-Host "Backup created: $BackupFile ($([math]::Round($BackupSize, 2)) MB)" -ForegroundColor Green

# Upload to S3 if requested
if ($UploadToS3 -and $S3Bucket) {
    Write-Host "Uploading to S3..." -ForegroundColor Yellow
    if (Get-Command "aws" -ErrorAction SilentlyContinue) {
        aws s3 cp $BackupFile "s3://$S3Bucket/backups/"
        Write-Host "Uploaded to S3 successfully" -ForegroundColor Green
    } else {
        Write-Host "WARNING: AWS CLI not found. Skipping S3 upload." -ForegroundColor Yellow
    }
}

# Cleanup old backups
Write-Host "Cleaning up old backups (keeping $RetentionDays days)..." -ForegroundColor Yellow
$CutoffDate = (Get-Date).AddDays(-$RetentionDays)
Get-ChildItem -Path $BackupRoot -Filter "*.tar.gz" -File | 
    Where-Object { $_.LastWriteTime -lt $CutoffDate } | 
    Remove-Item -Force

Get-ChildItem -Path $BackupRoot -Filter "*.zip" -File | 
    Where-Object { $_.LastWriteTime -lt $CutoffDate } | 
    Remove-Item -Force

Write-Host "Cleanup completed" -ForegroundColor Green

# Generate backup report
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Backup Summary" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Backup file: $BackupFile"
Write-Host "Backup size: $([math]::Round($BackupSize, 2)) MB"
Write-Host "Database: $MongoDb"
Write-Host "Host: $MongoHost:$MongoPort"
Write-Host ""

$DailyBackups = (Get-ChildItem -Path $BackupRoot -Filter "*.tar.gz" -File).Count + 
                (Get-ChildItem -Path $BackupRoot -Filter "*.zip" -File).Count

Write-Host "Daily backups: $DailyBackups"
Write-Host ""
Write-Host "Backup completed successfully!" -ForegroundColor Green
Write-Host "Finished: $(Get-Date)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

exit 0
