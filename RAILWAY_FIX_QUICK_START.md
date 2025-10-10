# 🚀 Quick Setup Guide - Fix Railway Deployment

## ⚡ TL;DR - What You Need to Do

Your Railway deployment is now fixed! The workflow no longer requires `RAILWAY_SERVICE` secret. Here's what to do:

### 1️⃣ Verify RAILWAY_TOKEN Secret (Required)

Check if you have this secret set:
```bash
gh secret list | grep RAILWAY_TOKEN
```

If not found, get your Railway token:
1. Go to https://railway.app
2. Open your project
3. Click **Settings** → **Tokens** → **Create Service Token**
4. Copy the token and add it:

```bash
gh secret set RAILWAY_TOKEN --body "your-token-here"
```

### 2️⃣ (Optional) Add RAILWAY_PROJECT Secret

This helps Railway CLI know which project to deploy to:

```bash
# Find your project ID from Railway dashboard URL:
# https://railway.app/project/YOUR-PROJECT-ID-HERE

gh secret set RAILWAY_PROJECT --body "your-project-id"
```

### 3️⃣ (Optional) Add RAILWAY_BACKEND_URL Secret

After your first successful deployment, get the URL from Railway and add it:

```bash
gh secret set RAILWAY_BACKEND_URL --body "https://your-app.railway.app"
```

### 4️⃣ Test the Deployment

Push to main branch or trigger manually:

```bash
# Option 1: Push a change
git commit --allow-empty -m "test: trigger Railway deployment"
git push

# Option 2: Trigger manually from GitHub
# Go to: Actions → CI/CD Deploy to Railway → Run workflow
```

## 📊 What Changed

### Before ❌
```yaml
# Required RAILWAY_SERVICE secret
railway up --service "$RAILWAY_SERVICE"
```
- ❌ Required exact service name
- ❌ Failed if service name was wrong
- ❌ Hard to configure

### After ✅
```yaml
# Auto-detects service from project
railway up --detach
```
- ✅ No service name needed
- ✅ Auto-detects from railway.json
- ✅ Multiple fallback methods
- ✅ Better error messages

## 🔍 Verify Your Configuration

### Check Required Files Exist

```bash
# These files configure Railway deployment
ls -la railway.json nixpacks.toml

# Should output:
# railway.json    ✅
# nixpacks.toml   ✅
```

### Check GitHub Secrets

```bash
gh secret list

# Should show at least:
# RAILWAY_TOKEN   ✅

# Optionally:
# RAILWAY_PROJECT ⚠️ (recommended)
# RAILWAY_BACKEND_URL ⚠️ (for health checks)
```

## 🎯 Expected Results

### Successful Deployment
```
🚀 Starting Railway deployment...
✅ Deployment succeeded using 'railway up --detach'
✅ Deployment Complete
```

### Optional Health Check (if RAILWAY_BACKEND_URL is set)
```
🏥 Running health checks against: https://your-app.railway.app/api/health
✅ Health check passed!
```

## ❓ Troubleshooting

### Issue: Still getting "Service not found"

**This should not happen anymore!** But if it does:

1. Verify RAILWAY_TOKEN is valid:
   ```bash
   # Test locally
   railway login
   railway status
   ```

2. Check if railway.json exists:
   ```bash
   cat railway.json
   ```

3. Try linking project manually:
   ```bash
   railway link YOUR-PROJECT-ID
   ```

### Issue: Deployment succeeds but app doesn't work

1. Check Railway logs:
   ```bash
   railway logs --tail 100
   ```

2. Verify environment variables in Railway dashboard:
   - Go to your Railway project
   - Click on your service
   - Check Variables tab

3. Check if the health endpoint works:
   ```bash
   curl https://your-app.railway.app/api/health
   ```

### Issue: Health check fails

**This is OK!** Health check is optional. Your deployment can still be successful.

To enable health checks:
1. Get your backend URL from Railway dashboard
2. Add it as a GitHub secret:
   ```bash
   gh secret set RAILWAY_BACKEND_URL --body "https://your-app.railway.app"
   ```

## 📚 More Information

- **Detailed Guide**: See `RAILWAY_DEPLOYMENT_FIX.md`
- **Workflow File**: `.github/workflows/deploy.yml`
- **Railway Config**: `railway.json` and `nixpacks.toml`

## ✅ Success Checklist

- [ ] RAILWAY_TOKEN secret is set in GitHub
- [ ] (Optional) RAILWAY_PROJECT secret is set
- [ ] (Optional) RAILWAY_BACKEND_URL secret is set
- [ ] railway.json exists in project root
- [ ] nixpacks.toml exists in project root
- [ ] Push to main triggers deployment
- [ ] Deployment succeeds without errors
- [ ] App is accessible at Railway URL

## 🆘 Need Help?

1. Check the workflow logs in GitHub Actions
2. Check Railway dashboard for deployment status
3. Review `RAILWAY_DEPLOYMENT_FIX.md` for detailed troubleshooting
4. Open an issue with:
   - Workflow run URL
   - Error message
   - Railway project URL (if public)

---

**Next Steps:**
1. ✅ Verify RAILWAY_TOKEN is set
2. ✅ Push to main or trigger workflow manually
3. ✅ Monitor deployment in GitHub Actions
4. ✅ Check Railway dashboard for service status
5. ✅ Test your app at the Railway URL

**That's it! Your Railway deployment should now work automatically on every push to main.** 🎉
