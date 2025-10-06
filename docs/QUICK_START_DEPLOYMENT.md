# Quick Start Deployment Guide - HAFJET Cloud Accounting

## 🚀 Quick Deployment (5 Minutes)

### Prerequisites
- Docker & Docker Compose installed
- Git installed
- Server with at least 4GB RAM
- Domain configured (optional)

---

## 📦 Option 1: Development/Testing Deployment

**Perfect for:** Local testing, development, POC demos

```bash
# 1. Clone repository
git clone https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET.git
cd Sistem-Cloud-Accounting-HAFJET

# 2. Start all services
docker-compose up -d

# 3. Wait for services to start (30 seconds)
docker-compose ps

# 4. Access application
# Frontend: http://localhost:8080
# Backend API: http://localhost:3000/api
# Health check: http://localhost:3000/api/health
```

**That's it!** 🎉 The application is running with:
- MongoDB on port 27017
- Redis on port 6379
- Backend on port 3000
- Frontend on port 8080

---

## 🏭 Option 2: Production Deployment

**Perfect for:** Production servers, staging environments

### Step 1: Generate Secrets

```bash
# Generate JWT secret (save this!)
openssl rand -base64 32

# Example output: 
# kX7yJ9mP4nQ8wT2vL5zR1aS6dF3gH0jK9bN8cM7xV4yU
```

### Step 2: Create Environment File

Create `.env` file in project root:

```bash
# Copy example and edit
cp .env.example .env
nano .env  # or use your favorite editor
```

**Minimum required values:**
```bash
# .env
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_URL=https://app.yourdomain.com
GRAFANA_ADMIN_PASSWORD=your-secure-password
```

Create `backend/.env`:

```bash
cd backend
cp .env.example .env
nano .env
```

**Critical values:**
```bash
# backend/.env
NODE_ENV=production
PORT=3001
MONGO_URI=mongodb://mongo:27017/hafjet-bukku
JWT_SECRET=kX7yJ9mP4nQ8wT2vL5zR1aS6dF3gH0jK9bN8cM7xV4yU  # Use generated secret!
FRONTEND_URL=https://app.yourdomain.com
```

### Step 3: Deploy

```bash
# From project root
cd deploy

# Start production stack
docker-compose -f docker-compose.prod.yml up -d

# Verify all services running
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Step 4: Verify

```bash
# Health check
curl http://localhost:3001/api/health

# Should return: {"status":"ok","timestamp":"..."}
```

### Step 5: Access Application

- **Frontend:** http://your-server-ip:80
- **Backend API:** http://your-server-ip:3001/api
- **Grafana:** http://your-server-ip:3000 (username: admin, password: from .env)
- **Prometheus:** http://your-server-ip:9090

---

## 🔐 Quick Security Setup

### 1. Change Default Passwords

```bash
# Generate secure passwords
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 24  # For database passwords
openssl rand -base64 16  # For Grafana admin
```

### 2. Configure Firewall

```bash
# Ubuntu/Debian with UFW
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 22/tcp    # SSH
sudo ufw enable
```

### 3. Setup SSL (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d app.yourdomain.com -d api.yourdomain.com

# Auto-renewal is configured automatically!
```

---

## 📊 Monitoring Access

### Grafana Dashboard
1. Open http://your-server:3000
2. Login with:
   - Username: `admin`
   - Password: (from `GRAFANA_ADMIN_PASSWORD` in .env)
3. Navigate to Dashboards → Browse
4. View pre-configured dashboards

### Prometheus Metrics
- Open http://your-server:9090
- Query metrics: `http_requests_total`, `mongodb_connections`, etc.

---

## 🗄️ Database Backup

### Manual Backup

```bash
# Quick backup
docker-compose -f deploy/docker-compose.prod.yml exec backend npm run backup

# Backup will be saved to: backend/backups/YYYY-MM-DDTHH-mm-ss-SSSZ/
```

### Automated Daily Backups

```bash
# Add to crontab
crontab -e

# Add this line (backup at 2 AM daily):
0 2 * * * cd /path/to/Sistem-Cloud-Accounting-HAFJET && docker-compose -f deploy/docker-compose.prod.yml exec -T backend npm run backup
```

### Restore from Backup

```bash
# List backups
ls backend/backups/

# Restore specific backup
docker-compose -f deploy/docker-compose.prod.yml exec backend npm run restore -- backups/2025-10-06T02-00-00-000Z
```

---

## 🔄 Updates & Maintenance

### Update to Latest Version

