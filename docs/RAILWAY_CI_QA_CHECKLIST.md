# Railway CI/CD Deployment - QA Checklist ✅

## Pre-Deployment Checklist

Checklist ini mestilah dipenuhi **SEBELUM** push ke Git untuk memastikan workflow CI/CD berjalan dengan lancar dan deployment ke Railway berjaya.

---

## 1. ✅ GitHub Secrets Configuration

Pastikan semua secrets diperlukan telah ditetapkan dalam GitHub repository settings:

```
Repository → Settings → Secrets and variables → Actions
```

### Required Secrets:

- [ ] `RAILWAY_TOKEN` - Railway authentication token
  - Cara dapat: `railway login` → `railway tokens`
  - Format: `railway_xxxxxxxxxxxxxxxxxxxxx`

- [ ] `RAILWAY_PROJECT` - Railway project ID
  - Cara dapat: `railway status` atau Railway dashboard URL
  - Format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### Verify Secrets (PowerShell):
```powershell
gh secret list
```

### Verify Secrets (Bash):
```bash
gh secret list | grep -E "RAILWAY_TOKEN|RAILWAY_PROJECT"
```

---

## 2. ✅ Workflow YAML Syntax Validation

Sebelum commit, pastikan semua workflow YAML files valid:

### Manual Check:
```powershell
# Install yamllint jika belum ada
pip install yamllint

# Validate all workflow files
yamllint .github/workflows/*.yml
```

### Key Syntax Rules:

- [ ] **NO inline comments after `run:` or after scalar values**
  ```yaml
  # ❌ SALAH
  run: echo "test"  # This breaks parsing
  
  # ✅ BETUL
  # This is a comment
  run: echo "test"
  ```

- [ ] **Proper indentation (2 spaces, consistent)**
  ```yaml
  # ✅ BETUL
  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - name: Test
  ```

- [ ] **Valid `if:` expressions**
  ```yaml
  # ✅ BETUL - function calls
  if: success()
  if: failure()
  if: always()
  
  # ✅ BETUL - comparisons
  if: github.event.workflow_run.conclusion != 'success'
  if: steps.deploy.outputs.status == 'success'
  
  # ❌ SALAH - invalid syntax
  if: ${{ success() }}  # Tidak perlu ${{ }} dalam if
  ```

- [ ] **No trailing newlines in multi-line strings**
  ```yaml
  # ❌ SALAH - newline at end breaks docker args
  options: >
    --health-retries 5
  
  # ✅ BETUL - no trailing space/newline
  options: >
    --health-retries 5
  ```

---

## 3. ✅ Code Quality & Build Verification

### Frontend Checks:

```powershell
cd frontend

# Install dependencies
npm ci

# Run linter
npm run lint

# Run type checking (TypeScript)
npx tsc --noEmit

# Run tests
npm test

# Test production build
npm run build

# Verify build output
ls dist/
```

### Backend Checks:

```powershell
cd backend

# Install dependencies
npm ci

# Run linter
npm run lint

# Run type checking
npx tsc --noEmit

# Run tests
npm test

# Test build (if applicable)
npm run build

# Verify no syntax errors
node -c src/server.ts
```

---

## 4. ✅ Railway CLI Testing (Local)

Test Railway deployment locally sebelum push:

```powershell
# Login ke Railway
railway login

# Link project
railway link

# Verify connection
railway status

# Test deployment (dry run)
railway up --dry-run

# Check logs
railway logs --tail 100
```

---

## 5. ✅ Environment Variables & Configuration

### Check .env files:

- [ ] `.env.example` updated dengan semua vars diperlukan
- [ ] No hardcoded secrets dalam kod
- [ ] Railway environment variables set correctly

### Verify Railway Environment:
```powershell
railway variables list
```

### Required Railway Variables:
- [ ] `NODE_ENV=production`
- [ ] `PORT` (auto-set by Railway)
- [ ] `DATABASE_URL` (jika guna database)
- [ ] API keys and secrets

---

## 6. ✅ Health Endpoint Verification

Pastikan health endpoint berfungsi:

### Create/verify health endpoint:

