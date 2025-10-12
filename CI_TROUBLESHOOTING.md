# 🔧 CI/CD Troubleshooting Guide

**Last Updated**: October 12, 2025

## Common CI/CD Issues & Solutions

### 1. Workflow YAML Syntax Errors

**Problem**: Invalid GitHub Actions conditionals
```yaml
# ❌ WRONG - 'ne' function doesn't exist
if: ${{ ne(secrets.GHCRPAT, '') }}
```

**Solution**: Use step outputs
```yaml
- name: Check secret
  id: secretcheck
  run: |
    if [ -n "${{ secrets.GHCRPAT }}" ]; then
      echo "available=true" >> $GITHUB_OUTPUT
    else
      echo "available=false" >> $GITHUB_OUTPUT
    fi

- name: Use secret
  if: steps.secretcheck.outputs.available == 'true'
  run: echo "Secret available"
```

### 2. npm Lockfile Sync Issues

**Problem**: `npm ci` fails - package-lock.json out of sync
```
npm error code EUSAGE
npm error `npm ci` can only install with an existing package-lock.json
```

**Solution**: Regenerate lockfile
```bash
rm package-lock.json
npm install --package-lock-only --ignore-scripts --legacy-peer-deps
git add package-lock.json
git commit -m "fix: regenerate package-lock.json"
```

**Prevention**: Use verification script
```yaml
- name: Verify lockfile
  run: bash ./scripts/verify-lockfile.sh
```

### 3. Docker Build Cache Registry Errors

**Problem**: Build fails trying to push cache without credentials
```
ERROR: failed to push: unexpected status from HEAD request
```

**Solution**: Conditional cache with fallback
```yaml
- name: Check GHCR credentials
  id: ghcrcheck
  run: |
    if [ -n "${{ secrets.GHCRPAT }}" ]; then
      echo "push=true" >> $GITHUB_OUTPUT
    else
      echo "push=false" >> $GITHUB_OUTPUT
    fi

- name: Build and push
  uses: docker/build-push-action@v5
  with:
    cache-to: ${{ steps.ghcrcheck.outputs.push == 'true' && 'type=registry,ref=ghcr.io/owner/repo-cache' || 'type=local,dest=/tmp/buildx-cache' }}
```

### 4. MongoDB Memory Server on Ubuntu 24.04

**Problem**: libcrypto.so.1.1 not found
```
error: libcrypto.so.1.1: cannot open shared object file
```

**Solution**: Install OpenSSL 1.1 compatibility
```yaml
- name: Install OpenSSL 1.1
  run: |
    wget http://archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2_amd64.deb
    sudo dpkg -i libssl1.1_1.1.1f-1ubuntu2_amd64.deb
```

Or use reusable workflow:
```yaml
- name: Setup MongoDB compatibility
  uses: ./.github/workflows/ci-templates/install-openssl-1.1.yml
```

### 5. Railway GraphQL API Permission Errors

**Problem**: Railway API returns "Problem processing request"
```
Error: GraphQL query failed
```

**Solution**: Manual secret configuration
```bash
# Set secrets manually using GitHub CLI
gh secret set RAILWAY_SERVICE -b "HAFJET CLOUD ACCOUNTING SYSTEM"
gh secret set RAILWAY_BACKEND_URL -b "https://hafjet-cloud-accounting-system-production.up.railway.app"
gh secret set RAILWAY_FRONTEND_URL -b "https://hafjet-cloud-accounting-system-production.up.railway.app"
```

**Workflow Update**: Make Railway API calls non-fatal
```yaml
- name: Update Railway URLs
  continue-on-error: true
  run: |
    # Railway API call
    railway variables
```

### 6. Missing Required Secrets

**Problem**: Workflow fails due to missing secrets

**Solution**: Add secret checks and fallbacks
```yaml
- name: Validate required secrets
  run: |
    if [ -z "${{ secrets.RAILWAY_TOKEN }}" ]; then
      echo "::error::RAILWAY_TOKEN not set"
      exit 1
    fi
    if [ -z "${{ secrets.MONGO_URI }}" ]; then
      echo "::warning::MONGO_URI not set (optional for CI)"
    fi
```

### 7. Self-Referencing Dependencies

**Problem**: package-lock.json references itself
```json
{
  "dependencies": {
    "hafjet-cloud-accounting-system": "file:"
  }
}
```

**Solution**: Remove self-reference
```bash
# Edit package.json - remove self-reference
# Then regenerate lockfile
rm package-lock.json
npm install --package-lock-only
```

### 8. Node Version Mismatch

**Problem**: Engine compatibility warnings
```
npm WARN EBADENGINE Unsupported engine {node: "20.x", current: "22.x"}
```

**Solution**: Update package.json engines
```json
{
  "engines": {
    "node": ">=20.0.0 <=22.19.0"
  }
}
```

Or set Node version in workflow:
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
```

### 9. Audit Vulnerabilities

**Problem**: Moderate/high vulnerabilities found
```
found 5 moderate severity vulnerabilities
```

**Solution**: Run audit fix
```bash
npm audit fix --force
```

**For CI**: Make non-blocking
```yaml
- name: Security audit
  continue-on-error: true
  run: npm audit --audit-level=high
```

### 10. Docker Build Timeout

**Problem**: Build exceeds time limit

**Solution**: Use layer caching
```yaml
- name: Build with cache
  uses: docker/build-push-action@v5
  with:
    cache-from: type=registry,ref=ghcr.io/owner/repo-cache
    cache-to: type=registry,ref=ghcr.io/owner/repo-cache,mode=max
```

## CI/CD Best Practices

### 1. Non-Fatal Guards for Optional Steps

```yaml
- name: Optional cache push
  continue-on-error: true
  run: docker push cache
```

### 2. Secret Validation Before Deploy

```yaml
pre-deploy:
  runs-on: ubuntu-latest
  steps:
    - run: bash ./scripts/validate-env.sh
```

### 3. Granular Commits

```bash
# Good
git commit -m "fix(ci): update lockfile verification script"

# Bad
git commit -m "fixes"
```

### 4. Local CI Testing

```bash
# Test workflow locally with act
act -j build

# Or run scripts manually
bash ./scripts/verify-lockfile.sh
bash ./scripts/validate-env.sh
```

### 5. Workflow Validation

```bash
# Before commit
python scripts/validate-workflows.py
```

## Debugging Workflows

### Enable Debug Logging

Add repository secret:
- `ACTIONS_RUNNER_DEBUG` = `true`
- `ACTIONS_STEP_DEBUG` = `true`

### View Workflow Logs

```bash
# GitHub CLI
gh run list --limit 10
gh run view <run-id> --log
```

### Test Individual Steps

```yaml
- name: Debug step
  run: |
    echo "Node version: $(node --version)"
    echo "NPM version: $(npm --version)"
    echo "Working directory: $(pwd)"
    ls -la
```

## Related Documentation

- [DEPLOYMENT_ROLLBACK.md](./DEPLOYMENT_ROLLBACK.md)
- [BACKUP_RESTORE_GUIDE.md](./BACKUP_RESTORE_GUIDE.md)
- [PREDEPLOYMENT_CHECKLIST.md](./PREDEPLOYMENT_CHECKLIST.md)

---

**Status**: ✅ CI/CD Pipeline Stable - All Known Issues Documented & Resolved
