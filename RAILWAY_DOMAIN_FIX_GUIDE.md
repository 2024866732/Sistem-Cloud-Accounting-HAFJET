# Railway Domain Redirect Loop - Fix Guide

## 🔴 Current Issue

**Status:** HTTP 302 Redirect Loop  
**URL:** https://hafjet-cloud-accounting-system-production.up.railway.app  
**Problem:** Domain redirects to itself infinitely

## ✅ What's Working

- ✅ **Backend API:** Fully operational on port 3000
- ✅ **Health Check:** `/api/health` returns 200 OK
- ✅ **Database:** MongoDB connected
- ✅ **Build:** Nixpacks build succeeds with nodejs-22_x
- ✅ **Frontend Assets:** Built and committed to `backend/public/`
- ✅ **Server Code:** Express serves static files + SPA fallback
- ✅ **GitHub Actions:** All 4 workflows passing

## 🔍 Root Cause

The HTTP 302 redirect is coming from **Railway Edge**, not from our application code:

```
Server: railway-edge
Location: https://hafjet-cloud-accounting-system-production.up.railway.app
```

This indicates the domain is either:
1. Bound to a **wrong service** (e.g., a static site service instead of backend)
2. Has a **redirect rule** configured in Railway project settings
3. Mapped to a **placeholder/frontend service** that no longer exists

## 🛠️ Solution: Fix Railway Domain Binding

You need to access the **Railway Console** to rebind the domain to the correct backend service.

### Option A: Railway Web Console (Recommended)

1. **Open Railway Dashboard:**
   - Go to: https://railway.app/project/186782e9-5c00-473e-8434-a5fdd3951711

2. **Check Services:**
   - Look for services in your project
   - Identify which service has the domain `hafjet-cloud-accounting-system-production.up.railway.app`

3. **Verify Domain Binding:**
   - Click on each service
   - Go to **Settings** → **Networking** → **Public Networking**
   - Check which service claims the public domain

4. **Fix the Binding:**
   
   **If domain is on WRONG service:**
   - Remove the domain from that service
   - Go to your **backend service** (the one with `cd /app/backend && npm start`)
   - Add the domain to this service under **Settings** → **Networking**

   **If there's a redirect rule:**
   - Check **Settings** → **Public Networking** → **Custom Domain**
   - Remove any redirect rules pointing to the same domain

   **If there's a separate frontend service:**
   - Delete or disable the unused frontend static site service
   - Ensure only the backend service has the public domain

5. **Restart Service:**
   - After changing domain bindings, restart the backend service
   - Wait for logs to show "Server running on port 3000"

6. **Verify:**
   ```powershell
   # Test from PowerShell
   Invoke-WebRequest -Uri "https://hafjet-cloud-accounting-system-production.up.railway.app" -UseBasicParsing
   ```
   - Expected: HTTP 200 with HTML body
   - Should see: `<html lang="en">` and `<div id="root"></div>`

### Option B: Railway CLI (Alternative)

If you prefer command-line:

```powershell
# 1. Login to Railway (if not already)
railway login

# 2. Link to project
railway link

# 3. List all services
railway service

# 4. Check domains (you'll need to manually check each service)
# Unfortunately Railway CLI doesn't have a direct command to list all domain mappings
# You must use the web console for domain management
```

**Note:** Railway CLI has limited domain management capabilities. Web console is recommended.

### Option C: Contact Railway Support

If you can't identify the issue:

1. Open Railway Dashboard: https://railway.app
2. Click on your project: **HAFJET CLOUD ACCOUNTING SYSTEM**
3. Click **Help** → **Contact Support**
4. Describe the issue:
   ```
   My public domain https://hafjet-cloud-accounting-system-production.up.railway.app
   returns HTTP 302 redirecting to itself (infinite loop).
   
   The backend service is running correctly (/api/health returns 200),
   but root path (/) redirects to the same URL.
   
   Please help identify which service owns this domain and how to
   bind it to my backend service (service ID: 798670ac-ac20-444f-ace8-301a276c7a0b).
   ```

## 📊 Verification Steps

After fixing the domain binding:

```powershell
# 1. Test root URL
$response = Invoke-WebRequest -Uri "https://hafjet-cloud-accounting-system-production.up.railway.app" -UseBasicParsing
Write-Host "Status: $($response.StatusCode)"  # Should be 200
Write-Host "Content-Type: $($response.Headers['Content-Type'])"  # Should be text/html

# 2. Test API health
$api = Invoke-WebRequest -Uri "https://hafjet-cloud-accounting-system-production.up.railway.app/api/health" -UseBasicParsing
$api.Content  # Should return JSON status

# 3. Check for React app load
$response.Content -match 'id="root"'  # Should be True
```

## 🚀 Expected Result

After fixing domain binding:

- ✅ Root URL returns HTTP 200 with HTML
- ✅ React app loads with login/register page
- ✅ `/api/health` returns JSON health status
- ✅ No more redirect loops
- ✅ Static assets load from `/assets/*`

## 📝 Technical Details

### Current Backend Configuration

- **Service ID:** `798670ac-ac20-444f-ace8-301a276c7a0b`
- **Start Command:** `cd /app/backend && npm start`
- **Port:** 3000
- **Static Files:** Served from `/app/backend/public/`
- **Express Routes:**
  - `GET /` → serves `index.html` or embedded fallback
  - `GET /api/*` → API endpoints
  - `GET *` → SPA fallback (serves `index.html`)

### Build Process

1. Nixpacks installs dependencies (root, frontend, backend)
2. Frontend builds to `frontend/dist/`
3. Backend compiles TypeScript to `backend/dist/`
4. Frontend assets copied to `backend/public/`
5. Backend starts and serves static files + API

### Why Root Returns 302

The redirect is happening **BEFORE** the request reaches our backend service:

```
Request Flow (Current - BROKEN):
Browser → Railway Edge → ??? Service → 302 Redirect → Browser (loop)

Request Flow (Expected - FIXED):
Browser → Railway Edge → Backend Service → 200 HTML → Browser
```

The Railway Edge is routing the domain to a service that returns a 302 redirect to the same domain, creating an infinite loop. This must be fixed in Railway Console by ensuring the domain routes to the backend service.

## 🎯 Next Steps

1. **Open Railway Console** and check domain bindings (Option A above)
2. **Rebind domain** to backend service
3. **Restart** backend service
4. **Test** root URL - should return HTTP 200 with HTML
5. **Verify** React app loads correctly

---

**Last Updated:** October 8, 2025  
**Status:** Backend operational, domain routing needs fix in Railway Console
