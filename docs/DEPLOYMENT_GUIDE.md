# HAFJET Cloud Accounting System - Production Deployment Guide

> ⚠️ **Security Notice**: For production deployments, **never** hardcode secrets in configuration files. Use GitHub Secrets, environment variables, or a secrets management service. See [Secrets Management Guide](./SECRETS_MANAGEMENT.md) for detailed procedures.

## 📋 Pre-Deployment Checklist

### System Requirements
- **Node.js**: Version 18.0 or higher
- **MongoDB**: Version 5.0 or higher
- **SSL Certificate**: For HTTPS support
- **Domain**: Registered Malaysian domain (.my recommended)
- **Email Service**: For notifications (SendGrid, Mailgun, or similar)

### Malaysian Cloud Hosting Recommendations
1. **Exabytes** - Local Malaysian hosting
2. **iPay88 Cloud** - Payment gateway integration
3. **AWS Asia Pacific (Singapore)** - Enterprise grade
4. **Google Cloud Asia-Southeast1** - High availability
5. **Microsoft Azure Southeast Asia** - Enterprise integration

---

## 🔧 Environment Configuration

### Frontend Environment Variables (.env.production)
```bash
# API Configuration
VITE_API_URL=https://api.hafjetaccounting.my/api
VITE_APP_URL=https://app.hafjetaccounting.my

# Malaysian Banking Integration
VITE_MAYBANK_API_URL=https://api.maybank2u.com.my
VITE_CIMB_API_URL=https://api.cimbclicks.com.my
VITE_PUBLIC_BANK_API_URL=https://api.pbebank.com

# LHDN E-Invoice
VITE_LHDN_EINVOICE_URL=https://einvoice.hasil.gov.my

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_MOBILE_APP=true
VITE_ENABLE_BANKING_SYNC=true
```

### Backend Environment Variables (.env.production)
```bash
# Server Configuration
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hafjet_accounting_prod
MONGODB_OPTIONS=retryWrites=true&w=majority&ssl=true

# JWT & Security
JWT_SECRET=your-super-secure-jwt-secret-key-256-bit
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12

# CORS Configuration
ALLOWED_ORIGINS=https://app.hafjetaccounting.my,https://www.hafjetaccounting.my

# Malaysian Tax & Compliance
LHDN_API_KEY=your-lhdn-api-key
LHDN_CLIENT_ID=your-client-id
LHDN_CLIENT_SECRET=your-client-secret
SST_RATE=0.06
WITHHOLDING_TAX_RATE=0.10

# Banking Integration
MAYBANK_API_KEY=your-maybank-api-key
CIMB_API_KEY=your-cimb-api-key
PUBLIC_BANK_API_KEY=your-public-bank-api-key

# Email Service
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@hafjetaccounting.my
SUPPORT_EMAIL=support@hafjetaccounting.my

# File Storage (AWS S3 or similar)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_BUCKET_NAME=hafjet-accounting-documents
AWS_REGION=ap-southeast-1

# Redis (for caching and sessions)
REDIS_URL=redis://username:password@hostname:port

# Monitoring & Logging
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info

# Payment Gateway (iPay88 for Malaysia)
IPAY88_MERCHANT_CODE=your-merchant-code
IPAY88_MERCHANT_KEY=your-merchant-key
IPAY88_SANDBOX=false
```

---

## 🚀 Deployment Steps

### 1. Server Setup (Ubuntu 20.04 LTS)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx -y

# Install MongoDB (if not using cloud service)
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt update
sudo apt install -y mongodb-org

# Install Redis
sudo apt install redis-server -y
```

### 2. Application Deployment

```bash
# Clone repository
git clone https://github.com/yourusername/hafjet-cloud-accounting.git
cd hafjet-cloud-accounting

# Install dependencies
npm install

# Build frontend
cd frontend
npm install
npm run build
cd ..

# Install backend dependencies
cd backend
npm install
npm run build
cd ..

# Set up environment files
cp .env.example .env.production
# Edit .env.production with your values
nano .env.production
```

### 3. Database Setup

```bash
# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database user
mongo
use hafjet_accounting_prod
db.createUser({
  user: "hafjetuser",
  pwd: "your-secure-password",
  roles: ["readWrite"]
})
exit
```

### 4. Nginx Configuration

Create `/etc/nginx/sites-available/hafjet-accounting`:

```nginx
# Frontend (React App)
server {
    listen 80;
    server_name app.hafjetaccounting.my www.hafjetaccounting.my;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.hafjetaccounting.my www.hafjetaccounting.my;

    ssl_certificate /etc/ssl/certs/hafjetaccounting.my.crt;
    ssl_certificate_key /etc/ssl/private/hafjetaccounting.my.key;

    root /var/www/hafjet-accounting/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
}

