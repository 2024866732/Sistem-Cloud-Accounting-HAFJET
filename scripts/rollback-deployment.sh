#!/bin/bash
# ============================================
# HAFJET Cloud Accounting - Deployment Rollback
# Quick rollback to previous deployment version
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

BACKUP_DIR="./deploy-backups"
COMPOSE_FILE="deploy/docker-compose.prod.yml"

echo "============================================"
echo "HAFJET Deployment Rollback"
echo "============================================"
echo ""

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}✗ ERROR: No backups found in $BACKUP_DIR${NC}"
    echo "Cannot rollback - no previous deployments saved"
    exit 1
fi

# List available backups
echo "Available backups:"
echo ""
BACKUPS=($(ls -1t $BACKUP_DIR | head -10))

if [ ${#BACKUPS[@]} -eq 0 ]; then
    echo -e "${RED}✗ ERROR: No backup files found${NC}"
    exit 1
fi

# Show backups
for i in "${!BACKUPS[@]}"; do
    echo "$((i+1)). ${BACKUPS[$i]}"
done
echo ""

# Ask which backup to restore
echo -n "Select backup to restore (1-${#BACKUPS[@]}, or 0 to cancel): "
read -r selection

if [ "$selection" = "0" ]; then
    echo "Rollback cancelled"
    exit 0
fi

if [ "$selection" -lt 1 ] || [ "$selection" -gt ${#BACKUPS[@]} ]; then
    echo -e "${RED}✗ ERROR: Invalid selection${NC}"
    exit 1
fi

SELECTED_BACKUP="${BACKUPS[$((selection-1))]}"
BACKUP_PATH="$BACKUP_DIR/$SELECTED_BACKUP"

echo ""
echo -e "${YELLOW}Rolling back to: $SELECTED_BACKUP${NC}"
echo ""
echo "⚠️  WARNING: This will:"
echo "  1. Stop current containers"
echo "  2. Restore previous docker-compose configuration"
echo "  3. Restart containers with previous version"
echo "  4. Database changes will NOT be rolled back (run migration rollback separately)"
echo ""
echo -n "Continue? (yes/no): "
read -r confirm

if [ "$confirm" != "yes" ]; then
    echo "Rollback cancelled"
    exit 0
fi

# Perform rollback
echo ""
echo -e "${YELLOW}Starting rollback process...${NC}"
echo ""

# 1. Backup current state (just in case)
CURRENT_BACKUP="$BACKUP_DIR/before-rollback-$(date +%Y%m%d-%H%M%S).tar.gz"
echo "1. Backing up current state..."
tar -czf "$CURRENT_BACKUP" -C deploy docker-compose.prod.yml
echo -e "${GREEN}✓ Current state backed up to: $CURRENT_BACKUP${NC}"

# 2. Stop current containers
echo ""
echo "2. Stopping current containers..."
docker-compose -f $COMPOSE_FILE down
echo -e "${GREEN}✓ Containers stopped${NC}"

# 3. Restore previous configuration
echo ""
echo "3. Restoring previous configuration..."
tar -xzf "$BACKUP_PATH" -C deploy/
echo -e "${GREEN}✓ Configuration restored${NC}"

# 4. Start containers
echo ""
echo "4. Starting containers with previous version..."
docker-compose -f $COMPOSE_FILE up -d
echo -e "${GREEN}✓ Containers started${NC}"

# 5. Wait for services to be ready
echo ""
echo "5. Waiting for services to be ready..."
sleep 5

# Check if services are running
if docker-compose -f $COMPOSE_FILE ps | grep -q "Up"; then
    echo -e "${GREEN}✓ Services are running${NC}"
else
    echo -e "${RED}✗ WARNING: Some services may not be running${NC}"
    echo "Check with: docker-compose -f $COMPOSE_FILE ps"
fi

# Summary
echo ""
echo "============================================"
echo "Rollback Complete"
echo "============================================"
echo ""
echo -e "${GREEN}✓ Rolled back to: $SELECTED_BACKUP${NC}"
echo -e "${GREEN}✓ Current state saved: $CURRENT_BACKUP${NC}"
echo ""
echo "⚠️  NEXT STEPS:"
echo "  1. Verify application is working: curl http://localhost:3001/health"
echo "  2. Check logs: docker-compose -f $COMPOSE_FILE logs"
echo "  3. If database migrations need rollback, run: npm run migrate:down"
echo "  4. Monitor for issues: docker-compose -f $COMPOSE_FILE ps"
echo ""
echo "To undo this rollback, select backup: $(basename $CURRENT_BACKUP)"
echo ""
