# 🔧 Railway API Configuration Fix Guide

**Status**: ⚠️ GraphQL query needs adjustment to match actual Railway service names

## 🔍 Current Situation

### Railway Project Structure (Discovered):
```
Project: HAFJET CLOUD ACCOUNTING SYSTEM
├── Project ID: 186782e9-5c00-473e-8434-a5fdd3951711
├── Environment: production (367eca5d-dc4d-4158-8bdf-97814870258a)
└── Services:
    ├── HAFJET CLOUD ACCOUNTING SYSTEM (Backend/Main App)
    │   ├── Service ID: 798670ac-ac20-444f-ace8-301a276c7a0b
    │   └── Domain: hafjet-cloud-accounting-system-production.up.railway.app
    ├── Redis
    │   └── Internal: redis.railway.internal:6379
    └── MongoDB
        └── Internal: mongodb-qfuq.railway.internal:27017
```

### Problem:
**Workflow GraphQL query** in `.github/workflows/auto-update-railway-urls.yml` searches for services with:
```bash
select(.node.name | contains("backend") or contains("api"))
select(.node.name | contains("frontend") or contains("web"))
```

**But actual service name is**: `"HAFJET CLOUD ACCOUNTING SYSTEM"` ❌

This causes:
- Railway API returns null/empty results
- Workflow falls back to placeholder domains
- Secrets updated with: `backend-not-found.railway.app` ⚠️

## ✅ Solution Options

### **Option 1: Update GraphQL Query Filters (Recommended)**

Edit `.github/workflows/auto-update-railway-urls.yml` line ~65-68:

**BEFORE:**
```bash
BACKEND_DOMAIN=$(echo "$RESPONSE" | jq -r '.data.me.projects.edges[0].node.services.edges[] | 
  select(.node.name | contains("backend") or contains("api")) | 
  .node.domains.serviceDomains[0].domain' | head -n1)

FRONTEND_DOMAIN=$(echo "$RESPONSE" | jq -r '.data.me.projects.edges[0].node.services.edges[] | 
  select(.node.name | contains("frontend") or contains("web")) | 
  .node.domains.serviceDomains[0].domain' | head -n1)
```

**AFTER:**
```bash
# Match actual Railway service name (case-insensitive)
BACKEND_DOMAIN=$(echo "$RESPONSE" | jq -r '.data.me.projects.edges[0].node.services.edges[] | 
  select(.node.name | test("HAFJET|CLOUD|ACCOUNTING"; "i")) | 
  .node.domains.serviceDomains[0].domain' | head -n1)

# If you have separate frontend service, adjust accordingly
FRONTEND_DOMAIN=$(echo "$RESPONSE" | jq -r '.data.me.projects.edges[0].node.services.edges[] | 
  select(.node.name | test("frontend|web"; "i")) | 
  .node.domains.serviceDomains[0].domain' | head -n1)

# Or use same domain for both (since HAFJET serves both backend + frontend)
FRONTEND_DOMAIN=${BACKEND_DOMAIN}
```

### **Option 2: Rename Railway Services**

In Railway Dashboard:
1. Go to Project Settings → Service Settings
2. Rename service to include "backend" or "api" in name
3. Example: `HAFJET Backend API` or `hafjet-api-backend`
4. No code changes needed ✅

### **Option 3: Use Railway CLI Instead of GraphQL**

Replace GraphQL query with Railway CLI commands:

```bash
# Get domain using Railway CLI (requires RAILWAY_TOKEN)
export RAILWAY_TOKEN=${{ secrets.RAILWAY_TOKEN }}
railway link --project 186782e9-5c00-473e-8434-a5fdd3951711
railway service --service 798670ac-ac20-444f-ace8-301a276c7a0b

BACKEND_DOMAIN=$(railway domain | grep -oP 'https://\K[^/]+' | head -n1)
```

## 🚀 Step-by-Step Fix Implementation

### Step 1: Verify Railway Token Permissions

```powershell
# Check current auth
railway whoami

# List projects
railway list

# Link to project
railway link

# Check domain
railway domain
```

**Output should show**:
```
✅ Logged in as MUHAMMAD SYAHRUL HAFIZI ZAINAL
✅ Project: HAFJET CLOUD ACCOUNTING SYSTEM
✅ Domain: https://hafjet-cloud-accounting-system-production.up.railway.app
```

### Step 2: Test Railway GraphQL API

Create test script `test-railway-api.sh`:

