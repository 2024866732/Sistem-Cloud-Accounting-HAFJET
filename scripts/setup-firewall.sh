#!/bin/bash
# ============================================
# HAFJET Cloud Accounting - Firewall Setup
# Configures UFW firewall for production server
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "============================================"
echo "HAFJET Firewall Configuration"
echo "============================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}✗ ERROR: This script must be run as root${NC}"
    echo "Please run: sudo $0"
    exit 1
fi

# Check if UFW is installed
if ! command -v ufw &> /dev/null; then
    echo -e "${YELLOW}Installing UFW...${NC}"
    apt-get update
    apt-get install -y ufw
fi

echo -e "${YELLOW}Configuring UFW firewall...${NC}"
echo ""

# Reset UFW to default
echo "Resetting UFW to default configuration..."
ufw --force reset

# Set default policies
echo "Setting default policies..."
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (CRITICAL - don't lock yourself out!)
echo -e "${GREEN}✓ Allowing SSH (port 22)${NC}"
ufw allow 22/tcp comment 'SSH'

# Allow HTTP
echo -e "${GREEN}✓ Allowing HTTP (port 80)${NC}"
ufw allow 80/tcp comment 'HTTP'

# Allow HTTPS
echo -e "${GREEN}✓ Allowing HTTPS (port 443)${NC}"
ufw allow 443/tcp comment 'HTTPS'

# Optional: Allow custom application port (if not using nginx)
# ufw allow 3000/tcp comment 'Backend API'
# ufw allow 3001/tcp comment 'Backend API Alt'

# Optional: Rate limiting for SSH (prevent brute force)
echo -e "${YELLOW}Setting up rate limiting for SSH...${NC}"
ufw limit 22/tcp comment 'SSH Rate Limit'

# Enable UFW
echo ""
echo -e "${YELLOW}Enabling UFW...${NC}"
ufw --force enable

# Show status
echo ""
echo "============================================"
echo "Firewall Status"
echo "============================================"
ufw status verbose

echo ""
echo "============================================"
echo "Firewall Rules Applied"
echo "============================================"
echo -e "${GREEN}✓ Port 22${NC}  - SSH (rate limited)"
echo -e "${GREEN}✓ Port 80${NC}  - HTTP"
echo -e "${GREEN}✓ Port 443${NC} - HTTPS"
echo -e "${RED}✗ All other${NC} - BLOCKED"
echo ""
echo -e "${GREEN}✓ Firewall configuration complete!${NC}"
echo ""
echo "⚠️  IMPORTANT:"
echo "- Make sure you can still access SSH before closing this session"
echo "- To disable: sudo ufw disable"
echo "- To check status: sudo ufw status"
echo "- To add rule: sudo ufw allow <port>/tcp"
echo ""
