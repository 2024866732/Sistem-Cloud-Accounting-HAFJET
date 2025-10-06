# Production Environment Template Generator - PowerShell Version
# This script generates secure .env templates for production deployment

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "🔐 HAFJET Cloud Accounting - Production .env Setup" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Function to generate secure random string
function Generate-Secret {
    param([int]$Length = 32)
    
    $bytes = New-Object byte[] $Length
    $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
    $rng.GetBytes($bytes)
    $secret = [Convert]::ToBase64String($bytes) -replace '[^a-zA-Z0-9]', ''
    return $secret.Substring(0, [Math]::Min($Length, $secret.Length))
}

Write-Host "📝 Generating secure secrets..." -ForegroundColor Yellow
$JWT_SECRET = Generate-Secret -Length 32
$MONGO_PASSWORD = Generate-Secret -Length 24
$REDIS_PASSWORD = Generate-Secret -Length 16
$GRAFANA_ADMIN_PASSWORD = Generate-Secret -Length 16

Write-Host "✅ Secrets generated!" -ForegroundColor Green
Write-Host ""

# Create backend .env
Write-Host "📄 Creating backend/.env..." -ForegroundColor Yellow
$backendEnv = @"
# ============================================
# HAFJET Cloud Accounting - Backend Config
# Generated: $(Get-Date)
# ============================================

# CRITICAL: Never commit this file to git!

# Server Configuration
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://app.yourdomain.com

# Database Configuration (CRITICAL!)
MONGO_URI=mongodb://admin:${MONGO_PASSWORD}@mongo:27017/hafjet-bukku?authSource=admin

# JWT Configuration (CRITICAL!)
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRE=7d

# Redis Configuration
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379

# Malaysian Tax Settings
SST_RATE=0.06
GST_RATE=0.06

# LHDN E-Invoice Configuration (Optional - Configure later)
LHDN_API_BASE_URL=https://api.myinvois.hasil.gov.my
LHDN_API_KEY=your-lhdn-api-key-here
LHDN_CLIENT_ID=your-lhdn-client-id-here
LHDN_CLIENT_SECRET=your-lhdn-client-secret-here

# Email Configuration (Optional - Configure later)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=noreply@hafjetaccounting.my

# Error Tracking (Optional - Configure later)
SENTRY_DSN=

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Session Configuration
SESSION_SECRET=${JWT_SECRET}

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# POS Integration (Optional)
LOYVERSE_SYNC_SCHEDULER_ENABLED=false
LOYVERSE_API_TOKEN=
"@

Set-Content -Path "backend/.env" -Value $backendEnv
Write-Host "✅ backend/.env created!" -ForegroundColor Green
Write-Host ""

# Create frontend .env
Write-Host "📄 Creating frontend/.env..." -ForegroundColor Yellow
$frontendEnv = @"
# ============================================
# HAFJET Cloud Accounting - Frontend Config
# Generated: $(Get-Date)
# ============================================

# CRITICAL: Never commit this file to git!

# API Configuration
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_URL=https://app.yourdomain.com

# Error Tracking (Optional)
VITE_SENTRY_DSN=

# Feature Flags
VITE_ENABLE_E_INVOICE=true
VITE_ENABLE_POS_INTEGRATION=false
"@

Set-Content -Path "frontend/.env" -Value $frontendEnv
Write-Host "✅ frontend/.env created!" -ForegroundColor Green
Write-Host ""

# Create root .env
Write-Host "📄 Creating .env (root)..." -ForegroundColor Yellow
$rootEnv = @"
# ============================================
# HAFJET Cloud Accounting - Root Config
# Generated: $(Get-Date)
# ============================================

# CRITICAL: Never commit this file to git!

# Application URLs
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_URL=https://app.yourdomain.com

# Error Tracking
SENTRY_DSN=
VITE_SENTRY_DSN=

# Monitoring
GRAFANA_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}

# Database Passwords (for docker-compose)
MONGO_ROOT_PASSWORD=${MONGO_PASSWORD}
REDIS_PASSWORD=${REDIS_PASSWORD}
"@

Set-Content -Path ".env" -Value $rootEnv
Write-Host "✅ .env created!" -ForegroundColor Green
Write-Host ""

# Create secrets reference file
Write-Host "📄 Creating .secrets-reference (for your secure storage)..." -ForegroundColor Yellow
$secretsRef = @"
# ============================================
# HAFJET Cloud Accounting - Secrets Reference
# Generated: $(Get-Date)
# ============================================

# CRITICAL SECRETS - Store in password manager!
# DO NOT COMMIT THIS FILE!

JWT_SECRET=${JWT_SECRET}
MONGO_ROOT_PASSWORD=${MONGO_PASSWORD}
REDIS_PASSWORD=${REDIS_PASSWORD}
GRAFANA_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}

# Backup these secrets securely:
# 1. Save to password manager (1Password, LastPass, etc.)
# 2. Print and store in secure physical location
# 3. Share with team via secure channel only
# 4. Rotate every 90 days

# To regenerate secrets:
# .\scripts\generate-production-env.ps1
"@

Set-Content -Path ".secrets-reference" -Value $secretsRef
Write-Host "✅ .secrets-reference created!" -ForegroundColor Green
Write-Host ""

# Display important information
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "✅ Production environment files created successfully!" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 Files created:"
Write-Host "   • backend/.env         - Backend configuration"
Write-Host "   • frontend/.env        - Frontend configuration"
Write-Host "   • .env                 - Root configuration"
Write-Host "   • .secrets-reference   - Secret backup (SECURE THIS!)"
Write-Host ""
Write-Host "⚠️  CRITICAL SECURITY STEPS:" -ForegroundColor Red
Write-Host ""
Write-Host "1. 🔐 BACKUP .secrets-reference to password manager NOW!" -ForegroundColor Yellow
Write-Host "2. 🚫 Verify .env files are in .gitignore"
Write-Host "3. 📝 Update domain names in .env files:"
Write-Host "      • Replace 'yourdomain.com' with actual domain"
Write-Host "4. 🔑 Configure optional services (LHDN, Email, Sentry)"
Write-Host "5. 🗑️  Delete .secrets-reference after backing up!" -ForegroundColor Red
Write-Host ""
Write-Host "📋 Next steps:"
Write-Host "   1. Review and update all .env files with your domains"
Write-Host "   2. Configure optional services as needed"
Write-Host "   3. Deploy: docker-compose -f deploy/docker-compose.prod.yml up -d"
Write-Host ""
Write-Host "🔒 Security reminder:"
Write-Host "   • Never commit .env files"
Write-Host "   • Rotate secrets every 90 days"
Write-Host "   • Use strong passwords (20+ characters)"
Write-Host "   • Enable 2FA on all admin accounts"
Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
