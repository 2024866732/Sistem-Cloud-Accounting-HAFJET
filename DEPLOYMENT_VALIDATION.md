# Panduan Validasi Deployment - HAFJET Cloud Accounting System

## Ringkasan
Dokumen ini menyediakan checklist dan langkah-langkah untuk validasi deployment selepas CI/CD workflow selesai.

---

## 1. Pre-Deployment Validation

### 1.1 Code Quality Check
```bash
# Run lint
npm run lint

# Run TypeScript check
npm run type-check

# Verify build
npm run build
```

### 1.2 Local Testing
```bash
# Start dev server
npm run dev

# Run unit tests
npm test

# Run integration tests (jika ada)
npm run test:integration
```

### 1.3 Environment Variables Check
- ✅ Verify semua secrets diset dalam GitHub Actions
- ✅ Check Railway environment variables updated
- ✅ Validate database connection strings
- ✅ Ensure API keys dan tokens valid

---

## 2. Post-Deployment Validation

### 2.1 GitHub Actions Workflow Check

**Step 1: Access GitHub Actions**
1. Pergi ke repo GitHub
2. Klik tab "Actions"
3. Pilih workflow run terkini

**Step 2: Verify Workflow Status**
- ✅ Workflow status: Success (green checkmark)
- ✅ All steps completed without error
- ✅ Deployment time reasonable (typically 2-5 minutes)

**Step 3: Review Logs**
Check logs untuk setiap step:
- Checkout repository: ✅ Code fetched successfully
- Setup Node.js: ✅ Node.js version installed
- Install Railway CLI: ✅ CLI installed globally
- Railway login: ✅ Authentication successful
- Deploy to Railway: ✅ Deployment completed
- Verify deployment: ✅ Health check passed
- Deployment status: ✅ Success message displayed

**Common Issues dan Solutions:**
| Issue | Cause | Solution |
|-------|-------|----------|
| Login failed | RAILWAY_TOKEN invalid | Update token dalam GitHub Secrets |
| Deploy failed | RAILWAY_PROJECT incorrect | Verify project ID |
| Health check timeout | App belum ready | Increase sleep duration dalam workflow |
| Node.js version mismatch | Wrong version specified | Update node-version dalam workflow |

---

### 2.2 Railway Dashboard Check

**Step 1: Access Railway Dashboard**
1. Pergi ke https://railway.app
2. Login dengan akaun anda
3. Pilih projek HAFJET (186782e9-5c00-473e-8434-a5fdd3951711)

**Step 2: Verify Deployment Status**
- ✅ Deployment status: Active
- ✅ Latest deployment timestamp match dengan GitHub Actions
- ✅ No error messages dalam logs
- ✅ Services running (frontend, backend, database)

**Step 3: Check Logs**
```bash
# Option 1: Railway Dashboard
# Klik "Logs" tab dalam Railway dashboard
# Filter by service (frontend/backend)
# Check for errors atau warnings

# Option 2: Railway CLI
railway logs
```

**Log Validation Checklist:**
- ✅ No fatal errors
- ✅ Database connected successfully
- ✅ Server listening on correct port
- ✅ Environment variables loaded
- ✅ No security warnings

**Step 4: Check Metrics**
Monitor metrics dalam Railway dashboard:
- CPU usage: < 80%
- Memory usage: < 80%
- Response time: < 500ms (average)
- Uptime: 100%

---

### 2.3 Application Endpoint Testing

**Step 1: Basic Connectivity Test**
```bash
# Test main domain
curl -I https://sistem-cloud-accounting-hafjet-production.up.railway.app

# Expected output:
# HTTP/2 200
# content-type: text/html
```

**Step 2: Health Check API**
```bash
# Test health endpoint
curl https://sistem-cloud-accounting-hafjet-production.up.railway.app/api/health

# Expected output:
# {"status":"ok","timestamp":"2025-01-10T12:00:00.000Z"}
```

**Step 3: API Endpoints Testing**
```bash
# Test authentication endpoint
curl -X POST https://sistem-cloud-accounting-hafjet-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Expected output:
# {"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...","user":{...}}
```

**Step 4: Frontend Loading Test**
```bash
# Test frontend homepage
curl -s https://sistem-cloud-accounting-hafjet-production.up.railway.app | grep -i "HAFJET"

# Expected: HTML content dengan "HAFJET" text
```

