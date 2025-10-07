# 🚀 Railway Deployment - Quick Setup Guide

**HAFJET Cloud Accounting System - Malaysian Compliance**

## 📋 Prerequisites Completed ✅

- ✅ Railway CLI installed and authenticated
- ✅ Railway project linked: "HAFJET CLOUD ACCOUNTING SYSTEM"
- ✅ JWT secret generated (32 chars): `s2NisC7nkyXRvjojNErAz22n7TlhUyIa`
- ✅ GitHub Actions workflow configured
- ✅ Docker images ready to build
- ✅ Malaysian compliance defaults configured

---

## 🎯 QUICK START (3 Simple Steps)

### STEP 1: Add Databases in Railway Dashboard 🗄️

**Railway Dashboard is now open in your browser!**

#### Add MongoDB:
1. Click **"New"** button (top right)
2. Select **"Database"** → **"MongoDB"**
3. Railway will automatically create MongoDB service
4. Click on MongoDB service
5. Go to **"Variables"** tab
6. Copy the **`MONGO_URL`** value

#### Add Redis:
1. Click **"New"** button again
2. Select **"Database"** → **"Redis"**
3. Railway will automatically create Redis service
4. Click on Redis service
5. Go to **"Variables"** tab
6. Copy the **`REDIS_URL`** value

---

### STEP 2: Set Environment Variables 🔧

**Option A: Automatic (Recommended)**
```powershell
# Run the helper script (will prompt for MongoDB and Redis URLs)
.\scripts\set-railway-variables.ps1
```

**Option B: Manual in Railway Dashboard**

Go to **Backend Service** → **Variables** tab and add:

```env
# Application
NODE_ENV=production
PORT=3000

# Malaysian Compliance
SST_RATE=0.06
GST_RATE=0.06
CURRENCY=MYR
TIMEZONE=Asia/Kuala_Lumpur
LOCALE=ms-MY
DATE_FORMAT=DD/MM/YYYY
FISCAL_YEAR_START=01-01

# Authentication
JWT_SECRET=s2NisC7nkyXRvjojNErAz22n7TlhUyIa
JWT_EXPIRE=7d

# Databases (copy from Step 1)
MONGO_URI=<paste MONGO_URL from MongoDB service>
REDIS_URL=<paste REDIS_URL from Redis service>
```

---

### STEP 3: Deploy! 🚀

**Option A: Railway CLI (Direct Deploy)**
```powershell
railway up
```

**Option B: GitHub Actions (Automated Pipeline)**
```powershell
gh workflow run deploy-railway.yml
```

**Option C: One-Command Pipeline**
```powershell
.\scripts\deploy-now.ps1 -SkipSetup
```

---

## 🔍 Verify Deployment

### Check Status:
```powershell
# Railway status
railway status

# View logs
railway logs

# View backend logs specifically
railway logs --service backend

# GitHub Actions (if using GH deploy)
gh run list --workflow deploy-railway.yml --limit 3
```

### Health Check:
```powershell
# Automatic health check script
.\scripts\check-deployment.ps1

# Or manual check
railway open
```

---

## 📊 Malaysian Compliance Features Configured

| Feature | Value | Description |
|---------|-------|-------------|
| **SST Rate** | 6% | Sales & Service Tax |
| **GST Rate** | 6% | Historical GST data support |
| **Currency** | MYR | Malaysian Ringgit |
| **Timezone** | Asia/Kuala_Lumpur | KL timezone |
| **Locale** | ms-MY | Malaysian locale |
| **Date Format** | DD/MM/YYYY | Malaysian format |
| **Fiscal Year** | 01-01 | January start |

---

## 🛠️ Troubleshooting

### Database Connection Issues:
```powershell
# Verify MongoDB URI format
railway variables | Select-String "MONGO_URI"

# Check Redis connection
railway variables | Select-String "REDIS_URL"
```

### Deployment Failures:
```powershell
# Check Railway service logs
railway logs --service backend --tail 100

# Check GitHub Actions logs
gh run view --log-failed
```

### JWT Secret Issues:
```powershell
# Re-read JWT secret from backup
Get-Content .jwt-secret-backup

# Regenerate if needed
.\scripts\setup-railway-safe.ps1
```

---

## 📁 Available Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| **Setup Railway** | `.\scripts\setup-railway-safe.ps1` | Initialize Railway with Malaysian defaults |
| **Set Variables** | `.\scripts\set-railway-variables.ps1` | Set environment variables |
| **Deploy** | `.\scripts\deploy-now.ps1` | One-command deployment pipeline |
| **Health Check** | `.\scripts\check-deployment.ps1` | Verify deployment health |
| **Fix Vulnerabilities** | `.\scripts\fix-vulnerabilities.ps1` | Run npm audit fix |

---

## 🎉 What Happens After Deployment?

1. **Backend API** will be available at Railway-provided URL
2. **Frontend** will be available at Railway-provided URL
3. **MongoDB** will be connected and ready
4. **Redis** will be connected for caching/sessions
5. **Health endpoint** available at `/api/health`
6. **Malaysian features** (SST, MYR, timezone) will be active

---

## 🔗 Important Links

- **Railway Dashboard**: https://railway.app/project
- **GitHub Repository**: https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET
- **GitHub Actions**: https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/actions
- **Documentation**: `docs/DEPLOYMENT_GUIDE.md`

---

## 📞 Next Steps After Successful Deployment

1. ✅ Test login functionality
2. ✅ Verify SST calculations (6%)
3. ✅ Check MYR currency formatting
4. ✅ Test invoice generation
5. ✅ Verify timezone (Asia/Kuala_Lumpur)
6. ✅ Test database operations
7. ✅ Check Redis caching

---

**Status**: Ready for deployment! 🚀
**JWT Secret**: `s2NisC7nkyXRvjojNErAz22n7TlhUyIa`
**Date**: October 7, 2025
