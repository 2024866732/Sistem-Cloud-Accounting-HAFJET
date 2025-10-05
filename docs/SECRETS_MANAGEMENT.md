# Secrets Management Guide

## Overview
This guide outlines best practices for managing secrets and sensitive configuration in the HAFJET Cloud Accounting System. Proper secrets management is critical for production security.

## Table of Contents
1. [Secrets Inventory](#secrets-inventory)
2. [GitHub Secrets Configuration](#github-secrets-configuration)
3. [Secret Rotation Procedures](#secret-rotation-procedures)
4. [Environment-Specific Secrets](#environment-specific-secrets)
5. [Emergency Procedures](#emergency-procedures)

## Secrets Inventory

### Critical Secrets (Required for Production)
| Secret Name | Purpose | Rotation Frequency | Owner |
|-------------|---------|-------------------|-------|
| `JWT_SECRET` | Authentication token signing | Every 90 days | DevOps Team |
| `MONGODB_URI` | Database connection string | On security incident | Database Admin |
| `MONGODB_USER` | MongoDB username | Every 90 days | Database Admin |
| `MONGODB_PASSWORD` | MongoDB password | Every 90 days | Database Admin |

### API Integration Secrets
| Secret Name | Purpose | Rotation Frequency | Owner |
|-------------|---------|-------------------|-------|
| `LHDN_API_KEY` | LHDN e-Invoice API | Per LHDN policy | Finance Team |
| `LHDN_CLIENT_ID` | LHDN OAuth client | Per LHDN policy | Finance Team |
| `LHDN_CLIENT_SECRET` | LHDN OAuth secret | Per LHDN policy | Finance Team |
| `LOYVERSE_API_KEY` | POS integration | Every 180 days | Operations |
| `EXCHANGE_RATE_API_KEY` | Currency rates | Every 180 days | DevOps Team |

### Communication Secrets
| Secret Name | Purpose | Rotation Frequency | Owner |
|-------------|---------|-------------------|-------|
| `EMAIL_USER` | SMTP username | Every 90 days | DevOps Team |
| `EMAIL_PASS` | SMTP password | Every 90 days | DevOps Team |
| `TELEGRAM_BOT_TOKEN` | Bot authentication | On compromise | DevOps Team |
| `TELEGRAM_WEBHOOK_SECRET` | Webhook validation | Every 90 days | DevOps Team |
| `WHATSAPP_API_TOKEN` | WhatsApp Business API | Per Meta policy | Operations |

### Infrastructure Secrets
| Secret Name | Purpose | Rotation Frequency | Owner |
|-------------|---------|-------------------|-------|
| `GHCR_TOKEN` | Container registry | Every 180 days | DevOps Team |
| `SENTRY_DSN` | Error tracking | Never (revoke if leaked) | DevOps Team |
| `REDIS_PASSWORD` | Cache/queue access | Every 90 days | DevOps Team |

## GitHub Secrets Configuration

### Setting Up Secrets

1. **Navigate to Repository Settings**
   ```
   https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/settings/secrets/actions
   ```

2. **Add Production Secrets**
   Click "New repository secret" and add each secret with:
   - **Name**: Use UPPERCASE_SNAKE_CASE
   - **Value**: The actual secret value
   - **Note**: Add description in internal documentation

3. **Environment-Specific Secrets**
   Create separate environments for different deployment stages:
   - `production` - Production environment secrets
   - `staging` - Staging environment secrets
   - `development` - Development defaults (non-sensitive)

### Required GitHub Secrets

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hafjet-prod?retryWrites=true&w=majority
MONGODB_USER=hafjet-prod-user
MONGODB_PASSWORD=<strong-password>

# Authentication
JWT_SECRET=<256-bit-random-string>

# LHDN e-Invoice
LHDN_API_KEY=<api-key>
LHDN_CLIENT_ID=<client-id>
LHDN_CLIENT_SECRET=<client-secret>

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=notifications@hafjet.com
EMAIL_PASS=<app-specific-password>

# Telegram Bot
TELEGRAM_BOT_TOKEN=<bot-token>
TELEGRAM_WEBHOOK_SECRET=<webhook-secret>

# Container Registry
GHCR_TOKEN=${{ secrets.GITHUB_TOKEN }}  # Auto-generated, no manual config needed

# Monitoring
SENTRY_DSN=https://<key>@<org>.ingest.sentry.io/<project>

# POS Integration
LOYVERSE_API_KEY=<api-key>

# Currency Exchange
EXCHANGE_RATE_API_KEY=<api-key>
```

### Generating Strong Secrets

**JWT_SECRET (256-bit random)**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Output: 64-character hex string
```

**Generic Strong Password**
```bash
openssl rand -base64 32
# Output: 44-character base64 string
```

**Telegram Webhook Secret**
```bash
openssl rand -hex 16
# Output: 32-character hex string
```

## Secret Rotation Procedures

### JWT_SECRET Rotation

**Impact**: All active user sessions will be invalidated

**Steps**:
1. Generate new secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. Update GitHub secret `JWT_SECRET`

3. Deploy new version (sessions will be invalidated)

4. Communicate to users: "Please re-login after system update"

5. Store old secret in password manager for 7 days (rollback window)

**Rollback**:
If issues occur, revert `JWT_SECRET` to previous value within 7 days

---

### MongoDB Password Rotation

**Impact**: Database connection will be temporarily unavailable during rotation

**Steps**:
1. Create new MongoDB user with same permissions:
   ```javascript
   use admin
   db.createUser({
     user: "hafjet-prod-user-new",
     pwd: "<new-strong-password>",
     roles: [
       { role: "readWrite", db: "hafjet-bukku" },
       { role: "dbAdmin", db: "hafjet-bukku" }
     ]
   })
   ```

2. Update GitHub secrets:
   - `MONGODB_USER=hafjet-prod-user-new`
   - `MONGODB_PASSWORD=<new-strong-password>`
   - `MONGODB_URI=mongodb+srv://hafjet-prod-user-new:<new-password>@...`

3. Deploy and verify connection

4. Remove old user after 24h verification period:
   ```javascript
   use admin
   db.dropUser("hafjet-prod-user")
   ```

**Rollback**:
Keep old user active for 24h; revert secrets if issues occur

---

### API Key Rotation (LHDN, Loyverse, etc.)

**Steps**:
1. Generate new API key in provider dashboard

2. Update GitHub secret

3. Deploy new version

4. Verify integration works with new key

5. Revoke old API key after 24h verification period

**Rollback**:
Keep old key active for 24h; revert if integration fails

---

### Email Password Rotation

**Steps**:
1. Generate new app-specific password in email provider

2. Update GitHub secrets:
   - `EMAIL_PASS=<new-app-password>`

3. Deploy and send test email

4. Revoke old app password after verification

**Rollback**:
Revert to old password if email delivery fails

## Environment-Specific Secrets

### Development (.env)
```bash
# backend/.env (local dev - not committed)
JWT_SECRET=dev-secret-not-for-production
MONGODB_URI=mongodb://localhost:27017/hafjet-bukku-dev
SKIP_DB=true
SKIP_SOCKET_AUTH=true
```

### Staging (.env.staging)
```bash
# Use GitHub environment secrets for staging
# Separate MongoDB database: hafjet-bukku-staging
```

### Production (.env.production)
```bash
# Use GitHub environment secrets for production
# All secrets must be strong and rotated regularly
```

## Emergency Procedures

### Secret Compromise Response

**Immediate Actions** (within 1 hour):
1. **Revoke** compromised secret immediately
2. **Generate** new secret
3. **Update** GitHub secret
4. **Deploy** emergency update
5. **Audit** logs for unauthorized access
6. **Notify** stakeholders

**Follow-up Actions** (within 24 hours):
1. **Root cause analysis** - How was secret compromised?
2. **Security review** - Are other secrets at risk?
3. **Process improvement** - Update security procedures
4. **Incident report** - Document lessons learned

### Automated Detection

**GitHub Advanced Security** (if enabled):
- Secret scanning automatically detects exposed secrets in commits
- Alerts sent to security team
- Auto-revoke if possible (GitHub tokens)

**Rotation Reminders**:
Set up calendar reminders for scheduled rotations:
- Every 90 days: JWT_SECRET, MONGODB_PASSWORD, EMAIL_PASS
- Every 180 days: LOYVERSE_API_KEY, EXCHANGE_RATE_API_KEY, GHCR_TOKEN

## Best Practices

### DO ✅
- ✅ Use GitHub Secrets for all sensitive values
- ✅ Rotate secrets on schedule
- ✅ Use strong, randomly generated secrets
- ✅ Limit secret access to minimal teams
- ✅ Audit secret access regularly
- ✅ Use environment-specific secrets
- ✅ Store backup of secrets in password manager (1Password, LastPass)
- ✅ Test secret rotation in staging first

### DON'T ❌
- ❌ Never commit secrets to git (even in .env.example)
- ❌ Never share secrets via email or Slack
- ❌ Never use weak or predictable secrets
- ❌ Never reuse secrets across environments
- ❌ Never hardcode secrets in source code
- ❌ Never log secrets (even in debug mode)
- ❌ Never store secrets in CI logs or artifacts

## Monitoring & Auditing

### Secret Access Audit
Review GitHub secret access logs monthly:
1. Who accessed secrets?
2. When were secrets updated?
3. Any unauthorized access attempts?

### Automated Checks
Add to CI pipeline:
```yaml
- name: Check for hardcoded secrets
  run: |
    # Scan code for potential secrets
    npm install -g detect-secrets
    detect-secrets scan --baseline .secrets.baseline
```

## Support

**Security Incidents**: security@hafjet.com  
**Secret Rotation Coordinator**: devops@hafjet.com  
**Emergency Hotline**: +60-xxx-xxx-xxxx (24/7)

## Compliance

This secrets management policy aligns with:
- ISO 27001 - Information Security Management
- PDPA (Malaysia) - Personal Data Protection
- SOC 2 Type II - Security, Availability, Confidentiality

**Last Updated**: 2025-10-05  
**Next Review**: 2026-01-05  
**Document Owner**: DevOps Team
