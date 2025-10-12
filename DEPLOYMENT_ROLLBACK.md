# 🔄 Deployment Rollback Guide - HAFJET Cloud Accounting System

## Overview
This guide provides step-by-step instructions for rolling back deployments when issues occur in production.

**Last Updated**: October 12, 2025  
**Version**: 1.0.0

---

## 🚨 When to Rollback

Rollback immediately if you encounter:
- **Critical bugs** affecting core functionality (invoicing, payments, calculations)
- **Data corruption** or integrity issues
- **Performance degradation** (> 50% slower response times)
- **Security vulnerabilities** discovered post-deployment
- **Failed healthchecks** after deployment
- **Database migration failures** that cannot be fixed forward

---

## 📋 Pre-Rollback Checklist

Before initiating rollback:

1. ✅ **Assess Impact**: Determine severity and affected users
2. ✅ **Notify Team**: Alert stakeholders via Slack/email
3. ✅ **Document Issue**: Create incident report with:
   - Timestamp
   - Symptoms
   - Affected features
   - Error logs
4. ✅ **Verify Backup**: Confirm recent backup exists
5. ✅ **Check Dependencies**: Ensure rollback won't break external integrations

---

## 🔧 Rollback Methods

### Method 1: Railway Platform Rollback (Fastest - 2 minutes)

**Use when**: Code issues, no database changes

#### Steps:
```powershell
# 1. Login to Railway CLI
railway login

# 2. List recent deployments
railway list

# 3. Rollback to previous deployment
railway rollback <deployment-id>

# 4. Verify rollback
railway logs --tail 100
```

**Via Railway Dashboard**:
1. Go to https://railway.app/project/<project-id>
2. Click on service → **Deployments** tab
3. Find last stable deployment (marked green ✅)
4. Click **"..."** → **Redeploy**
5. Monitor logs for successful startup

**Verification**:
```powershell
# Check health endpoint
curl https://hafjet-cloud-accounting-system-production.up.railway.app/health
```

Expected: `{"status":"OK","message":"HAFJET Bukku API is running","db":"connected"}`

---

### Method 2: Git Revert + Redeploy (Medium - 5 minutes)

**Use when**: Need to revert specific commits

#### Steps:
```powershell
# 1. Navigate to repo
cd "C:\Users\PC CUSTOM\OneDrive\Documents\Sistem Kewangan HAFJET Bukku"

# 2. Check recent commits
git log --oneline -10

# 3. Identify bad commit hash
$BAD_COMMIT = "abc1234"

# 4. Revert commit (creates new commit)
git revert $BAD_COMMIT --no-edit

# 5. Push to trigger auto-deploy
git push origin main

# 6. Monitor GitHub Actions
gh run list --limit 5

# 7. Watch Railway deployment
railway logs --tail 100
```

**Verification**:
- GitHub Actions workflow passes ✅
- Railway deployment completes
- Healthcheck returns HTTP 200

---

### Method 3: Database Rollback (Complex - 10-30 minutes)

**Use when**: Database migration caused issues

⚠️ **WARNING**: This involves data restoration. Follow carefully.

#### Prerequisites:
- Recent backup file (`C:\temp\hafjet-backup-<date>.gz`)
- MongoDB connection string (`$env:MONGO_URI`)
- Maintenance mode enabled

#### Steps:

**Step 1: Enable Maintenance Mode**
```powershell
# Put site in maintenance (if implemented)
railway env set MAINTENANCE_MODE=true
```

**Step 2: Verify Backup File**
```powershell
# Check backup exists
Test-Path "C:\temp\hafjet-backup-$(Get-Date -Format 'yyyy-MM-dd').gz"

# If false, use most recent backup
Get-ChildItem C:\temp\hafjet-backup-*.gz | Sort-Object LastWriteTime -Descending | Select-Object -First 1
```

**Step 3: Stop Application (prevents writes during restore)**
```powershell
# Scale down to 0 instances
railway down
```

**Step 4: Restore Database**
```powershell
# Set connection string
$env:MONGO_URI = "mongodb://user:pass@host:27017/hafjet"

# Restore from backup (will DROP current data!)
mongorestore --uri="$env:MONGO_URI" `
  --archive="C:\temp\hafjet-backup-2025-10-12.gz" `
  --gzip `
  --drop `
  --verbose

# Verify restore
mongosh "$env:MONGO_URI" --eval "db.stats()"
```

**Step 5: Restart Application**
```powershell
# Scale back up
railway up

# Watch logs
railway logs --tail 100
```

**Step 6: Verify Data Integrity**
```powershell
# Test API endpoints
curl https://hafjet-production.up.railway.app/api/health
curl https://hafjet-production.up.railway.app/api/invoices?limit=5

# Check sample data in DB
mongosh "$env:MONGO_URI" --eval "db.invoices.findOne()"
```

**Step 7: Disable Maintenance Mode**
```powershell
railway env set MAINTENANCE_MODE=false
```

---

### Method 4: Emergency Full Rollback (Complete - 15-45 minutes)

**Use when**: Multiple failures, need full system restore

