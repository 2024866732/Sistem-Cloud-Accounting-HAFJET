# Pre-Deployment Checklist - HAFJET Cloud Accounting System

**Date:** October 6, 2025  
**Repository:** Sistem-Cloud-Accounting-HAFJET  
**Target Environment:** Production

---

## 📋 Pre-Deployment Verification Checklist

### ✅ 1. CI/CD Status
- [x] All CI workflows passing on main branch
- [x] Latest commit successfully built
- [x] Docker images build without errors
- [x] All tests passing
- [x] No critical security vulnerabilities
- [x] Workflow YAML validation passed

**Status:** ✅ **READY** - All CI checks passing

---

### ✅ 2. Environment Configuration

#### Backend Environment Variables
Check `backend/.env.example` and ensure production environment has:

**Required:**
- [ ] `PORT` - Backend port (default: 3000 or 3001)
- [ ] `NODE_ENV=production`
- [ ] `MONGO_URI` - MongoDB connection string
- [ ] `JWT_SECRET` - **CRITICAL: Must be strong random string**
- [ ] `JWT_EXPIRE` - Token expiration (default: 7d)
- [ ] `FRONTEND_URL` - Frontend application URL
- [ ] `REDIS_URL` - Redis connection string (if using cache)

**Malaysian Tax Configuration:**
- [ ] `SST_RATE=0.06` (6% SST)
- [ ] `GST_RATE=0.06` (Historical data)

**LHDN E-Invoice (If applicable):**
- [ ] `LHDN_API_BASE_URL`
- [ ] `LHDN_API_KEY`
- [ ] `LHDN_CLIENT_ID`
- [ ] `LHDN_CLIENT_SECRET`

**Optional:**
- [ ] `SENTRY_DSN` - Error tracking
- [ ] `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS` - Email service
- [ ] `LOYVERSE_SYNC_SCHEDULER_ENABLED` - POS integration

#### Frontend Environment Variables
Check `frontend/.env.example` and ensure:

**Required:**
- [ ] `VITE_API_URL` - Backend API endpoint
- [ ] `VITE_APP_URL` - Frontend application URL

**Optional:**
- [ ] `VITE_SENTRY_DSN` - Frontend error tracking

**Status:** ⚠️ **ACTION REQUIRED** - Review and configure environment variables

---

### ✅ 3. Security Checklist

#### Critical Security Items
- [ ] **JWT_SECRET** - Generate strong random secret (min 32 characters)
  ```bash
  # Generate secure JWT secret:
  openssl rand -base64 32
  ```
- [ ] **Database credentials** - Strong passwords for MongoDB
- [ ] **Redis password** - If exposed to internet
- [ ] **HTTPS/TLS** - Ensure SSL certificates configured
- [ ] **CORS settings** - Configure allowed origins
- [ ] **Rate limiting** - Enable API rate limiting
- [ ] **Helmet.js** - Security headers configured
- [ ] **Input validation** - All user inputs sanitized

#### Secret Management
- [ ] Never commit secrets to git
- [ ] Use GitHub Secrets for CI/CD credentials
- [ ] Use environment variables for production secrets
- [ ] Rotate secrets regularly
- [ ] Document secret rotation procedures

**Reference:** See `docs/SECRETS_MANAGEMENT.md` for detailed procedures

**Status:** ⚠️ **ACTION REQUIRED** - Review and implement security measures

---

### ✅ 4. Database Preparation

#### MongoDB Setup
- [ ] Database server running and accessible
- [ ] Backup strategy in place
- [ ] Indexes created for performance
- [ ] Connection pool configured
- [ ] Authentication enabled
- [ ] Network access restricted

#### Migrations
- [ ] Run all pending migrations
  ```bash
  cd backend
  npx migrate-mongo up
  ```
- [ ] Verify migration status
  ```bash
  npx migrate-mongo status
  ```
- [ ] Test rollback procedures

#### Data Backup
- [ ] Initial backup taken before deployment
- [ ] Backup restoration tested
- [ ] Automated backup schedule configured
  ```bash
  cd backend
  npm run backup  # Creates backup in backend/backups/
  ```

**Status:** ⚠️ **ACTION REQUIRED** - Database setup and backup

---

### ✅ 5. Infrastructure Readiness

