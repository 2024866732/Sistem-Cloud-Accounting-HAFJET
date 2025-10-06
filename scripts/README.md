# Production Automation Scripts

This directory contains critical automation scripts for production deployment, monitoring, and maintenance of HAFJET Cloud Accounting System.

## 🚀 Quick Start

### 1. Generate Production Secrets (FIRST STEP!)

**Windows (PowerShell):**
```powershell
.\scripts\generate-secrets.ps1
```

This generates:
- JWT_SECRET (32 characters) - For authentication tokens
- MONGO_ROOT_PASSWORD (24 characters) - MongoDB admin password
- REDIS_PASSWORD (16 characters) - Redis authentication
- GRAFANA_ADMIN_PASSWORD (16 characters) - Grafana dashboard access

**⚠️ CRITICAL: Backup these secrets to your password manager immediately!**

### 2. Create Production Environment Files

Copy template files and fill in generated secrets:

```powershell
# Backend
Copy-Item backend\.env.production.template backend\.env.production

# Frontend  
Copy-Item frontend\.env.production.template frontend\.env.production

# Root (for docker-compose)
Copy-Item .env.production.template .env.production
```

Then edit each file and:
1. Replace `YOUR_*_PASSWORD` placeholders with generated secrets
2. Update `yourdomain.com` with your actual domain
3. Configure optional services (LHDN, Email, Sentry)

### 3. Validate Configuration

```powershell
.\scripts\validate-env.ps1
```

✓ Must pass validation before deployment!

### 4. Test Backup & Restore (CRITICAL!)

```bash
.\scripts\test-backup-restore.sh
```

This verifies your disaster recovery procedure works.

## 📋 Available Scripts

### Security & Configuration

- **`generate-secrets.ps1`** - Generate cryptographically secure secrets
- **`generate-production-env.ps1`** - Auto-generate .env files with secrets
- **`validate-env.ps1`** / **`validate-env.sh`** - Validate environment before deployment

### Backup & Restore

- **`backup-mongodb.ps1`** / **`backup-mongodb.sh`** - Automated MongoDB backup
- **`test-backup-restore.sh`** - 🔴 CRITICAL: Test backup/restore procedure

### Monitoring

- **`health-check.ps1`** - Monitor application health (backend, frontend, DB, Redis)

### Development Tools

- **`install-python-official.ps1`** - Install Python from python.org
- **`git-push-setup.ps1`** - Setup git push configuration
- **`validate-workflows.py`** - Validate GitHub Actions workflows
- **`verify-lockfile.ps1`** / **`verify-lockfile.sh`** - Verify npm lockfile sync

---

## 📚 Detailed Documentation

For complete usage instructions, see:
- [Production Automation Scripts Guide](SCRIPTS_GUIDE.md) - Full documentation
- [Pre-Deployment Checklist](../docs/PRE_DEPLOYMENT_CHECKLIST.md)
- [Quick Start Deployment](../docs/QUICK_START_DEPLOYMENT.md)

---

## Original Script Documentation


	 refuse to run non-dry installs with -InstallAllUsers unless elevated.