**API Endpoint Checklist:**
| Endpoint | Method | Expected Status | Notes |
|----------|--------|-----------------|-------|
| `/api/health` | GET | 200 | Health check |
| `/api/auth/login` | POST | 200/401 | Authentication |
| `/api/auth/register` | POST | 201 | User registration |
| `/api/transactions` | GET | 200 | List transactions (requires auth) |
| `/api/invoices` | GET | 200 | List invoices (requires auth) |
| `/` | GET | 200 | Frontend homepage |

---

### 2.4 Database Validation

**Step 1: Check Database Connection**
```bash
# Option 1: Railway CLI
railway run node -e "require('./backend/src/config/database').connect().then(() => console.log('DB Connected'))"

# Option 2: Check logs dalam Railway dashboard
# Look for: "MongoDB connected successfully"
```

**Step 2: Verify Data Integrity**
```bash
# Test database query (example)
railway run node -e "require('./backend/src/models/User').countDocuments().then(count => console.log('Users:', count))"
```

**Step 3: Check Migrations**
```bash
# Verify migrations applied
railway run npm run migrate:status

# Expected: All migrations up-to-date
```

---

### 2.5 Performance Testing

**Step 1: Response Time Test**
```bash
# Test response time (menggunakan curl)
curl -w "@curl-format.txt" -o /dev/null -s https://sistem-cloud-accounting-hafjet-production.up.railway.app/api/health

# curl-format.txt:
# time_namelookup:  %{time_namelookup}\n
# time_connect:  %{time_connect}\n
# time_total:  %{time_total}\n

# Expected:
# time_namelookup: < 0.1s
# time_connect: < 0.2s
# time_total: < 0.5s
```

**Step 2: Load Test (Optional)**
```bash
# Install Apache Bench
# Ubuntu: sudo apt install apache2-utils
# macOS: brew install apache2

# Run load test (100 requests, 10 concurrent)
ab -n 100 -c 10 https://sistem-cloud-accounting-hafjet-production.up.railway.app/api/health

# Expected:
# Requests per second: > 50
# Failed requests: 0
# Mean time per request: < 200ms
```

**Performance Benchmarks:**
| Metric | Target | Acceptable | Critical |
|--------|--------|------------|----------|
| Response time (avg) | < 200ms | < 500ms | > 1000ms |
| Uptime | 100% | > 99.9% | < 99% |
| Error rate | 0% | < 0.1% | > 1% |
| CPU usage | < 50% | < 80% | > 90% |
| Memory usage | < 50% | < 80% | > 90% |

---

### 2.6 Security Validation

**Step 1: HTTPS Check**
```bash
# Verify SSL certificate
curl -vI https://sistem-cloud-accounting-hafjet-production.up.railway.app 2>&1 | grep -i "SSL"

# Expected: Valid SSL certificate
```

**Step 2: Security Headers Check**
```bash
# Check security headers
curl -I https://sistem-cloud-accounting-hafjet-production.up.railway.app | grep -E "(X-Frame-Options|X-Content-Type-Options|Strict-Transport-Security)"

# Expected headers:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Strict-Transport-Security: max-age=31536000
```

**Step 3: Secrets Exposure Check**
```bash
# Verify no secrets exposed dalam response
curl -s https://sistem-cloud-accounting-hafjet-production.up.railway.app | grep -Ei "(api_key|secret|password|token)"

# Expected: No secrets found
```

---

### 2.7 AWS S3 Validation (jika deploy ke AWS)

**Step 1: Check S3 Bucket**
```bash
# List bucket contents
aws s3 ls s3://hafjet-prod-bucket/ --recursive

# Expected: List of uploaded files
```

**Step 2: Verify Artefact Presence**
```bash
# Check specific files
aws s3 ls s3://hafjet-prod-bucket/index.html
aws s3 ls s3://hafjet-prod-bucket/assets/

# Expected: Files exist dengan correct size
```

**Step 3: Test S3 Static Website (jika enabled)**
```bash
# Test S3 static website URL
curl -I http://hafjet-prod-bucket.s3-website-ap-southeast-1.amazonaws.com

# Expected: HTTP/1.1 200 OK
```

---

## 3. Automated Validation Script

Anda boleh gunakan skrip automation untuk validasi:

**validate-deployment.sh:**
```bash
#!/bin/bash
# Automated deployment validation script

echo "=== HAFJET Deployment Validation ==="
echo ""

# 1. Health check
echo "1. Testing health endpoint..."
HEALTH=$(curl -s https://sistem-cloud-accounting-hafjet-production.up.railway.app/api/health)
if echo "$HEALTH" | grep -q "ok"; then
  echo "✅ Health check passed"
else
  echo "❌ Health check failed"
  exit 1
fi

# 2. Frontend test
echo "2. Testing frontend..."
FRONTEND=$(curl -s https://sistem-cloud-accounting-hafjet-production.up.railway.app)
if echo "$FRONTEND" | grep -q "HAFJET"; then
  echo "✅ Frontend loaded"
else
  echo "❌ Frontend failed"
  exit 1
fi

# 3. SSL check
echo "3. Checking SSL..."
SSL=$(curl -vI https://sistem-cloud-accounting-hafjet-production.up.railway.app 2>&1 | grep -i "SSL certificate verify ok")
if [ -n "$SSL" ]; then
  echo "✅ SSL valid"
else
  echo "❌ SSL invalid"
  exit 1
fi

# 4. Response time check
echo "4. Checking response time..."
TIME=$(curl -w "%{time_total}" -o /dev/null -s https://sistem-cloud-accounting-hafjet-production.up.railway.app/api/health)
if (( $(echo "$TIME < 1.0" | bc -l) )); then
  echo "✅ Response time: ${TIME}s"
else
  echo "⚠️  Response time slow: ${TIME}s"
fi

echo ""
echo "=== Validation Complete ==="
```

**Run validation script:**
```bash
bash validate-deployment.sh
```

---

## 4. Post-Validation Actions

### 4.1 Jika Validation Success
- ✅ Update deployment status dalam project tracker
- ✅ Notify team members deployment complete
- ✅ Update changelog dengan deployment notes
- ✅ Monitor app untuk beberapa jam pertama

### 4.2 Jika Validation Failed
- ❌ Review error logs dalam GitHub Actions dan Railway
- ❌ Check troubleshooting guide (DEPLOYMENT_GUIDE.md)
- ❌ Consider rollback jika critical issues
- ❌ Fix issues dan redeploy

---

## 5. Monitoring dan Alerting

### 5.1 Setup Monitoring (Recommended)
- Install monitoring tools (contoh: Sentry, New Relic, Datadog)
- Configure error tracking
- Setup uptime monitoring (contoh: UptimeRobot, Pingdom)
- Enable email/Slack alerts untuk downtime

### 5.2 Regular Health Checks
```bash
# Cron job untuk health check setiap 5 minit
*/5 * * * * curl -s https://sistem-cloud-accounting-hafjet-production.up.railway.app/api/health || echo "Health check failed" | mail -s "Alert: HAFJET Health Check Failed" admin@example.com
```

---

## 6. Validation Checklist Summary

Use checklist ini untuk quick reference:

**Pre-Deployment:**
- [ ] Code linted dan type-checked
- [ ] All tests passed locally
- [ ] Build successful
- [ ] Environment variables verified

**GitHub Actions:**
- [ ] Workflow status: Success
- [ ] All steps completed
- [ ] No error messages dalam logs

**Railway Dashboard:**
- [ ] Deployment status: Active
- [ ] Services running
- [ ] No errors dalam logs
- [ ] Metrics within acceptable range

**Application Testing:**
- [ ] Health endpoint returns 200
- [ ] Frontend loads successfully
- [ ] API endpoints respond correctly
- [ ] Database connected

**Performance:**
- [ ] Response time < 500ms
- [ ] No timeouts
- [ ] CPU/Memory usage acceptable

**Security:**
- [ ] HTTPS enabled
- [ ] Security headers present
- [ ] No secrets exposed

**AWS (if applicable):**
- [ ] S3 artefacts uploaded
- [ ] Files accessible

---

## 7. Support

Jika anda menghadapi masalah semasa validation:
1. Check troubleshooting guide dalam DEPLOYMENT_GUIDE.md
2. Review logs dalam GitHub Actions dan Railway dashboard
3. Contact Railway support jika platform issue
4. Refer to project documentation untuk app-specific issues

---

**Deployment validation complete! Your HAFJET Cloud Accounting System is ready for production use.**