```bash
#!/bin/bash

RAILWAY_TOKEN="<your-token-here>"
RAILWAY_API="https://backboard.railway.app/graphql/v2"

QUERY='{"query":"query { me { projects { edges { node { id name services { edges { node { id name domains { serviceDomains { domain } } } } } } } } } }"}'

curl -s -X POST "$RAILWAY_API" \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$QUERY" | jq '.'
```

**Expected Output:**
```json
{
  "data": {
    "me": {
      "projects": {
        "edges": [{
          "node": {
            "name": "HAFJET CLOUD ACCOUNTING SYSTEM",
            "services": {
              "edges": [{
                "node": {
                  "name": "HAFJET CLOUD ACCOUNTING SYSTEM",
                  "domains": {
                    "serviceDomains": [{
                      "domain": "hafjet-cloud-accounting-system-production.up.railway.app"
                    }]
                  }
                }
              }]
            }
          }
        }]
      }
    }
  }
}
```

### Step 3: Update GitHub Secret (If Needed)

If `RAILWAY_TOKEN` doesn't have permissions:

1. **Get New Token from Railway**:
   ```
   https://railway.app/account/tokens
   Click "Create New Token"
   Name: "GitHub Actions Auto-Update"
   Scope: Read access to projects
   ```

2. **Update GitHub Secret**:
   ```powershell
   gh secret set RAILWAY_TOKEN --body "<new-token-here>"
   ```

### Step 4: Update Workflow File

```powershell
# Navigate to workflow file
code .github\workflows\auto-update-railway-urls.yml

# Make changes as per Option 1 above
# Save and commit
git add .github\workflows\auto-update-railway-urls.yml
git commit -m "fix(ci): update Railway GraphQL filters to match actual service names"
git push origin main
```

### Step 5: Test Manually

```powershell
# Trigger workflow manually
gh workflow run auto-update-railway-urls.yml --ref main

# Wait and check logs
Start-Sleep -Seconds 30
gh run list --workflow="auto-update-railway-urls.yml" --limit 1

# View detailed logs
gh run view --log
```

### Step 6: Verify Secrets Updated

```powershell
# Check that secrets were updated (you won't see values, just confirmation)
# Method 1: Check workflow logs for "Updated secret" messages
gh run view --log | Select-String "Updated secret"

# Method 2: Trigger another workflow that uses the secrets
gh workflow run release.yml
```

### Step 7: Test Healthcheck

```powershell
# Test backend health endpoint
$domain = "hafjet-cloud-accounting-system-production.up.railway.app"
Invoke-WebRequest -Uri "https://$domain/api/health" -Method GET

# Expected: HTTP 200 OK
```

## 📋 Verification Checklist

- [ ] Railway CLI authenticated (`railway whoami`)
- [ ] Project linked (`railway status`)
- [ ] Domain accessible (`railway domain`)
- [ ] GraphQL query tested manually (returns real domains)
- [ ] Workflow file updated with correct filters
- [ ] Changes committed and pushed to main
- [ ] Workflow triggered and completed successfully
- [ ] GitHub secrets updated with real domains (not placeholders)
- [ ] Healthcheck endpoint returns 200 OK
- [ ] End-to-end automation working

## 🎯 Expected Final Result

After fix:
```
✅ RAILWAY_SERVICE = "HAFJET CLOUD ACCOUNTING SYSTEM"
✅ RAILWAY_BACKEND_URL = "https://hafjet-cloud-accounting-system-production.up.railway.app"
✅ RAILWAY_FRONTEND_URL = "https://hafjet-cloud-accounting-system-production.up.railway.app"
✅ Healthcheck: HTTP 200 OK
```

## 🔗 Useful Commands

```powershell
# Railway CLI
railway login
railway list
railway link
railway status
railway domain
railway variables
railway logs

# GitHub CLI
gh workflow list
gh workflow run <workflow-name>
gh run list --workflow=<workflow-name>
gh run view <run-id> --log
gh secret list
gh secret set <NAME> --body "<value>"

# Test API
curl -X GET https://hafjet-cloud-accounting-system-production.up.railway.app/api/health
Invoke-WebRequest -Uri "https://hafjet-cloud-accounting-system-production.up.railway.app/api/health"
```

## 📚 References

- [Railway GraphQL API Docs](https://docs.railway.app/reference/public-api)
- [Railway CLI Documentation](https://docs.railway.app/develop/cli)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

**Next Steps**: Choose Option 1 (Update GraphQL Query) and proceed with Step 4-7 above.
