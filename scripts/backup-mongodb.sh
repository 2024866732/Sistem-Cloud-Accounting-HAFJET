#!/bin/bash
# ============================================
# HAFJET Cloud Accounting - Automated Backup
# This script creates secure backups of MongoDB
# ============================================

set -e

# Configuration
BACKUP_ROOT="./backups"
BACKUP_DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="${BACKUP_ROOT}/${BACKUP_DATE}"
RETENTION_DAYS=7
RETENTION_WEEKS=4
RETENTION_MONTHS=12

# MongoDB Configuration (from .env)
MONGO_HOST="${MONGO_HOST:-localhost}"
MONGO_PORT="${MONGO_PORT:-27017}"
MONGO_DB="${MONGO_DB:-hafjet-bukku}"
MONGO_USER="${MONGO_USER:-admin}"
MONGO_PASSWORD="${MONGO_PASSWORD:-}"

# S3/Remote Backup Configuration (optional)
S3_BUCKET="${S3_BUCKET:-}"
REMOTE_BACKUP_ENABLED="${REMOTE_BACKUP_ENABLED:-false}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "============================================"
echo "HAFJET Cloud Accounting - MongoDB Backup"
echo "Started: $(date)"
echo "============================================"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Perform MongoDB backup
echo -e "${YELLOW}Creating MongoDB backup...${NC}"
if [ -n "$MONGO_PASSWORD" ]; then
    mongodump \
        --host="${MONGO_HOST}" \
        --port="${MONGO_PORT}" \
        --db="${MONGO_DB}" \
        --username="${MONGO_USER}" \
        --password="${MONGO_PASSWORD}" \
        --authenticationDatabase=admin \
        --out="${BACKUP_DIR}"
else
    mongodump \
        --host="${MONGO_HOST}" \
        --port="${MONGO_PORT}" \
        --db="${MONGO_DB}" \
        --out="${BACKUP_DIR}"
fi

# Compress backup
echo -e "${YELLOW}Compressing backup...${NC}"
tar -czf "${BACKUP_DIR}.tar.gz" -C "${BACKUP_ROOT}" "${BACKUP_DATE}"
rm -rf "${BACKUP_DIR}"

# Calculate backup size
BACKUP_SIZE=$(du -h "${BACKUP_DIR}.tar.gz" | cut -f1)
echo -e "${GREEN}✓ Backup created: ${BACKUP_DIR}.tar.gz (${BACKUP_SIZE})${NC}"

# Upload to S3 if configured
if [ "$REMOTE_BACKUP_ENABLED" = "true" ] && [ -n "$S3_BUCKET" ]; then
    echo -e "${YELLOW}Uploading to S3...${NC}"
    aws s3 cp "${BACKUP_DIR}.tar.gz" "s3://${S3_BUCKET}/backups/"
    echo -e "${GREEN}✓ Uploaded to S3${NC}"
fi

# Cleanup old backups - Daily (keep 7 days)
echo -e "${YELLOW}Cleaning up old daily backups (keeping ${RETENTION_DAYS} days)...${NC}"
find "${BACKUP_ROOT}" -name "*.tar.gz" -type f -mtime +${RETENTION_DAYS} -delete

# Create weekly backup (every Sunday)
if [ $(date +%u) -eq 7 ]; then
    WEEKLY_DIR="${BACKUP_ROOT}/weekly"
    mkdir -p "${WEEKLY_DIR}"
    cp "${BACKUP_DIR}.tar.gz" "${WEEKLY_DIR}/backup-$(date +%Y-W%V).tar.gz"
    echo -e "${GREEN}✓ Weekly backup created${NC}"
    
    # Cleanup old weekly backups (keep 4 weeks)
    find "${WEEKLY_DIR}" -name "*.tar.gz" -type f -mtime +$((${RETENTION_WEEKS} * 7)) -delete
fi

# Create monthly backup (first day of month)
if [ $(date +%d) -eq 01 ]; then
    MONTHLY_DIR="${BACKUP_ROOT}/monthly"
    mkdir -p "${MONTHLY_DIR}"
    cp "${BACKUP_DIR}.tar.gz" "${MONTHLY_DIR}/backup-$(date +%Y-%m).tar.gz"
    echo -e "${GREEN}✓ Monthly backup created${NC}"
    
    # Cleanup old monthly backups (keep 12 months)
    find "${MONTHLY_DIR}" -name "*.tar.gz" -type f -mtime +$((${RETENTION_MONTHS} * 30)) -delete
fi

# Generate backup report
echo ""
echo "============================================"
echo "Backup Summary"
echo "============================================"
echo "Backup file: ${BACKUP_DIR}.tar.gz"
echo "Backup size: ${BACKUP_SIZE}"
echo "Database: ${MONGO_DB}"
echo "Host: ${MONGO_HOST}:${MONGO_PORT}"
echo ""
echo "Daily backups: $(find ${BACKUP_ROOT} -maxdepth 1 -name '*.tar.gz' -type f | wc -l)"
echo "Weekly backups: $(find ${BACKUP_ROOT}/weekly -name '*.tar.gz' -type f 2>/dev/null | wc -l || echo 0)"
echo "Monthly backups: $(find ${BACKUP_ROOT}/monthly -name '*.tar.gz' -type f 2>/dev/null | wc -l || echo 0)"
echo ""
echo -e "${GREEN}✓ Backup completed successfully!${NC}"
echo "Finished: $(date)"
echo "============================================"

# Send notification (optional)
if command -v mail &> /dev/null && [ -n "${NOTIFICATION_EMAIL}" ]; then
    echo "Backup completed: ${BACKUP_DIR}.tar.gz (${BACKUP_SIZE})" | \
        mail -s "HAFJET Backup Success - $(date +%Y-%m-%d)" "${NOTIFICATION_EMAIL}"
fi

exit 0