# API Server
server {
    listen 80;
    server_name api.hafjetaccounting.my;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.hafjetaccounting.my;

    ssl_certificate /etc/ssl/certs/hafjetaccounting.my.crt;
    ssl_certificate_key /etc/ssl/private/hafjetaccounting.my.key;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/hafjet-accounting /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. PM2 Process Management

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'hafjet-backend',
    script: './backend/dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    log_file: './logs/app.log',
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
```

Start the application:
```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Enable PM2 startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

---

## 🔒 Security Configuration

### SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d app.hafjetaccounting.my -d www.hafjetaccounting.my -d api.hafjetaccounting.my

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Firewall Setup

```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Backup Strategy

```bash
# Create backup script
cat > /opt/hafjet-backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/hafjet_$DATE"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mongodump --db hafjet_accounting_prod --out $BACKUP_DIR/db

# Files backup
tar -czf $BACKUP_DIR/files.tar.gz /var/www/hafjet-accounting/uploads

# Upload to cloud storage (AWS S3)
aws s3 sync $BACKUP_DIR s3://hafjet-backups/daily/$DATE/

# Clean old local backups (keep 7 days)
find /backups -name "hafjet_*" -mtime +7 -exec rm -rf {} \;

echo "Backup completed: $DATE"
EOF

chmod +x /opt/hafjet-backup.sh

# Schedule daily backups
echo "0 2 * * * /opt/hafjet-backup.sh" | sudo crontab -
```

---

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Create health check script
cat > /opt/hafjet-health-check.sh << 'EOF'
#!/bin/bash

# Check API health
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.hafjetaccounting.my/api/health)

if [ $API_STATUS -ne 200 ]; then
    echo "API is down! Status: $API_STATUS"
    # Restart application
    pm2 restart hafjet-backend
    # Send alert email
    echo "HAFJET API is down at $(date)" | mail -s "URGENT: HAFJET API Alert" admin@hafjetaccounting.my
fi

# Check database connection
mongo --eval "db.runCommand({ping:1})" hafjet_accounting_prod > /dev/null
if [ $? -ne 0 ]; then
    echo "Database connection failed!"
    sudo systemctl restart mongod
fi

# Check disk space
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "Disk usage is high: $DISK_USAGE%"
    # Clean logs
    pm2 flush
fi
EOF

chmod +x /opt/hafjet-health-check.sh

# Run every 5 minutes
echo "*/5 * * * * /opt/hafjet-health-check.sh" | crontab -
```

### Log Management

```bash
# Install logrotate for PM2 logs
cat > /etc/logrotate.d/hafjet << 'EOF'
/var/www/hafjet-accounting/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 644 ubuntu ubuntu
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

---

## 🌐 Malaysian Compliance Setup

### LHDN E-Invoice Integration

1. Register at LHDN MyInvois Portal
2. Obtain API credentials
3. Configure webhook endpoints
4. Test with sandbox environment
5. Go live with production credentials

### SST Configuration

```javascript
// backend/src/config/malaysian-tax.js
export const MALAYSIAN_TAX_CONFIG = {
  sst: {
    rate: 0.06,
    exemptionThreshold: 500000, // RM 500,000 annual turnover
    registrationRequired: true
  },
  withholding: {
    serviceRate: 0.10,
    rentRate: 0.10,
    interestRate: 0.15
  },
  einvoice: {
    mandatory: true,
    thresholdAmount: 1000000 // RM 1 million
  }
}
```

---

## 🚀 Go-Live Checklist

- [ ] DNS records configured
- [ ] SSL certificates installed
- [ ] Database migrated and tested
- [ ] Environment variables set
- [ ] Backup system configured
- [ ] Monitoring alerts set up
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] LHDN integration tested
- [ ] Payment gateway tested
- [ ] User acceptance testing completed

---

## 📞 Support & Maintenance

### Emergency Contacts
- **System Administrator**: admin@hafjetaccounting.my
- **Technical Support**: support@hafjetaccounting.my
- **Emergency Hotline**: +60-3-XXXX-XXXX

### Maintenance Windows
- **Regular Updates**: Every Sunday 2:00 AM - 4:00 AM MYT
- **Emergency Patches**: As needed with advance notice
- **Database Maintenance**: First Sunday of each month

---

## 📈 Performance Optimization

### CDN Setup (Cloudflare)
```bash
# Configure Cloudflare for static assets
# Enable:
# - Auto Minify (CSS, JS, HTML)
# - Brotli compression
# - Browser Cache TTL: 1 year
# - Edge Cache TTL: 1 month
```

### Database Optimization
```javascript
// Create indexes for better performance
db.transactions.createIndex({ "date": -1, "companyId": 1 })
db.invoices.createIndex({ "invoiceNumber": 1 }, { unique: true })
db.users.createIndex({ "email": 1 }, { unique: true })
db.companies.createIndex({ "ssmNumber": 1 }, { unique: true })
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        npm install
        cd frontend && npm install
        cd ../backend && npm install
    
    - name: Build application
      run: |
        cd frontend && npm run build
        cd ../backend && npm run build
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.4
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/hafjet-accounting
          git pull origin main
          npm install
          cd frontend && npm install && npm run build
          cd ../backend && npm install && npm run build
          pm2 restart hafjet-backend
```

This comprehensive deployment guide covers all aspects of production deployment for the HAFJET Cloud Accounting System in Malaysia. The system is now ready for enterprise-level deployment! 🚀