#### Steps:

**1. Create Emergency Backup (before rollback)**
```powershell
mongodump --uri="$env:MONGO_URI" --archive="C:\temp\emergency-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss').gz" --gzip
```

**2. Rollback Code**
```powershell
cd "C:\Users\PC CUSTOM\OneDrive\Documents\Sistem Kewangan HAFJET Bukku"

# Find last known good commit
git log --oneline --graph --all -20

# Reset to specific commit (destructive!)
git reset --hard <good-commit-hash>

# Force push (requires admin)
git push origin main --force
```

**3. Rollback Database**
```powershell
# Restore from last known good backup
mongorestore --uri="$env:MONGO_URI" --archive="C:\temp\hafjet-backup-last-good.gz" --gzip --drop
```

**4. Rollback Environment Variables (if changed)**
```powershell
# Via Railway dashboard or CLI
railway env set JWT_SECRET="old_value"
railway env set MONGO_URI="old_connection_string"
```

**5. Trigger Redeploy**
```powershell
railway redeploy
```

**6. Full System Verification**
```powershell
# Run smoke tests
npm run test:integration

# Manual verification
# - Login as test user
# - Create sample invoice
# - Check reports
# - Test Loyverse integration
```

---

## 🔍 Post-Rollback Verification

After any rollback, verify:

### Health Checks
```powershell
# API Health
curl https://hafjet-production.up.railway.app/health

# Expected: {"status":"OK","db":"connected","uptimeSeconds":123}
```

### Functional Tests
- ✅ User login works
- ✅ Dashboard loads
- ✅ Can create invoice
- ✅ Reports generate
- ✅ Loyverse sync works (if applicable)

### Database Integrity
```powershell
mongosh "$env:MONGO_URI" --eval "
  print('Companies:', db.companies.countDocuments());
  print('Invoices:', db.invoices.countDocuments());
  print('Users:', db.users.countDocuments());
"
```

### Performance Metrics
- Response time < 500ms
- Database queries < 100ms
- Memory usage normal
- CPU usage < 70%

---

## 📝 Rollback Decision Tree

```
Issue Detected
├─ Code Bug Only?
│  ├─ YES → Method 1: Railway Rollback (2 min)
│  └─ NO → Continue
│
├─ Database Migration Failed?
│  ├─ YES → Method 3: Database Rollback (15 min)
│  └─ NO → Continue
│
├─ Multiple System Failures?
│  ├─ YES → Method 4: Emergency Full Rollback (30 min)
│  └─ NO → Method 2: Git Revert + Redeploy (5 min)
```

---

## 🚫 Common Rollback Mistakes

**DON'T**:
- ❌ Rollback without backup
- ❌ Skip maintenance mode for DB rollback
- ❌ Force push without team notification
- ❌ Rollback during peak hours (unless critical)
- ❌ Forget to verify after rollback

**DO**:
- ✅ Create emergency backup before rollback
- ✅ Notify team immediately
- ✅ Document all steps taken
- ✅ Verify system after rollback
- ✅ Schedule post-mortem meeting

---

## 📞 Emergency Contacts

**Critical Issues**:
- **On-Call Engineer**: [Phone/Slack]
- **Database Admin**: [Contact]
- **DevOps Lead**: [Contact]

**Escalation Path**:
1. On-call engineer (respond: 15 min)
2. Team lead (respond: 30 min)
3. CTO (respond: 1 hour)

---

## 📊 Rollback Metrics

Track rollback incidents:
- **Rollback Frequency**: < 1 per month (target)
- **Mean Time to Rollback (MTTR)**: < 10 minutes
- **Success Rate**: > 95%
- **Data Loss**: Zero tolerance

---

## 🔗 Related Documentation

- [BACKUP_RESTORE_GUIDE.md](./BACKUP_RESTORE_GUIDE.md) - Detailed backup/restore procedures
- [DEPLOYMENT_FINAL_SUCCESS.md](./DEPLOYMENT_FINAL_SUCCESS.md) - Deployment status
- [CITROUBLESHOOTING.md](./CITROUBLESHOOTING.md) - CI/CD troubleshooting

---

## 📅 Rollback Log Template

After each rollback, log in incident tracker:

```markdown
## Rollback Incident #<number>

**Date/Time**: YYYY-MM-DD HH:MM UTC+8
**Severity**: Critical | High | Medium
**Triggered By**: [Name]
**Method Used**: Method 1/2/3/4
**Duration**: <minutes>
**Data Loss**: Yes/No

**Root Cause**: 
[Brief description]

**Actions Taken**:
1. [Step 1]
2. [Step 2]
...

**Verification**:
- [ ] Healthcheck passed
- [ ] Functional tests passed
- [ ] Performance normal

**Follow-up**:
- [ ] Post-mortem scheduled
- [ ] Fix deployed
- [ ] Documentation updated
```

---

**Remember**: Rollback is a safety mechanism, not a failure. Every rollback is a learning opportunity to improve our deployment process.

**Status**: ✅ Ready for Use  
**Maintained By**: DevOps Team  
**Review Schedule**: Quarterly
