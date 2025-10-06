#!/bin/bash
# Production Environment Template Generator
# This script generates secure .env templates for production deployment

set -e

echo "==================================================="
echo "🔐 HAFJET Cloud Accounting - Production .env Setup"
echo "==================================================="
echo ""

# Generate secure random secrets
generate_secret() {
    openssl rand -base64 "$1" | tr -d "=+/" | cut -c1-"$1"
}

echo "📝 Generating secure secrets..."
JWT_SECRET=$(openssl rand -base64 32)
MONGO_PASSWORD=$(generate_secret 24)
REDIS_PASSWORD=$(generate_secret 16)
GRAFANA_ADMIN_PASSWORD=$(generate_secret 16)

echo "✅ Secrets generated!"
echo ""

# Create backend .env
echo "📄 Creating backend/.env..."
cat > backend/.env << EOF
# ============================================
# HAFJET Cloud Accounting - Backend Config
# Generated: $(date)
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
EOF

echo "✅ backend/.env created!"
echo ""

# Create frontend .env
echo "📄 Creating frontend/.env..."
cat > frontend/.env << EOF
# ============================================
# HAFJET Cloud Accounting - Frontend Config
# Generated: $(date)
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
EOF

echo "✅ frontend/.env created!"
echo ""

# Create root .env
echo "📄 Creating .env (root)..."
cat > .env << EOF
# ============================================
# HAFJET Cloud Accounting - Root Config
# Generated: $(date)
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
EOF

echo "✅ .env created!"
echo ""

# Create secrets reference file (not committed)
echo "📄 Creating .secrets-reference (for your secure storage)..."
cat > .secrets-reference << EOF
# ============================================
# HAFJET Cloud Accounting - Secrets Reference
# Generated: $(date)
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
# ./scripts/generate-production-env.sh
EOF

echo "✅ .secrets-reference created!"
echo ""

# Display important information
echo "==================================================="
echo "✅ Production environment files created successfully!"
echo "==================================================="
echo ""
echo "📁 Files created:"
echo "   • backend/.env         - Backend configuration"
echo "   • frontend/.env        - Frontend configuration"
echo "   • .env                 - Root configuration"
echo "   • .secrets-reference   - Secret backup (SECURE THIS!)"
echo ""
echo "⚠️  CRITICAL SECURITY STEPS:"
echo ""
echo "1. 🔐 BACKUP .secrets-reference to password manager NOW!"
echo "2. 🚫 Verify .env files are in .gitignore"
echo "3. 📝 Update domain names in .env files:"
echo "      • Replace 'yourdomain.com' with actual domain"
echo "4. 🔑 Configure optional services (LHDN, Email, Sentry)"
echo "5. 🗑️  Delete .secrets-reference after backing up!"
echo ""
echo "📋 Next steps:"
echo "   1. Review and update all .env files with your domains"
echo "   2. Configure optional services as needed"
echo "   3. Test configuration: npm run validate:env"
echo "   4. Deploy: docker-compose -f deploy/docker-compose.prod.yml up -d"
echo ""
echo "🔒 Security reminder:"
echo "   • Never commit .env files"
echo "   • Rotate secrets every 90 days"
echo "   • Use strong passwords (20+ characters)"
echo "   • Enable 2FA on all admin accounts"
echo ""
echo "==================================================="
