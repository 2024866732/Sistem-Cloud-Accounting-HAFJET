# ✅ Pre-Deployment Checklist

**Project**: HAFJET Cloud Accounting System  
**Last Updated**: October 12, 2025

## 📋 Before Every Deployment

### 1. Code Quality ✅
- [ ] All tests passing locally
- [ ] No ESLint errors
- [ ] No TypeScript errors
- [ ] Code reviewed and approved
- [ ] Branch up-to-date with main

### 2. Environment Variables ✅
- [ ] All required secrets set in Railway
- [ ] `.env.example` updated
- [ ] No hardcoded credentials in code
- [ ] Run `bash ./scripts/validate-env.sh`

### 3. Database ✅
- [ ] Migrations tested locally
- [ ] Rollback migrations prepared
- [ ] Backup created before migration
- [ ] Indexes verified

### 4. Dependencies ✅
- [ ] `package-lock.json` in sync
- [ ] Run `npm ci` successfully
- [ ] No critical vulnerabilities (`npm audit`)
- [ ] Run `bash ./scripts/verify-lockfile.sh`

### 5. CI/CD ✅
- [ ] All GitHub Actions passing
- [ ] Workflow YAML validated
- [ ] Secrets configured
- [ ] Railway deployment successful

### 6. Testing ✅
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual smoke tests done
- [ ] Healthcheck endpoint working

### 7. Documentation ✅
- [ ] CHANGELOG.md updated
- [ ] README.md current
- [ ] API docs updated
- [ ] Deployment notes added

### 8. Monitoring ✅
- [ ] Error tracking enabled (Sentry)
- [ ] Logging configured
- [ ] Alerts set up
- [ ] Dashboard accessible

## 🚀 Deployment Steps

### Phase 1: Pre-Deploy (15 mins)
1. Create backup
   ```bash
   mongodump --uri="$MONGO_URI" --archive="pre-deploy-$(date +%Y%m%d).gz" --gzip
   ```
2. Notify team via Slack
3. Set maintenance mode (if needed)
4. Verify Railway status

### Phase 2: Deploy (10 mins)
1. Merge PR to main
2. Monitor GitHub Actions
3. Wait for Railway deployment
4. Check deployment logs

### Phase 3: Verification (10 mins)
1. Healthcheck
   ```bash
   curl https://hafjet-cloud-accounting-system-production.up.railway.app/health
   ```
2. Login test
3. Create test invoice
4. Check database connection
5. Monitor error rates

### Phase 4: Post-Deploy (15 mins)
1. Smoke tests on production
2. Monitor for 15 minutes
3. Check error logs
4. Update deployment docs
5. Remove maintenance mode
6. Notify team of completion

## ⚠️ Rollback Criteria

Rollback immediately if:
- ❌ Healthcheck fails
- ❌ Database connection errors
- ❌ Critical functionality broken
- ❌ Error rate > 5%
- ❌ User reports major issues

See [DEPLOYMENT_ROLLBACK.md](./DEPLOYMENT_ROLLBACK.md) for rollback procedures.

## 📞 Emergency Contacts

- **DevOps**: [Contact]
- **Database Admin**: [Contact]
- **Railway Support**: support@railway.app

## 🔗 Quick Links

- [Railway Dashboard](https://railway.app)
- [GitHub Actions](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/actions)
- [Production URL](https://hafjet-cloud-accounting-system-production.up.railway.app)
- [Monitoring Dashboard](#)

---

**Remember**: If in doubt, don't deploy. It's better to delay than to break production!
