# 💾 HAFJET Cloud Accounting - Backup & Restore Guide

**Last Updated**: October 12, 2025  
**Version**: 1.0.0

## 📋 Overview

This guide covers backup and restore procedures for HAFJET Cloud Accounting System, including MongoDB database, uploaded files, and configurations.

## 🎯 Backup Strategy

### Automatic Backups
- **Frequency**: Daily at 2:00 AM UTC
- **Retention**: 30 days
- **Storage**: Railway automated backups + manual S3/Azure Blob
- **Encryption**: AES-256

### Manual Backups
Create before:
- Major deployments
- Database migrations
- Schema changes
- Production troubleshooting

## 🔧 Backup Methods

### Method 1: MongoDB Database Tools (Local)

**Prerequisites**:
- MongoDB Database Tools installed
- `MONGO_URI` environment variable set

**Backup Command**:
```powershell
# Windows PowerShell
$env:MONGO_URI = "mongodb://user:pass@host:27017/hafjet"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "C:\backups\hafjet_$timestamp"
New-Item -ItemType Directory -Path $backupDir -Force

mongodump --uri="$env:MONGO_URI" --archive="$backupDir\mongo-dump.gz" --gzip

Write-Host "Backup created: $backupDir\mongo-dump.gz"
```

**Linux/Mac**:
```bash
export MONGO_URI="mongodb://user:pass@host:27017/hafjet"
timestamp=$(date +%Y%m%d_%H%M%S)
backupDir="$HOME/backups/hafjet_$timestamp"
mkdir -p "$backupDir"

mongodump --uri="$MONGO_URI" --archive="$backupDir/mongo-dump.gz" --gzip

echo "Backup created: $backupDir/mongo-dump.gz"
```

### Method 2: Using Docker (No Tools Installation)

```powershell
# Windows with Docker
$env:MONGO_URI = "mongodb://user:pass@host.docker.internal:27017/hafjet"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
New-Item -ItemType Directory -Path "C:\backups" -Force

docker run --rm `
  -v C:\backups:/dump `
  mongo:6.0 `
  bash -lc "mongodump --uri='$env:MONGO_URI' --archive=/dump/hafjet_$timestamp.gz --gzip"
```

```bash
# Linux/Mac with Docker
export MONGO_URI="mongodb://user:pass@localhost:27017/hafjet"
timestamp=$(date +%Y%m%d_%H%M%S)
mkdir -p ~/backups

docker run --rm \
  -v ~/backups:/dump \
  --network host \
  mongo:6.0 \
  bash -lc "mongodump --uri='$MONGO_URI' --archive=/dump/hafjet_$timestamp.gz --gzip"
```

### Method 3: Automated Script

Use the provided backup script:

```powershell
# Windows
.\scripts\backup_restore.sh backup C:\backups\manual

# Linux/Mac
bash ./scripts/backup_restore.sh backup ~/backups/manual
```

### Method 4: Railway Automated Backups

Railway automatically backs up databases. To download:

```bash
railway login
railway project
railway variables --env production
# Note the MONGO_URI

# Download using mongodump with Railway URI
mongodump --uri="<RAILWAY_MONGO_URI>" --archive="railway-backup.gz" --gzip
```

## 🔄 Restore Procedures

### Method 1: Full Database Restore

⚠️ **WARNING**: This will **DROP** all existing data and replace with backup.

```powershell
# Windows
$env:MONGO_URI = "mongodb://user:pass@host:27017/hafjet"
$backupFile = "C:\backups\hafjet_20250112\mongo-dump.gz"

# STOP APPLICATION FIRST
railway service stop

# Restore
mongorestore --uri="$env:MONGO_URI" --archive="$backupFile" --gzip --drop

# Verify
mongo "$env:MONGO_URI" --eval "db.stats()"

# START APPLICATION
railway service start
```

```bash
# Linux/Mac
export MONGO_URI="mongodb://user:pass@host:27017/hafjet"
backupFile="$HOME/backups/hafjet_20250112/mongo-dump.gz"

# STOP APPLICATION FIRST
railway service stop

# Restore
mongorestore --uri="$MONGO_URI" --archive="$backupFile" --gzip --drop

# Verify
mongo "$MONGO_URI" --eval "db.stats()"

# START APPLICATION
railway service start
```

### Method 2: Selective Collection Restore

Restore specific collections only:

```bash
# Extract backup to directory
mongorestore --uri="$MONGO_URI" --gzip --archive="backup.gz" --dir=./temp_restore