#### Container Registry
- [ ] Configure GHCR_PAT secret (optional but recommended)
  - Scopes: `write:packages`, `read:packages`, `repo`
  - Add at: Repository Settings → Secrets → GHCR_PAT

**Without GHCR_PAT:**
- ✅ Images build successfully in CI
- ℹ️ Images not pushed to registry
- ⚠️ Manual image management required

#### Kubernetes (If using k8s)
- [ ] Configure KUBE_CONFIG secret for auto-deploy
  ```bash
  # Generate base64 kubeconfig:
  cat ~/.kube/config | base64 -w 0  # Linux/Mac
  # Or see docs/CI_TROUBLESHOOTING.md for Windows
  ```
- [ ] Review k8s manifests in `deploy/k8s/`
- [ ] Configure resource limits
- [ ] Configure health checks
- [ ] Configure ingress/load balancer
- [ ] Configure persistent volumes

**Without KUBE_CONFIG:**
- ✅ Build and Deploy workflow completes
- ⚠️ Deployment steps skipped (manual deploy required)

#### Docker Compose (Alternative)
- [ ] Review `deploy/docker-compose.prod.yml`
- [ ] Configure volume mappings
- [ ] Configure network settings
- [ ] Configure restart policies
- [ ] Test docker-compose startup

**Status:** ⚠️ **ACTION REQUIRED** - Choose deployment method and configure

---

### ✅ 6. Local Testing

#### Build Test
```bash
# Test backend build
cd backend
npm ci --ignore-scripts
npm run build
npm run test

# Test frontend build
cd ../frontend
npm ci
npm run build
npm run test
```

#### Docker Build Test
```bash
# Build backend image
cd backend
docker build -t hafjet-backend:test .

# Build frontend image
cd ../frontend
docker build -t hafjet-frontend:test .

# Test images locally
docker run -d --name test-backend hafjet-backend:test
docker run -d --name test-frontend hafjet-frontend:test

# Cleanup
docker stop test-backend test-frontend
docker rm test-backend test-frontend
```

#### Docker Compose Test
```bash
# Test with development compose
docker-compose up -d

# Verify all services running
docker-compose ps

# Check logs
docker-compose logs

# Smoke test endpoints
curl http://localhost:3000/api/health
curl http://localhost:8080

# Cleanup
docker-compose down
```

**Status:** ⚠️ **ACTION REQUIRED** - Run local tests before deployment

---

### ✅ 7. Deployment Configuration Review

#### docker-compose.prod.yml
Review and verify:
- [ ] Image references point to correct registry
  ```yaml
  image: ghcr.io/2024866732/hafjet-bukku-backend:latest
  image: ghcr.io/2024866732/hafjet-bukku-frontend:latest
  ```
- [ ] Environment variables configured
- [ ] Port mappings correct (80:80 for frontend, 3001:3001 for backend)
- [ ] Volume mappings for data persistence
- [ ] Health checks configured
- [ ] Restart policies set to `unless-stopped`
- [ ] Dependencies configured (`depends_on`)

#### Monitoring Setup
Review `deploy/monitoring/`:
- [ ] Prometheus configured
- [ ] Grafana dashboards provisioned
- [ ] Alert rules configured
- [ ] Grafana admin password set (`GRAFANA_ADMIN_PASSWORD`)

#### Backup Configuration
- [ ] Backup service configured in docker-compose
- [ ] Backup schedule set
- [ ] Backup retention policy defined
- [ ] Backup restoration tested

**Status:** ⚠️ **ACTION REQUIRED** - Review deployment configs

---

### ✅ 8. DNS & Domain Configuration

- [ ] Domain purchased and configured
- [ ] DNS A records point to server IP
  - `app.hafjetaccounting.my` → Frontend
  - `api.hafjetaccounting.my` → Backend
