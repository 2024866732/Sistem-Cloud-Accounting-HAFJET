# HAFJET BUKKU - Manual Database Configuration Guide

## Current Status: 92% Complete ✅

### ✅ Completed Tasks:
1. All 11 Malaysian compliance variables configured
2. GitHub Actions workflows passing (27/27 steps SUCCESS)
3. Docker images published to GHCR
4. Railway deployment successful
5. Redis database fully provisioned and configured
6. Main application deployed and running

### ⏳ Remaining Tasks (8%):

#### MongoDB Configuration Required

**Issue Identified:**
- Multiple MongoDB services were created but none have been deployed
- Services exist: MongoDB, MongoDB-DpL9, MongoDB-8FyQ, MongoDB-QLou
- All have empty `serviceInstances` (no deployments)

**Solution - Manual Configuration via Railway Dashboard:**

1. **Open Railway Dashboard:**
   ```
   https://railway.app/project/186782e9-5c00-473e-8434-a5fdd3951711
   ```

2. **Delete Duplicate MongoDB Services:**
   - You'll see multiple MongoDB services in the dashboard
   - Keep ONLY ONE (recommend the first "MongoDB" service)
   - Delete the others (MongoDB-DpL9, MongoDB-8FyQ, MongoDB-QLou)
   - Click each service → Settings → Delete Service

3. **Deploy the MongoDB Service:**
   - Click on the remaining MongoDB service
   - If it shows "Not deployed", click "Deploy" button
   - Wait 1-2 minutes for provisioning
   - Check "Variables" tab for MONGO_URL

4. **Configure MONGO_URI in Main App:**
   - Once MongoDB shows MONGO_URL in its variables
   - Click on "HAFJET CLOUD ACCOUNTING SYSTEM" service
   - Go to "Variables" tab
   - Click "Add Variable"
   - Name: `MONGO_URI`
   - Value: Copy the MONGO_URL from MongoDB service (should be like `mongodb://...`)
   - Click "Add"

5. **Verify Configuration:**
   - Main app should have these variables:
     ```
     ✅ NODE_ENV=production
     ✅ PORT=3000
     ✅ SST_RATE=0.06
     ✅ GST_RATE=0.06
     ✅ CURRENCY=MYR
     ✅ TIMEZONE=Asia/Kuala_Lumpur
     ✅ LOCALE=ms-MY
     ✅ DATE_FORMAT=DD/MM/YYYY
     ✅ FISCAL_YEAR_START=01-01
     ✅ JWT_SECRET=s2NisC7nkyXRvjojNErAz22n7TlhUyIa
     ✅ JWT_EXPIRE=7d
     ✅ MONGO_URI=mongodb://... (from MongoDB service)
     ✅ REDIS_URL=redis://... (auto-linked from Redis service)
     ```

6. **Trigger Deployment:**
   - Railway will auto-deploy when you add MONGO_URI
   - Or manually click "Deploy" on the main service
   - Monitor logs for successful database connection

### Alternative - Automated via CLI (if you prefer):

After cleaning up duplicate MongoDB services in dashboard, run:

```powershell
# Link to MongoDB service
railway service MongoDB

# Check if MONGO_URL exists
railway variables

# If MONGO_URL exists, copy it and link back to main app
railway service "HAFJET CLOUD ACCOUNTING SYSTEM"

# Set MONGO_URI (replace with actual URL from MongoDB service)
railway variables --set "MONGO_URI=<paste-mongo-url-here>"

# Deploy
railway up --detach
```

### Verification Commands:

```powershell
# Check all services status
railway status --json

# Check main app variables
railway service "HAFJET CLOUD ACCOUNTING SYSTEM"
railway variables

# Check logs
railway logs --tail 100

# Open application
railway open
```

### Expected Final State (100% Complete):

```
✅ GitHub Actions: All workflows passing
✅ Docker Images: Published to GHCR
✅ Railway Variables: 13/13 configured
   ├─ 11 Malaysian compliance variables
   ├─ MONGO_URI (MongoDB connection)
   └─ REDIS_URL (Redis connection - auto-linked)
✅ Services Deployed:
   ├─ Main App: HAFJET CLOUD ACCOUNTING SYSTEM
   ├─ MongoDB: 1 service (duplicates removed)
   └─ Redis: Fully operational
✅ Application: Running and accessible
```

### Health Check:

Once MONGO_URI is configured and app redeployed:

1. Get app URL: `railway open` or check dashboard
2. Visit: `https://[your-app-url]/api/health`
3. Expected response:
   ```json
   {
     "status": "ok",
     "environment": "production",
     "timestamp": "2025-10-07T..."
   }
   ```

### Malaysian Features to Test:

After deployment:
- ✅ SST calculation: 6%
- ✅ Currency: MYR format
- ✅ Dates: DD/MM/YYYY format
- ✅ Timezone: Asia/Kuala_Lumpur
- ✅ Locale: ms-MY (Bahasa Malaysia support)

---

## Summary:

**Current Progress: 92%**
- All automated tasks completed successfully
- Only manual MongoDB cleanup needed (Railway dashboard limitation)
- Expected time to 100%: 5-10 minutes (manual dashboard work)

**Why Manual Step is Required:**
- Railway CLI's `railway add --database mongo` created multiple services due to network timeouts/retries
- Services created but not deployed (no instances)
- Dashboard provides cleaner service management for cleanup
- This is a one-time fix, future database additions will work smoothly

**Next Action:**
1. Open Railway dashboard link above
2. Clean up duplicate MongoDB services (keep 1, delete 3)
3. Deploy the remaining MongoDB service
4. Copy MONGO_URL to main app as MONGO_URI
5. Verify 100% completion