# Restore specific collections
mongorestore --uri="$MONGO_URI" --nsInclude="hafjet.invoices" ./temp_restore/hafjet/invoices.bson.gz
mongorestore --uri="$MONGO_URI" --nsInclude="hafjet.users" ./temp_restore/hafjet/users.bson.gz
```

### Method 3: Point-in-Time Restore

If using MongoDB Atlas or replica sets with oplog:

```bash
# Restore to specific timestamp
mongorestore --uri="$MONGO_URI" \
  --oplogReplay \
  --oplogLimit="1704556800:1" \
  --archive="backup.gz" --gzip
```

### Method 4: Using Script

```bash
# Restore using script
bash ./scripts/backup_restore.sh restore ~/backups/manual
```

## ✅ Verification Steps

### 1. Check Database Stats

```javascript
// Connect to MongoDB
use hafjet

// Check collections
show collections

// Count documents
db.invoices.count()
db.users.count()
db.transactions.count()
db.customers.count()

// Check indexes
db.invoices.getIndexes()

// Sample data
db.invoices.findOne()
```

### 2. Application Healthcheck

```bash
curl https://hafjet-cloud-accounting-system-production.up.railway.app/health

# Expected response:
# {"status":"OK","db":"connected","uptime":...}
```

### 3. Functional Tests

- Login with test account
- View dashboard
- Create test invoice
- Generate report
- Search functionality
- Export data

## 📁 Backup Contents

### Database Collections
- `users` - User accounts
- `invoices` - Sales invoices
- `customers` - Customer data
- `products` - Product catalog
- `transactions` - Financial transactions
- `settings` - System settings

### Files to Backup
- Database dump (`.gz` archive)
- Environment variables (`.env` - DO NOT commit to Git)
- Uploaded files (if stored locally)
- SSL certificates
- Configuration files

## 🔐 Security Best Practices

### Encryption
```bash
# Encrypt backup
gpg --symmetric --cipher-algo AES256 backup.gz

# Decrypt backup
gpg --decrypt backup.gz.gpg > backup.gz
```

### Access Control
- Store backups in secure location
- Limit access to authorized personnel only
- Use separate credentials for backup access
- Enable audit logging

### Compliance
- GDPR: Anonymize personal data in backups older than 90 days
- Retention: Keep backups for required legal period
- Documentation: Log all backup/restore operations

## 📊 Backup Schedule

| Type | Frequency | Retention | Location |
|------|-----------|-----------|----------|
| Full Database | Daily 2AM UTC | 30 days | Railway + S3 |
| Incremental | Every 6 hours | 7 days | Railway |
| Pre-Deploy | Before deploy | Until next deploy | Local + S3 |
| Monthly Archive | 1st of month | 1 year | Glacier/Archive |

## 🚨 Disaster Recovery Scenarios

### Scenario 1: Accidental Data Deletion

```bash
# 1. Identify deletion timestamp
# 2. Find backup before deletion
# 3. Restore specific collection
mongorestore --uri="$MONGO_URI" \
  --nsInclude="hafjet.invoices" \
  --drop \
  ./backup/hafjet/invoices.bson.gz
```

### Scenario 2: Database Corruption

```bash
# 1. Stop application
railway service stop

# 2. Export current state (for analysis)
mongodump --uri="$MONGO_URI" --archive="corrupted-state.gz" --gzip

# 3. Restore from last good backup
mongorestore --uri="$MONGO_URI" --archive="last-good-backup.gz" --gzip --drop

# 4. Start application
railway service start
```

### Scenario 3: Complete Infrastructure Failure

```bash
# 1. Provision new Railway project
railway init

# 2. Set up new MongoDB instance
railway add mongodb

# 3. Restore from backup
mongorestore --uri="$NEW_MONGO_URI" --archive="backup.gz" --gzip

# 4. Update environment variables
railway variables set MONGO_URI=$NEW_MONGO_URI

# 5. Deploy application
railway up
```

## 🔗 Automation

### Automated Backup Script (Cron/Task Scheduler)

**Linux Cron**:
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/scripts/backup_restore.sh backup /backups/daily/$(date +\%Y\%m\%d)
```

**Windows Task Scheduler**:
```powershell
# Create scheduled task
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\path\to\backup-script.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At 2am
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "HAFJET Daily Backup"
```

## 📞 Support

For backup/restore issues:
- **Documentation**: This guide
- **Scripts**: `scripts/backup_restore.sh`
- **Railway Support**: support@railway.app
- **Emergency**: See [DEPLOYMENT_ROLLBACK.md](./DEPLOYMENT_ROLLBACK.md)

---

**Remember**: Test your backups regularly! A backup is only good if it can be restored.
