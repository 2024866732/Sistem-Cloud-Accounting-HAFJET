#!/bin/bash
# ============================================
# HAFJET Cloud Accounting - SSL Certificate Setup
# Automated Let's Encrypt SSL certificate setup
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
DOMAIN="${1:-}"
EMAIL="${2:-}"
WEBROOT="/var/www/html"

echo "============================================"
echo "HAFJET SSL Certificate Setup"
echo "============================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}✗ ERROR: This script must be run as root${NC}"
    echo "Please run: sudo $0 <domain> <email>"
    exit 1
fi

# Validate parameters
if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo -e "${RED}✗ ERROR: Missing required parameters${NC}"
    echo ""
    echo "Usage: sudo $0 <domain> <email>"
    echo "Example: sudo $0 app.hafjetaccounting.my admin@hafjetaccounting.my"
    exit 1
fi

echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo ""

# Install certbot
echo -e "${YELLOW}Checking certbot installation...${NC}"
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    if command -v apt-get &> /dev/null; then
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
    elif command -v yum &> /dev/null; then
        yum install -y certbot python3-certbot-nginx
    else
        echo -e "${RED}✗ ERROR: Package manager not supported${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Certbot installed${NC}"
echo ""

# Stop nginx if running (to free port 80)
if systemctl is-active --quiet nginx; then
    echo -e "${YELLOW}Stopping nginx temporarily...${NC}"
    systemctl stop nginx
fi

# Obtain certificate
echo -e "${YELLOW}Obtaining SSL certificate from Let's Encrypt...${NC}"
echo "This may take a few minutes..."
echo ""

certbot certonly \
    --standalone \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    -d "$DOMAIN" \
    --preferred-challenges http

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ SSL certificate obtained successfully!${NC}"
else
    echo ""
    echo -e "${RED}✗ ERROR: Failed to obtain SSL certificate${NC}"
    exit 1
fi

# Setup auto-renewal
echo ""
echo -e "${YELLOW}Setting up automatic renewal...${NC}"

# Test renewal
certbot renew --dry-run

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Auto-renewal configured successfully${NC}"
else
    echo -e "${YELLOW}⚠ WARNING: Auto-renewal test failed${NC}"
fi

# Create nginx SSL configuration
echo ""
echo -e "${YELLOW}Creating nginx SSL configuration...${NC}"

cat > /etc/nginx/sites-available/$DOMAIN <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    # Redirect to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Proxy to backend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

# Test nginx configuration
echo ""
echo -e "${YELLOW}Testing nginx configuration...${NC}"
nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nginx configuration valid${NC}"
    
    # Start nginx
    systemctl start nginx
    systemctl enable nginx
    
    echo -e "${GREEN}✓ Nginx started${NC}"
else
    echo -e "${RED}✗ ERROR: Nginx configuration invalid${NC}"
    exit 1
fi

# Summary
echo ""
echo "============================================"
echo "SSL Setup Complete"
echo "============================================"
echo ""
echo -e "${GREEN}✓ SSL certificate obtained${NC}"
echo -e "${GREEN}✓ Auto-renewal configured${NC}"
echo -e "${GREEN}✓ Nginx configured with SSL${NC}"
echo -e "${GREEN}✓ HTTPS redirect enabled${NC}"
echo ""
echo "Certificate details:"
echo "  Domain: $DOMAIN"
echo "  Certificate: /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
echo "  Private Key: /etc/letsencrypt/live/$DOMAIN/privkey.pem"
echo "  Expires: 90 days (auto-renews)"
echo ""
echo "Test your site: https://$DOMAIN"
echo ""
echo "⚠️  IMPORTANT:"
echo "- Certificate renews automatically every 60 days"
echo "- To manually renew: sudo certbot renew"
echo "- To check renewal: sudo certbot renew --dry-run"
echo ""