```bash
# Pull latest code
git pull origin main

# Pull new images (if using registry)
docker-compose -f deploy/docker-compose.prod.yml pull

# Restart services with new images
docker-compose -f deploy/docker-compose.prod.yml up -d

# Check logs
docker-compose -f deploy/docker-compose.prod.yml logs -f
```

### View Logs

```bash
# All services
docker-compose -f deploy/docker-compose.prod.yml logs -f

# Specific service
docker-compose -f deploy/docker-compose.prod.yml logs -f backend
docker-compose -f deploy/docker-compose.prod.yml logs -f frontend

# Last 100 lines
docker-compose -f deploy/docker-compose.prod.yml logs --tail=100
```

### Restart Services

```bash
# Restart all
docker-compose -f deploy/docker-compose.prod.yml restart

# Restart specific service
docker-compose -f deploy/docker-compose.prod.yml restart backend
docker-compose -f deploy/docker-compose.prod.yml restart frontend
```

### Stop Services

```bash
# Stop (keeps data)
docker-compose -f deploy/docker-compose.prod.yml stop

# Stop and remove containers (keeps data)
docker-compose -f deploy/docker-compose.prod.yml down

# Nuclear option: Remove everything including volumes (deletes data!)
docker-compose -f deploy/docker-compose.prod.yml down -v
```

---

## 🆘 Troubleshooting

### Service won't start

```bash
# Check logs
docker-compose -f deploy/docker-compose.prod.yml logs backend

# Check container status
docker-compose -f deploy/docker-compose.prod.yml ps

# Restart service
docker-compose -f deploy/docker-compose.prod.yml restart backend
```

### Database connection issues

```bash
# Check MongoDB is running
docker-compose -f deploy/docker-compose.prod.yml ps mongo

# Test MongoDB connection
docker-compose -f deploy/docker-compose.prod.yml exec mongo mongosh --eval "db.runCommand({ ping: 1 })"

# Check backend can connect
docker-compose -f deploy/docker-compose.prod.yml logs backend | grep -i mongo
```

### Out of disk space

```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a
docker volume prune

# Remove old images
docker image prune -a
```

### Application errors

```bash
# Check backend logs
docker-compose -f deploy/docker-compose.prod.yml logs backend | tail -100

# Check frontend logs
docker-compose -f deploy/docker-compose.prod.yml logs frontend | tail -100

# Restart application
docker-compose -f deploy/docker-compose.prod.yml restart backend frontend
```

---

## 📞 Need Help?

### Documentation
- 📖 [Pre-Deployment Checklist](./PRE_DEPLOYMENT_CHECKLIST.md) - Complete deployment guide
- 📖 [CI Troubleshooting](./CI_TROUBLESHOOTING.md) - CI/CD issues
- 📖 [User Guide](./USER_GUIDE.md) - Application usage

### Common Issues
1. **Port already in use**: Change ports in docker-compose.prod.yml
2. **Permission denied**: Run with `sudo` or add user to docker group
3. **Out of memory**: Increase server RAM or reduce container limits
4. **SSL certificate issues**: Check domain DNS and certificate expiry

### Quick Health Check

```bash
# One-liner to check all services
docker-compose -f deploy/docker-compose.prod.yml ps && \
curl -f http://localhost:3001/api/health && \
echo "✅ All services healthy!"
```

---

## 🎯 Production Checklist (Quick Version)

Before going live, ensure:

- [ ] ✅ JWT_SECRET is strong and secure (generated with `openssl rand`)
- [ ] ✅ All default passwords changed
- [ ] ✅ Firewall configured (only 80, 443, 22 open)
- [ ] ✅ SSL certificates installed (HTTPS)
- [ ] ✅ Daily backups configured
- [ ] ✅ Backup restoration tested once
- [ ] ✅ Monitoring dashboard accessible
- [ ] ✅ Domain DNS configured correctly
- [ ] ✅ Health check endpoint working
- [ ] ✅ Test login and basic functions

**Ready to deploy!** 🚀

---

## 🌟 Quick Tips

1. **Always backup before updating**
   ```bash
   docker-compose exec backend npm run backup
   ```

2. **Monitor disk space** (Docker uses lots!)
   ```bash
   df -h
   docker system df
   ```

3. **Check logs regularly**
   ```bash
   docker-compose logs -f --tail=50
   ```

4. **Keep Docker updated**
   ```bash
   sudo apt update && sudo apt upgrade docker-ce docker-ce-cli
   ```

5. **Test rollback procedure** in staging first!

---

**Happy Deploying!** 🎉

For complete deployment guide, see [PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md)
