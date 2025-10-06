#!/bin/bash
# ============================================
# HAFJET Cloud Accounting - Log Rotation Setup
# Configures logrotate for application logs
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "============================================"
echo "HAFJET Log Rotation Setup"
echo "============================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}✗ ERROR: This script must be run as root${NC}"
    echo "Please run: sudo $0"
    exit 1
fi

# Install logrotate if not installed
if ! command -v logrotate &> /dev/null; then
    echo -e "${YELLOW}Installing logrotate...${NC}"
    apt-get update
    apt-get install -y logrotate
fi

echo -e "${GREEN}✓ Logrotate installed${NC}"
echo ""

# Create logrotate configuration for HAFJET
echo -e "${YELLOW}Creating logrotate configuration...${NC}"

cat > /etc/logrotate.d/hafjet-accounting <<'EOF'
# HAFJET Cloud Accounting - Log Rotation Configuration

# Application logs
/var/log/hafjet-accounting/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        # Reload application if needed
        /usr/bin/docker-compose -f /opt/hafjet-accounting/deploy/docker-compose.prod.yml restart backend >/dev/null 2>&1 || true
    endscript
}

# MongoDB logs (if using host logging)
/var/log/mongodb/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 mongodb mongodb
    sharedscripts
    postrotate
        /bin/kill -SIGUSR1 $(cat /var/run/mongodb/mongod.pid 2>/dev/null) 2>/dev/null || true
    endscript
}

# Redis logs (if using host logging)
/var/log/redis/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 redis redis
    sharedscripts
    postrotate
        /bin/kill -SIGUSR1 $(cat /var/run/redis/redis-server.pid 2>/dev/null) 2>/dev/null || true
    endscript
}

# Nginx logs
/var/log/nginx/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        /usr/sbin/nginx -s reopen >/dev/null 2>&1 || true
    endscript
}

# Docker container logs
/var/lib/docker/containers/*/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
    maxsize 100M
}
EOF

echo -e "${GREEN}✓ Logrotate configuration created${NC}"
echo ""

# Create log directories if they don't exist
echo -e "${YELLOW}Creating log directories...${NC}"
mkdir -p /var/log/hafjet-accounting
chown www-data:www-data /var/log/hafjet-accounting

echo -e "${GREEN}✓ Log directories created${NC}"
echo ""

# Test logrotate configuration
echo -e "${YELLOW}Testing logrotate configuration...${NC}"
logrotate -d /etc/logrotate.d/hafjet-accounting

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Logrotate configuration is valid${NC}"
else
    echo -e "${RED}✗ ERROR: Logrotate configuration is invalid${NC}"
    exit 1
fi

# Force immediate rotation (for testing)
echo ""
echo -n "Do you want to force an immediate log rotation? (yes/no): "
read -r force_rotate

if [ "$force_rotate" = "yes" ]; then
    echo -e "${YELLOW}Forcing log rotation...${NC}"
    logrotate -f /etc/logrotate.d/hafjet-accounting
    echo -e "${GREEN}✓ Log rotation completed${NC}"
fi

# Summary
echo ""
echo "============================================"
echo "Log Rotation Setup Complete"
echo "============================================"
echo ""
echo "Configuration:"
echo "  • Application logs: Rotate daily, keep 7 days"
echo "  • Database logs: Rotate daily, keep 14 days"
echo "  • Nginx logs: Rotate daily, keep 14 days"
echo "  • Docker logs: Rotate daily, keep 7 days, max 100MB"
echo ""
echo "Log locations:"
echo "  • Application: /var/log/hafjet-accounting/"
echo "  • MongoDB: /var/log/mongodb/"
echo "  • Redis: /var/log/redis/"
echo "  • Nginx: /var/log/nginx/"
echo ""
echo "Logrotate runs automatically daily via cron"
echo "To manually rotate: sudo logrotate -f /etc/logrotate.d/hafjet-accounting"
echo ""
echo -e "${GREEN}✓ Log rotation configured successfully!${NC}"
echo ""
