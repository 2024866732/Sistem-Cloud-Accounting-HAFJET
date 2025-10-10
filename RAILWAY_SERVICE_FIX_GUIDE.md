# 🔧 Railway Service Name Fix - Panduan Lengkap

## ❌ Masalah: "Service not found"

GitHub Actions deploy gagal dengan error:
```
Service not found: hafjet-cloud-accounting
```

**Punca:** Nama service dalam secret `RAILWAY_SERVICE` tidak sepadan dengan nama sebenar di Railway project anda.

---

## ✅ Penyelesaian: 3 Langkah Mudah

### 1️⃣ Dapatkan Nama Service Railway Yang Tepat

#### Pilihan A: Guna Railway CLI (Paling Tepat)

```bash
# Login Railway
railway login

# Link ke project anda
railway link

# List semua services dalam project
railway service
```

Output akan tunjukkan semua service names:
```
Services in project:
  • backend
  • frontend
  • hafjet-backend
  • hafjet-api
```

**Copy nama service yang betul** (case-sensitive!)

#### Pilihan B: Guna Railway Dashboard

1. Login ke https://railway.app
2. Buka project anda
3. Sidebar kiri akan tunjukkan semua services
4. **Hover mouse atas service** → copy nama yang muncul
5. Atau klik service → Settings → Service Name

---

### 2️⃣ Update GitHub Secret `RAILWAY_SERVICE`

```bash
# Method 1: Guna GitHub CLI (fastest)
gh secret set RAILWAY_SERVICE --body "nama-service-tepat"

# Contoh:
gh secret set RAILWAY_SERVICE --body "backend"
gh secret set RAILWAY_SERVICE --body "hafjet-backend"
```

**ATAU**

Manual via GitHub web:
1. Repo → **Settings** → **Secrets and variables** → **Actions**
2. Cari secret `RAILWAY_SERVICE`
3. Klik **Update** (atau **New repository secret** jika belum ada)
4. **Name:** `RAILWAY_SERVICE`
5. **Value:** `nama-service-tepat` (paste dari step 1)
6. Klik **Update secret**

---

### 3️⃣ Verify & Trigger Deploy

#### A. Check workflow configuration

File: `.github/workflows/deploy.yml` line 34

**❌ BEFORE (ada fallback):**
```yaml
RAILWAY_SERVICE: ${{ secrets.RAILWAY_SERVICE || 'hafjet-cloud-accounting' }}
```

**✅ AFTER (wajib ada secret, tak pakai fallback):**
```yaml
RAILWAY_SERVICE: ${{ secrets.RAILWAY_SERVICE }}
```

Buang fallback `|| 'hafjet-cloud-accounting'` supaya workflow fail dengan jelas jika secret tak set.

#### B. Commit & Push perubahan (jika edit workflow)

```bash
git add .github/workflows/deploy.yml
git commit -m "fix: remove RAILWAY_SERVICE fallback, require explicit secret"
git push
```

#### C. Test deployment

Workflow akan auto-run setiap push ke `main`. Atau trigger manually:

```bash
gh workflow run "Deploy to Railway"
```

Atau via GitHub web:
- **Actions** tab → **Deploy to Railway** → **Run workflow**

---

## 🛠️ Troubleshooting

### Check 1: Railway project link

Pastikan RAILWAY_PROJECT secret betul:

```bash
# Dapatkan project ID
railway status

# Copy "Project ID: xxxxx"
gh secret set RAILWAY_PROJECT --body "project-id-anda"
```

### Check 2: Railway token valid

```bash
# Test token locally
railway whoami

# Jika expired atau invalid, generate token baru:
railway login
railway token

# Update secret
gh secret set RAILWAY_TOKEN --body "token-baru"
```

### Check 3: Service exists di Railway

```bash
railway service

# Output harus tunjukkan service yang anda nak deploy
```

Jika service tak wujud:
1. Create service baru di Railway dashboard
2. Atau deploy manual sekali:
   ```bash
   railway up
   ```
3. Lepas tu baru set secret dan guna automation

---

## 🚀 Automated Service List Workflow

Saya telah create workflow untuk **auto-detect service names** dari Railway project anda:

**File:** `.github/workflows/list-railway-services.yml`

### Usage:

```bash
# Trigger workflow via CLI
gh workflow run "List Railway Services"

# Atau via GitHub web
Actions tab → List Railway Services → Run workflow
```

Workflow akan:
1. Install Railway CLI
2. List semua services dalam project
3. Create GitHub issue dengan service list
4. Upload artifact dengan service details

**Output contoh di issue:**
```
Railway Services in Project:
✅ backend
✅ frontend
✅ hafjet-api

To set RAILWAY_SERVICE secret:
gh secret set RAILWAY_SERVICE --body "backend"
```

---

## 📋 Checklist Lengkap

- [ ] Dapatkan nama service Railway yang tepat (railway service atau dashboard)
- [ ] Update secret `RAILWAY_SERVICE` di GitHub (Settings → Secrets)
- [ ] (Optional) Buang fallback di deploy.yml line 34
- [ ] Commit & push jika ada changes
- [ ] Trigger deployment (auto/manual)
- [ ] Monitor GitHub Actions logs
- [ ] Verify deployment success di Railway dashboard

---

## 🆘 Masih Ada Masalah?

### Service name betul tapi masih error

1. Check Railway project linked correctly:
   ```bash
   railway status
   # Pastikan "Project ID" sama dengan RAILWAY_PROJECT secret
   ```

2. Check service aktif di Railway:
   - Dashboard → Project → Service → **Status: Active**

3. Check Railway CLI version:
   ```bash
   npm install -g @railway/cli@latest
   railway --version
   ```

### Multiple services (backend + frontend)

Jika project ada 2+ services, workflow perlu deploy satu-satu:

```yaml
- name: Deploy backend
  run: railway up --service backend

- name: Deploy frontend
  run: railway up --service frontend
```

Atau set secret untuk setiap service:
- `RAILWAY_SERVICE_BACKEND`
- `RAILWAY_SERVICE_FRONTEND`

---

## 📞 Next Steps

1. **Run helper workflow** untuk list services:
   ```bash
   gh workflow run "List Railway Services"
   ```

2. **Dapatkan service name** dari workflow output/artifact

3. **Update secret**:
   ```bash
   gh secret set RAILWAY_SERVICE --body "exact-service-name"
   ```

4. **Trigger deploy**:
   ```bash
   gh workflow run "Deploy to Railway"
   ```

5. **Monitor**:
   ```bash
   gh run watch
   ```

---

**Jika nak saya generate helper workflows atau custom deploy script untuk project structure anda, bagi tau nama services yang anda ada (atau attach Railway dashboard screenshot). Saya akan buat automation penuh siap deploy A-Z! 🚀**
