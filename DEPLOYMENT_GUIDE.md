# Panduan Deployment Akhir - HAFJET Cloud Accounting System

## Ringkasan
Dokumen ini menyediakan panduan lengkap untuk deployment sistem HAFJET Cloud Accounting ke Railway App menggunakan automasi CI/CD GitHub Actions.

---

## 1. Prasyarat

### 1.1 Akaun dan Platform
- **GitHub Account**: Repo kod sumber
- **Railway Account**: Platform cloud untuk deployment
- **Railway CLI**: Dipasang secara automatik dalam workflow

### 1.2 Secrets yang Diperlukan
Pastikan secrets berikut telah diset dalam GitHub Actions Secret (Settings > Secrets and variables > Actions):

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `RAILWAY_TOKEN` | Token autentikasi Railway | `xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `RAILWAY_PROJECT` | ID projek Railway | `186782e9-5c00-473e-8434-a5fdd3951711` |
| `AWS_ACCESS_KEY_ID` | AWS access key (untuk production AWS) | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key (untuk production AWS) | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_DEFAULT_REGION` | AWS region (untuk production AWS) | `ap-southeast-1` |
| `S3_BUCKET` | S3 bucket name (untuk production AWS) | `hafjet-prod-bucket` |

**Cara dapatkan RAILWAY_TOKEN:**
1. Pergi ke Railway dashboard: https://railway.app
2. Klik pada profile icon > Account Settings
3. Pilih "Tokens" tab
4. Klik "Create Token" dan copy value

**Cara dapatkan RAILWAY_PROJECT:**
1. Buka projek Railway anda
2. Check URL browser: `https://railway.app/project/<project-id>`
3. Copy nilai `<project-id>` (contoh: 186782e9-5c00-473e-8434-a5fdd3951711)

---

## 2. CI/CD Railway App (Automasi Deployment)

### 2.1 Trigger Deployment
Deployment akan berlaku secara automatik bila:
1. Push kod ke branch `main`
2. Merge pull request ke branch `main`

### 2.2 Workflow Steps
Workflow CI/CD akan menjalankan langkah berikut:
1. **Checkout repository**: Ambil kod terkini
2. **Setup Node.js**: Setup runtime environment
3. **Install Railway CLI**: Install Railway CLI tools
4. **Railway login**: Autentikasi dengan Railway
5. **Deploy to Railway**: Deploy app ke Railway cloud
6. **Verify deployment**: Uji endpoint API untuk pastikan app running
7. **Deployment status**: Inform success/failure

### 2.3 Monitoring Deployment
1. Pergi ke tab **Actions** dalam repo GitHub
2. Pilih workflow run terkini
3. Semak status setiap step
4. Jika gagal, check logs untuk error details

### 2.4 Verify Deployment Success
Selepas workflow berjaya:
1. Pergi ke Railway dashboard
2. Check deployment logs
3. Uji endpoint app: `https://sistem-cloud-accounting-hafjet-production.up.railway.app`
4. Test API health check: `https://sistem-cloud-accounting-hafjet-production.up.railway.app/api/health`

### 2.5 Remove AWS secrets (if you want to deploy only to Railway)

If you no longer need AWS production secrets in this repository, you can remove them from GitHub Secrets either via GUI or using the GitHub CLI helpers we included.

GUI (manual):
1. Go to your repository on GitHub.
2. Settings > Secrets and variables > Actions.
3. Find `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET`.
4. Click the trash icon to delete each secret.

CLI (automatic):
- Bash (Linux/macOS/WSL/Git Bash):
```bash
bash scripts/remove-aws-secrets.sh
```
- PowerShell (Windows PowerShell / PowerShell Core):
```powershell
.
\scripts\remove-aws-secrets.ps1
```

Note: the `gh` CLI must be installed and you must be authenticated (`gh auth login`) with an account that has repository admin rights.

---

## 3. Manual/CLI Deployment

### 3.1 Local Deployment ke LocalStack (Development)
Gunakan skrip automasi untuk local testing:

**Windows PowerShell:**
```powershell
.\scripts\install-localstack.ps1
```

**Windows Batch:**
```batch
.\scripts\install-localstack.bat
```

**Linux/WSL/Git Bash:**
```bash
bash scripts/setup-localstack.sh
```

### 3.2 Manual Railway Deployment (CLI)
Jika anda mahu deploy secara manual menggunakan Railway CLI:

```bash
# 1. Install Railway CLI
npm install -g railway

# 2. Login ke Railway
railway login

# 3. Link projek Railway
railway link 186782e9-5c00-473e-8434-a5fdd3951711

# 4. Deploy app
railway up

# 5. Check deployment status
railway status

# 6. View logs
railway logs
```

### 3.3 Production AWS Deployment (Optional)

**Setup AWS CLI:**
```bash
# Install AWS CLI (jika belum dipasang)
pip install awscli

# Configure AWS credentials
aws configure
# Masukkan: AWS Access Key ID, Secret Access Key, Region, Output format
```

**Deploy ke AWS S3:**
```bash
# Build frontend
cd frontend && npm install && npm run build

# Upload ke S3 bucket
aws s3 cp dist/ s3://hafjet-prod-bucket/ --recursive

# Verify upload
aws s3 ls s3://hafjet-prod-bucket/
```