```typescript
// backend/src/routes/health.ts
export const healthRouter = express.Router();

healthRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'HAFJET Cloud Accounting'
  });
});
```

### Test locally:
```powershell
# Start server
npm run dev

# Test endpoint
curl http://localhost:3000/api/health

# Or with PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/health"
```

---

## 7. ✅ Git & Workflow Validation

### Before commit:

```powershell
# Check status
git status

# Verify no uncommitted secrets
git diff | Select-String -Pattern "secret|token|password|api_key"

# Add files
git add .

# Commit with descriptive message
git commit -m "fix(ci): update Railway deployment workflow"
```

### Validate workflows locally (pre-commit hook):

```powershell
# Create validation script
# .github/scripts/validate-workflows.ps1

foreach ($file in Get-ChildItem .github/workflows/*.yml) {
    Write-Host "Validating $($file.Name)..."
    
    # Check for inline comments after run:
    $content = Get-Content $file.FullName -Raw
    if ($content -match "run:.*#") {
        Write-Error "Found inline comment after 'run:' in $($file.Name)"
        exit 1
    }
    
    # Validate YAML syntax
    yamllint $file.FullName
}

Write-Host "✅ All workflows validated successfully"
```

---

## 8. ✅ Post-Push Verification

Selepas push ke GitHub, verify:

### Check GitHub Actions:

1. Go to: `https://github.com/[USERNAME]/[REPO]/actions`
2. Verify workflow started
3. Monitor logs real-time
4. Check each step completes successfully

### Monitor Railway Dashboard:

1. Open Railway dashboard
2. Check deployment status
3. View build logs
4. Verify service is running

### Test deployed application:

```powershell
# Health check
curl https://sistem-cloud-accounting-hafjet-production.up.railway.app/api/health

# Test main endpoints
curl https://sistem-cloud-accounting-hafjet-production.up.railway.app/

# Check response time
Measure-Command {
  Invoke-WebRequest -Uri "https://sistem-cloud-accounting-hafjet-production.up.railway.app/"
}
```

---

## 9. ✅ Troubleshooting Common Issues

### Issue 1: Workflow not triggering

**Symptoms:** Push succeed but no workflow run

**Solutions:**
- [ ] Check workflow file is in `.github/workflows/` folder
- [ ] Verify `on: push:` trigger configured
- [ ] Ensure pushed to correct branch (`main`)

### Issue 2: Railway login failed

**Symptoms:** `railway login --token -` step fails

**Solutions:**
- [ ] Verify `RAILWAY_TOKEN` secret exists
- [ ] Check token is not expired
- [ ] Regenerate token: `railway tokens create`

### Issue 3: Build failed

**Symptoms:** npm install or build step fails

**Solutions:**
- [ ] Check `package.json` and `package-lock.json` committed
- [ ] Verify Node version matches (v18)
- [ ] Test build locally first
- [ ] Check dependencies for version conflicts

### Issue 4: Health check failed

**Symptoms:** Health check times out

**Solutions:**
- [ ] Verify health endpoint exists and responds
- [ ] Check Railway service is actually running
- [ ] Verify URL in workflow matches Railway URL
- [ ] Increase timeout/retry attempts if needed

### Issue 5: Deployment succeeded but app not working

**Symptoms:** Deploy OK but app crashes or 502

**Solutions:**
- [ ] Check Railway logs: `railway logs --tail 200`
- [ ] Verify environment variables set
- [ ] Check start command in `package.json`
- [ ] Verify port binding (Railway auto-assigns PORT)

---

## 10. ✅ Final Pre-Push Checklist

Before `git push`, confirm ALL items:

### Code Quality:
- [ ] All tests passing locally
- [ ] No console errors or warnings
- [ ] Linter clean (no errors)
- [ ] TypeScript types validated

### Workflow Files:
- [ ] YAML syntax validated
- [ ] No inline comments after `run:`
- [ ] No LocalStack references
- [ ] Proper indentation
- [ ] Valid `if:` expressions

