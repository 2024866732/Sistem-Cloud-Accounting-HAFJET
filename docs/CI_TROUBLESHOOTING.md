# CI/CD Troubleshooting Guide

This guide documents common CI/CD issues and their solutions for the HAFJET Cloud Accounting System.

## Table of Contents
- [GitHub Actions Workflow Syntax Errors](#github-actions-workflow-syntax-errors)
- [npm Lockfile Synchronization Issues](#npm-lockfile-synchronization-issues)
- [Docker Build Cache Issues](#docker-build-cache-issues)
- [MongoDB Memory Server Compatibility](#mongodb-memory-server-compatibility)
- [Repository Secrets Configuration](#repository-secrets-configuration)
- [Deployment Guards](#deployment-guards)

---

## GitHub Actions Workflow Syntax Errors

### Problem
Workflows fail with errors like:
```
Invalid workflow file: .github/workflows/ci.yml
Unrecognized function: 'ne'
Unrecognized named-value: 'secrets'
```

### Root Cause
GitHub Actions doesn't support the `ne()` function. Additionally, secrets cannot be directly accessed in conditional expressions (`if:` clauses) in certain contexts.

### Solution
Use the **step outputs pattern** instead:

**❌ Incorrect:**
```yaml
- name: Some step
  if: ${{ ne(secrets.SECRET_NAME, '') }}
```

**✅ Correct:**
```yaml
- name: Check secret availability
  id: secret_check
  run: |
    if [ -n "$SECRET_VALUE" ]; then
      echo "available=true" >> $GITHUB_OUTPUT
    else
      echo "available=false" >> $GITHUB_OUTPUT
    fi
  env:
    SECRET_VALUE: ${{ secrets.SECRET_NAME }}

- name: Some step
  if: steps.secret_check.outputs.available == 'true'
```

### Prevention
- Always validate workflow YAML before committing:
  ```bash
  npm run validate:workflows
  ```
- Use the GitHub Actions VSCode extension for syntax highlighting

---

## npm Lockfile Synchronization Issues

### Problem
Docker builds fail with:
```
npm error `npm ci` can only install packages when your package.json and package-lock.json are in sync.
```

### Root Cause
- Manual edits to `package.json` without regenerating lockfile
- Self-referencing dependencies (e.g., `"package-name": "file:"`)
- Lockfile generated with different npm version

### Solution

**1. Remove any self-dependencies from `package.json`:**
```bash
# Check for self-references
grep -n "file:" backend/package.json
```

**2. Regenerate the lockfile:**
```bash
cd backend
rm -f package-lock.json
npm install --package-lock-only --legacy-peer-deps
```

**3. Verify locally (skip lifecycle scripts to avoid husky issues):**
```bash
npm ci --ignore-scripts --legacy-peer-deps
```

**4. Use verification scripts:**
```bash
# PowerShell
.\scripts\verify-lockfile.ps1

# Bash
./scripts/verify-lockfile.sh
```

### Prevention
- Always run `npm install` after editing `package.json`
- Commit both `package.json` and `package-lock.json` together
- Use `npm ci` in CI/CD (never `npm install`)

---

## Docker Build Cache Issues

### Problem
Docker builds fail when trying to push cache to registry without credentials:
```
ERROR: failed to build: failed to solve: failed to configure registry cache exporter: invalid reference format
```

### Root Cause
The `cache-to` configuration tries to push to GitHub Container Registry (GHCR) even when `GHCR_PAT` secret is not available.

### Solution
Make cache configuration conditional:

```yaml
- name: Build and push image
  uses: docker/build-push-action@v4
  with:
    context: ./backend
    file: ./backend/Dockerfile
    push: ${{ steps.ghcr_check.outputs.push == 'true' }}
    cache-from: |
      ${{ steps.ghcr_check.outputs.push == 'true' && format('type=registry,ref=ghcr.io/owner/repo-cache:buildx-{0}', github.ref_name) || '' }}
      type=local,src=/tmp/.buildx-cache
    cache-to: |
      ${{ steps.ghcr_check.outputs.push == 'true' && format('type=registry,ref=ghcr.io/owner/repo-cache:buildx-{0},mode=max', github.ref_name) || '' }}
      type=local,dest=/tmp/.buildx-cache,mode=max
```

This ensures registry cache is only used when credentials are available, while local cache always works.

---

## MongoDB Memory Server Compatibility

### Problem
Tests using MongoDB Memory Server fail on Ubuntu 24.04:
```
Instance failed to start because a library is missing or cannot be opened: "libcrypto.so.1.1"
```

### Root Cause
Ubuntu 24.04 uses OpenSSL 3.x, but MongoDB 5.0 requires OpenSSL 1.1.

### Solution
Install OpenSSL 1.1 compatibility library in workflow:

```yaml
- name: Install OpenSSL 1.1 compatibility library
  run: |
    wget http://archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2_amd64.deb
    sudo dpkg -i libssl1.1_1.1.1f-1ubuntu2_amd64.deb
    rm libssl1.1_1.1.1f-1ubuntu2_amd64.deb
```

### Alternative Solutions
1. Use MongoDB 6.0+ (requires libssl3)
2. Use mongodb-memory-server version that downloads compatible binaries
3. Use actual MongoDB service container instead of memory server

---

## Repository Secrets Configuration

### GHCR_PAT (GitHub Container Registry)

**Purpose:** Enables automatic Docker image pushes to ghcr.io

**When to configure:**
- If you want CI to push images to container registry
- For production deployments from registry
- For sharing images across environments

**How to create:**
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with scopes:
   - `write:packages` (Upload packages to GitHub Package Registry)
   - `read:packages` (Download packages from GitHub Package Registry)
   - `repo` (Full control of private repositories)
3. Copy the token

**How to add to repository:**
1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `GHCR_PAT`
4. Value: Paste the token
5. Click "Add secret"

**Without this secret:**
- Docker images build successfully
- Images are **not** pushed to registry
- Verification steps are skipped
- ✅ Workflow continues without errors

---

### KUBE_CONFIG (Kubernetes Deployment)

**Purpose:** Enables automatic deployments to Kubernetes clusters

**When to configure:**
- If you want automatic deploys from main branch
- For staging/production environments
- When using kubectl in workflows

**How to create:**
```bash
# Linux/Mac
cat ~/.kube/config | base64 -w 0

# PowerShell (Windows)
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Content -Path "$env:USERPROFILE\.kube\config" -Raw)))
```

**How to add to repository:**
1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `KUBE_CONFIG`
4. Value: Paste the base64-encoded kubeconfig
5. Click "Add secret"

**Without this secret:**
- Deploy workflow runs successfully
- Shows warning: "KUBE_CONFIG secret not found"
- Deployment steps are skipped
- ✅ Workflow continues without errors (non-fatal)

---

## Deployment Guards

### Problem
Workflows fail hard when optional secrets are missing, blocking all CI runs.

### Solution
Implement **non-fatal guards** that warn but don't fail:

```yaml
- name: Ensure KUBE_CONFIG present
  id: kube_check
  run: |
    if [ -z "$KUBE_CONFIG_CONTENT" ]; then
      echo "⚠️  KUBE_CONFIG secret not found - deployment will be skipped"
      echo "has_config=false" >> $GITHUB_OUTPUT
    else
      echo "✓ KUBE_CONFIG secret found"
      echo "$KUBE_CONFIG_CONTENT" | base64 -d > kubeconfig.yaml
      echo "has_config=true" >> $GITHUB_OUTPUT
    fi
  env:
    KUBE_CONFIG_CONTENT: ${{ secrets.KUBE_CONFIG }}

- name: Deploy to Kubernetes
  if: steps.kube_check.outputs.has_config == 'true'
  run: kubectl apply -f k8s/
  env:
    KUBECONFIG: kubeconfig.yaml
```

**Key principles:**
- ✅ Check secret availability in a dedicated step
- ✅ Output status to be used in conditionals
- ✅ Show clear warning messages
- ✅ Continue workflow even if secret is missing
- ✅ Skip dependent steps gracefully

---

## Quick Reference Commands

### Validate Workflows
```bash
npm run validate:workflows
```

### Regenerate Lockfile
```bash
cd backend
rm package-lock.json
npm install --package-lock-only --legacy-peer-deps
```

### Verify Lockfile
```bash
# Windows PowerShell
.\scripts\verify-lockfile.ps1

# Linux/Mac
./scripts/verify-lockfile.sh
```

### Check Workflow Runs
```bash
gh run list --limit 10
gh run watch <run-id>
gh run view <run-id> --log-failed
```

### View PR Checks
```bash
gh pr view <pr-number>
gh pr checks <pr-number>
```

---

## CI Pipeline Status

### Required for Green CI
- ✅ Workflow YAML syntax valid
- ✅ npm lockfile synchronized
- ✅ All tests passing
- ✅ Docker images build successfully

### Optional (Non-blocking)
- ⚠️ GHCR_PAT secret (for registry pushes)
- ⚠️ KUBE_CONFIG secret (for deployments)
- ⚠️ S3 credentials (for restore-e2e-s3 workflow)

---

## Getting Help

**Check workflow logs:**
```bash
gh run view <run-id> --log-failed
```

**Validate locally:**
```bash
npm run validate:workflows
npm ci --ignore-scripts
```

**Common fixes:**
1. Regenerate lockfile
2. Fix workflow syntax
3. Add missing secrets (if needed)
4. Check Docker cache configuration

**Still stuck?** Check:
- GitHub Actions documentation
- This repository's closed issues/PRs
- Recent successful workflow runs for comparison