**Update Workflow untuk AWS Deployment:**
Uncomment bahagian AWS deployment dalam `.github/workflows/deploy.yml`:

```yaml
# Setup AWS CLI
- name: Setup AWS CLI
  uses: aws-actions/configure-aws-credentials@v2
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ${{ secrets.AWS_DEFAULT_REGION }}

# Deploy to AWS S3
- name: Deploy to AWS
  run: aws s3 cp build/ s3://hafjet-prod-bucket/ --recursive
```

---

## 4. Validasi Deployment Selepas CI/CD

### 4.1 Check Build Logs
1. Pergi ke GitHub Actions tab
2. Pilih workflow run
3. Expand setiap step untuk semak logs
4. Pastikan tiada error dalam logs

### 4.2 Verify Railway Deployment
1. Pergi ke Railway dashboard
2. Check deployment status (Active/Failed)
3. Semak logs Railway untuk error
4. Test endpoint app dan API

### 4.3 Test API Endpoints
```bash
# Health check
curl https://sistem-cloud-accounting-hafjet-production.up.railway.app/api/health

# Test login endpoint (contoh)
curl -X POST https://sistem-cloud-accounting-hafjet-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'
```

### 4.4 Verify S3 Artefact (jika deploy ke AWS)
```bash
# List S3 bucket contents
aws s3 ls s3://hafjet-prod-bucket/ --recursive

# Check artefact presence
aws s3 ls s3://hafjet-prod-bucket/index.html
```

### 4.5 Run Tests
```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test

# E2E tests (jika ada)
npm run test:e2e
```

---

## 5. Troubleshooting

### 5.1 Deployment Failed
**Issue**: Workflow gagal pada step deploy
**Solution**:
- Check RAILWAY_TOKEN dan RAILWAY_PROJECT dalam GitHub Secrets
- Verify Railway CLI version compatible
- Check Railway dashboard untuk error details
- Semak logs GitHub Actions untuk details error

### 5.2 Health Check Failed
**Issue**: Endpoint health check return error
**Solution**:
- Check Railway logs untuk backend errors
- Verify environment variables set correctly dalam Railway
- Check database connection status
- Pastikan app listening pada port yang betul

### 5.3 AWS Upload Failed
**Issue**: S3 upload gagal
**Solution**:
- Verify AWS credentials dalam GitHub Secrets
- Check S3 bucket permissions (IAM policy)
- Ensure bucket exists dan accessible
- Verify region setting betul

### 5.4 Secrets Not Found
**Issue**: Workflow gagal kerana secrets tidak dijumpai
**Solution**:
- Pergi ke Settings > Secrets and variables > Actions
- Pastikan semua secrets diperlukan telah diset
- Check typo dalam nama secret
- Verify secret values tidak expired

---

## 6. Rollback Strategy

### 6.1 Railway Rollback
1. Pergi ke Railway dashboard
2. Pilih projek
3. Klik "Deployments" tab
4. Pilih deployment sebelumnya yang stable
5. Klik "Redeploy"

### 6.2 Git Rollback
```bash
# Revert last commit
git revert HEAD

# Push revert commit
git push origin main

# Workflow akan auto-deploy versi sebelumnya
```

---

## 7. Best Practices

### 7.1 Sebelum Deploy
- ✅ Run tests locally: `npm test`
- ✅ Check lint errors: `npm run lint`
- ✅ Verify build success: `npm run build`
- ✅ Test app locally: `npm run dev`

### 7.2 Selepas Deploy
- ✅ Monitor deployment logs
- ✅ Test critical API endpoints
- ✅ Verify database connectivity
- ✅ Check error tracking (jika ada Sentry/monitoring)

### 7.3 Security
- ✅ Never commit secrets ke repo
- ✅ Rotate tokens regularly (setiap 3-6 bulan)
- ✅ Use environment-specific secrets
- ✅ Enable 2FA untuk Railway dan GitHub

---

## 8. Nota Tambahan

### 8.1 LocalStack vs Railway App
- **LocalStack**: Hanya untuk dev/test local, mock AWS services
- **Railway App**: Cloud live deployment, automasi scaling dan env management
- **AWS Production**: Enterprise deployment, perlukan secrets dan config tambahan

### 8.2 Railway Dashboard
- URL: https://railway.app/project/186782e9-5c00-473e-8434-a5fdd3951711
- Monitor deployment status, logs, dan metrics
- Configure environment variables dan secrets
- Manage services dan databases

### 8.3 GitHub Actions
- Workflow file: `.github/workflows/deploy.yml`
- Monitor di tab Actions dalam repo GitHub
- Check logs untuk troubleshooting
- Configure secrets di Settings > Secrets and variables > Actions

---

## 9. Support dan Resources

### 9.1 Railway Support
- Dashboard: https://railway.app
- Docs: https://docs.railway.app
- Community: https://discord.gg/railway

### 9.2 GitHub Actions
- Docs: https://docs.github.com/en/actions
- Community: https://github.community

---

## 10. Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-10 | 2.0 | Railway deployment workflow dan validation guide |
| 2025-01-10 | 1.0 | Initial deployment guide |

---

**Deployment anda kini automasi sepenuhnya dan ready untuk production!**