- [ ] SSL certificates obtained (Let's Encrypt recommended)
- [ ] Certificate auto-renewal configured
- [ ] Reverse proxy configured (Nginx/Caddy)
- [ ] HTTP to HTTPS redirect enabled

**Status:** ⚠️ **ACTION REQUIRED** - Domain and SSL setup

---

### ✅ 9. Monitoring & Logging

#### Application Monitoring
- [ ] Sentry configured for error tracking
  - Backend: `SENTRY_DSN`
  - Frontend: `VITE_SENTRY_DSN`
- [ ] Prometheus metrics exposed
- [ ] Grafana dashboards configured
- [ ] Alert rules defined

#### Log Management
- [ ] Log aggregation configured
- [ ] Log rotation enabled
- [ ] Log retention policy defined
- [ ] Log analysis tools configured

#### Health Checks
- [ ] Backend health endpoint: `GET /api/health`
- [ ] Database health check
- [ ] Redis health check
- [ ] Frontend availability check

**Status:** ⚠️ **ACTION REQUIRED** - Configure monitoring

---

### ✅ 10. Performance Optimization

- [ ] Database indexes created
- [ ] Redis caching configured
- [ ] CDN configured for static assets
- [ ] Asset compression enabled (gzip/brotli)
- [ ] Image optimization
- [ ] Code minification and bundling
- [ ] Lazy loading implemented

**Status:** ℹ️ **OPTIONAL** - Performance tuning

---

### ✅ 11. Disaster Recovery Plan

#### Backup Strategy
- [ ] **Automated daily backups** configured
- [ ] **Off-site backup storage** configured
- [ ] **Backup encryption** enabled
- [ ] **Backup restoration tested** (CRITICAL!)
- [ ] **Backup retention**: Keep 7 daily, 4 weekly, 12 monthly

#### Recovery Procedures
- [ ] Database restoration procedure documented
- [ ] Application rollback procedure documented
- [ ] Recovery Time Objective (RTO) defined
- [ ] Recovery Point Objective (RPO) defined
- [ ] Incident response plan documented

#### Testing
- [ ] Backup restoration tested successfully
- [ ] Disaster recovery drill conducted
- [ ] Team trained on recovery procedures

**Status:** ⚠️ **CRITICAL** - Must test backup restoration

---

### ✅ 12. Compliance & Legal

#### Malaysian Compliance
- [ ] SST tax rate configured (6%)
- [ ] LHDN e-Invoice integration configured (if applicable)
- [ ] Malaysian tax report formats implemented
- [ ] Ringgit (RM) currency formatting
- [ ] Malaysian date formats (dd/mm/yyyy)

#### Data Protection
- [ ] PDPA (Personal Data Protection Act) compliance
- [ ] Data retention policies defined
- [ ] Data deletion procedures implemented
- [ ] Privacy policy published
- [ ] Terms of service published

#### Financial Compliance
- [ ] Audit trail enabled
- [ ] Transaction logs immutable
- [ ] Financial reports accurate
- [ ] Tax calculation verified

**Status:** ⚠️ **ACTION REQUIRED** - Legal compliance review

---

## 🚀 Deployment Commands

### Option 1: Docker Compose Deployment

```bash
# 1. Clone repository on server
git clone https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET.git
cd Sistem-Cloud-Accounting-HAFJET

# 2. Create production environment file
cp .env.example .env
# Edit .env with production values
nano .env

# 3. Pull latest images (if using registry)
docker-compose -f deploy/docker-compose.prod.yml pull

# 4. Start services
docker-compose -f deploy/docker-compose.prod.yml up -d

# 5. Verify deployment
docker-compose -f deploy/docker-compose.prod.yml ps
docker-compose -f deploy/docker-compose.prod.yml logs -f

# 6. Run migrations
docker-compose -f deploy/docker-compose.prod.yml exec backend npx migrate-mongo up

# 7. Health check
curl http://localhost:3001/api/health
curl http://localhost:80
```

### Option 2: Kubernetes Deployment

```bash
# 1. Configure kubectl
export KUBECONFIG=/path/to/kubeconfig.yaml

# 2. Create namespace
kubectl create namespace hafjet-bukku

# 3. Create secrets
kubectl create secret generic hafjet-secrets \
  --from-literal=jwt-secret=$(openssl rand -base64 32) \
  --from-literal=mongo-uri=mongodb://mongo:27017/hafjet-bukku \
  -n hafjet-bukku

# 4. Apply manifests
kubectl apply -f deploy/k8s/ -n hafjet-bukku

# 5. Verify deployment
kubectl get pods -n hafjet-bukku
kubectl get services -n hafjet-bukku

# 6. Check logs
kubectl logs -f deployment/backend -n hafjet-bukku
kubectl logs -f deployment/frontend -n hafjet-bukku
```

### Option 3: Manual Build and Deploy

```bash
# 1. Build images locally
docker build -t hafjet-backend:latest ./backend
docker build -t hafjet-frontend:latest ./frontend

# 2. Tag images
docker tag hafjet-backend:latest ghcr.io/2024866732/hafjet-bukku-backend:latest
docker tag hafjet-frontend:latest ghcr.io/2024866732/hafjet-bukku-frontend:latest

# 3. Push to registry (requires GHCR_PAT)
echo $GHCR_PAT | docker login ghcr.io -u USERNAME --password-stdin
docker push ghcr.io/2024866732/hafjet-bukku-backend:latest
docker push ghcr.io/2024866732/hafjet-bukku-frontend:latest

# 4. Deploy to production server
ssh user@production-server
docker-compose -f /path/to/docker-compose.prod.yml pull
docker-compose -f /path/to/docker-compose.prod.yml up -d
```

---

## 🔍 Post-Deployment Verification

### Immediate Checks (0-5 minutes)
- [ ] All containers/pods running
- [ ] Health endpoints responding
  ```bash
  curl https://api.hafjetaccounting.my/api/health
  curl https://app.hafjetaccounting.my
  ```
- [ ] Database connectivity working
- [ ] Redis connectivity working
- [ ] No critical errors in logs

### Short-term Checks (5-30 minutes)
- [ ] User login working
- [ ] Create test invoice
- [ ] Generate test report
- [ ] Test payment processing
- [ ] Verify email sending
- [ ] Check LHDN e-Invoice integration (if configured)

### Monitoring Setup (30+ minutes)
- [ ] Prometheus collecting metrics
- [ ] Grafana dashboards displaying data
- [ ] Sentry receiving error events
- [ ] Log aggregation working
- [ ] Alerts configured and tested

### Performance Baseline
- [ ] Response time < 200ms for API calls
- [ ] Page load time < 3 seconds
- [ ] Database query time < 100ms
- [ ] Memory usage stable
- [ ] CPU usage < 50% under normal load

---

## 🆘 Rollback Procedures

### If Deployment Fails:

**Docker Compose:**
```bash
# Stop new deployment
docker-compose -f deploy/docker-compose.prod.yml down

# Restore previous images
docker-compose -f deploy/docker-compose.prod.yml pull --policy missing

# Start previous version
docker-compose -f deploy/docker-compose.prod.yml up -d
```

**Kubernetes:**
```bash
# Rollback to previous revision
kubectl rollout undo deployment/backend -n hafjet-bukku
kubectl rollout undo deployment/frontend -n hafjet-bukku

# Verify rollback
kubectl rollout status deployment/backend -n hafjet-bukku
```

**Database Rollback:**
```bash
# Restore from backup
cd backend
npm run restore -- <backup-directory>

# Or run migration rollback
npx migrate-mongo down
```

---

## 📞 Support Contacts

### During Deployment
- **DevOps Team:** [Contact Info]
- **Database Admin:** [Contact Info]
- **Security Team:** [Contact Info]

### Post-Deployment
- **On-Call Engineer:** [Contact Info]
- **Support Hotline:** [Phone Number]
- **Incident Slack Channel:** #hafjet-incidents

---

## 📚 Additional Resources

- [CI Troubleshooting Guide](./CI_TROUBLESHOOTING.md)
- [CI Remediation Summary](./CI_REMEDIATION_SUMMARY.md)
- [Secrets Management](./SECRETS_MANAGEMENT.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [User Guide](./USER_GUIDE.md)

---

## ✅ Final Sign-off

Before proceeding with production deployment, ensure:

- [ ] **All checklist items reviewed**
- [ ] **Critical items completed** (marked as CRITICAL)
- [ ] **Security review passed**
- [ ] **Backup tested and verified**
- [ ] **Rollback procedure documented and tested**
- [ ] **Team briefed on deployment**
- [ ] **Monitoring configured**
- [ ] **Support team on standby**

**Deployment Approved By:**
- [ ] Technical Lead: ________________ Date: ______
- [ ] DevOps Lead: __________________ Date: ______
- [ ] Security Lead: ________________ Date: ______

**Deployment Date/Time:** _______________  
**Deployed By:** _______________  
**Rollback Point:** _______________

---

**Remember:** 
- 🎯 Test everything in staging first
- 💾 Backup before deploying
- 📊 Monitor closely after deployment
- 🔄 Have rollback plan ready
- 📞 Keep support team informed

**Good luck with your deployment!** 🚀