### Secrets & Config:
- [ ] RAILWAY_TOKEN set in GitHub
- [ ] RAILWAY_PROJECT set in GitHub
- [ ] Railway environment variables configured
- [ ] No secrets in code

### Railway Setup:
- [ ] Railway CLI working locally
- [ ] Project linked correctly
- [ ] Health endpoint responding
- [ ] Local deployment test passed

### Documentation:
- [ ] README updated (if needed)
- [ ] CHANGELOG updated
- [ ] Commit message descriptive

---

## 11. ✅ Automated Validation Script

Create dan run script ini sebelum push:

```powershell
# scripts/pre-deploy-check.ps1

Write-Host "🔍 Running Pre-Deployment Checks..." -ForegroundColor Cyan

$errors = 0

# 1. Check secrets
Write-Host "`n1️⃣ Checking GitHub secrets..."
$secrets = gh secret list | Select-String "RAILWAY_TOKEN|RAILWAY_PROJECT"
if ($secrets.Count -lt 2) {
    Write-Host "❌ Missing Railway secrets" -ForegroundColor Red
    $errors++
} else {
    Write-Host "✅ Railway secrets found" -ForegroundColor Green
}

# 2. Validate workflows
Write-Host "`n2️⃣ Validating workflow YAML..."
foreach ($file in Get-ChildItem .github/workflows/*.yml) {
    if ((Get-Content $file.FullName -Raw) -match "run:.*#") {
        Write-Host "❌ Inline comment found in $($file.Name)" -ForegroundColor Red
        $errors++
    }
}
Write-Host "✅ Workflow syntax OK" -ForegroundColor Green

# 3. Test frontend build
Write-Host "`n3️⃣ Testing frontend build..."
Push-Location frontend
try {
    npm run build 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Frontend build failed" -ForegroundColor Red
        $errors++
    } else {
        Write-Host "✅ Frontend build passed" -ForegroundColor Green
    }
} finally {
    Pop-Location
}

# 4. Test backend build
Write-Host "`n4️⃣ Testing backend build..."
Push-Location backend
try {
    npm run build 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Backend build failed" -ForegroundColor Red
        $errors++
    } else {
        Write-Host "✅ Backend build passed" -ForegroundColor Green
    }
} finally {
    Pop-Location
}

# 5. Check Railway connection
Write-Host "`n5️⃣ Checking Railway connection..."
$railwayStatus = railway status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Railway not connected (optional for CI)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Railway connected" -ForegroundColor Green
}

# Summary
Write-Host "`n" + ("=" * 50)
if ($errors -eq 0) {
    Write-Host "✅ ALL CHECKS PASSED - Safe to push!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ $errors error(s) found - Fix before pushing!" -ForegroundColor Red
    exit 1
}
```

### Run script:
```powershell
.\scripts\pre-deploy-check.ps1
```

---

## 12. ✅ Quick Reference Commands

### Development:
```powershell
# Frontend dev
cd frontend && npm run dev

# Backend dev
cd backend && npm run dev

# Run all tests
npm test

# Build production
npm run build
```

### Railway:
```powershell
# Login
railway login

# Link project
railway link

# Deploy
railway up

# Logs
railway logs --tail 100

# Status
railway status

# Variables
railway variables list
```

### Git & CI:
```powershell
# Validate workflows
yamllint .github/workflows/*.yml

# Check secrets
gh secret list

# View workflow runs
gh run list --limit 10

# View specific run
gh run view [RUN_ID] --log

# Watch workflow (real-time)
gh run watch
```

---

## Summary

✅ **Semak semua items dalam checklist ini sebelum setiap deployment**

🚀 **Quick pre-push commands:**
```powershell
# Run all checks
.\scripts\pre-deploy-check.ps1

# If all pass, commit and push
git add .
git commit -m "feat: your changes here"
git push origin main

# Monitor deployment
gh run watch
```

📋 **Jika workflow fail:**
1. Check GitHub Actions logs
2. Check Railway dashboard
3. Run troubleshooting steps (Section 9)
4. Fix issues locally
5. Re-run checklist
6. Push again

---

**Updated:** October 2025  
**For support:** Check `docs/DEPLOYMENT_GUIDE.md`
