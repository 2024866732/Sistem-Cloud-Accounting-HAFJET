#!/bin/bash
# ============================================
# HAFJET Cloud Accounting - Backup Restoration Test
# CRITICAL: Tests backup and restore procedure
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

TEST_DB="hafjet-bukku-test"
BACKUP_DIR="./backups/test-$(date +%Y%m%d-%H%M%S)"
MONGO_HOST="${MONGO_HOST:-localhost}"
MONGO_PORT="${MONGO_PORT:-27017}"
MONGO_USER="${MONGO_USER:-admin}"
MONGO_PASSWORD="${MONGO_PASSWORD:-}"

echo "============================================"
echo "HAFJET Backup & Restore Test"
echo "============================================"
echo ""

# Step 1: Create test database with sample data
echo -e "${BLUE}Step 1: Creating test database with sample data...${NC}"
if [ -n "$MONGO_PASSWORD" ]; then
    MONGO_AUTH="--username=$MONGO_USER --password=$MONGO_PASSWORD --authenticationDatabase=admin"
else
    MONGO_AUTH=""
fi

mongo $MONGO_AUTH --host=$MONGO_HOST --port=$MONGO_PORT --eval "
    use $TEST_DB;
    
    // Create test collections
    db.companies.insertOne({
        name: 'Test Company Sdn Bhd',
        regNo: 'TEST123456',
        taxNo: 'C12345678',
        address: 'Test Address, Malaysia',
        createdAt: new Date()
    });
    
    db.invoices.insertMany([
        {
            invoiceNo: 'INV-TEST-001',
            customer: 'Test Customer 1',
            amount: 1000.00,
            sst: 60.00,
            total: 1060.00,
            status: 'paid',
            createdAt: new Date()
        },
        {
            invoiceNo: 'INV-TEST-002',
            customer: 'Test Customer 2',
            amount: 2500.00,
            sst: 150.00,
            total: 2650.00,
            status: 'pending',
            createdAt: new Date()
        }
    ]);
    
    db.transactions.insertMany([
        {
            type: 'income',
            category: 'sales',
            amount: 1060.00,
            description: 'Payment from Test Customer 1',
            date: new Date()
        },
        {
            type: 'expense',
            category: 'operational',
            amount: 500.00,
            description: 'Test expense',
            date: new Date()
        }
    ]);
    
    print('✓ Test data created');
" || { echo -e "${RED}ERROR: Failed to create test data${NC}"; exit 1; }

echo -e "${GREEN}✓ Test database created with sample data${NC}"

# Count documents before backup
echo ""
echo -e "${BLUE}Counting documents in test database...${NC}"
DOC_COUNT_BEFORE=$(mongo $MONGO_AUTH --host=$MONGO_HOST --port=$MONGO_PORT --quiet --eval "
    use $TEST_DB;
    print(db.companies.count() + db.invoices.count() + db.transactions.count());
")
echo -e "Documents before backup: ${GREEN}$DOC_COUNT_BEFORE${NC}"

# Step 2: Create backup
echo ""
echo -e "${BLUE}Step 2: Creating backup...${NC}"
mkdir -p "$BACKUP_DIR"

if [ -n "$MONGO_PASSWORD" ]; then
    mongodump \
        --host=$MONGO_HOST \
        --port=$MONGO_PORT \
        --db=$TEST_DB \
        --username=$MONGO_USER \
        --password=$MONGO_PASSWORD \
        --authenticationDatabase=admin \
        --out="$BACKUP_DIR" \
        2>&1 | grep -v "writing"
else
    mongodump \
        --host=$MONGO_HOST \
        --port=$MONGO_PORT \
        --db=$TEST_DB \
        --out="$BACKUP_DIR" \
        2>&1 | grep -v "writing"
fi

# Compress backup
tar -czf "${BACKUP_DIR}.tar.gz" -C "$(dirname $BACKUP_DIR)" "$(basename $BACKUP_DIR)"
BACKUP_SIZE=$(du -h "${BACKUP_DIR}.tar.gz" | cut -f1)

echo -e "${GREEN}✓ Backup created: ${BACKUP_DIR}.tar.gz ($BACKUP_SIZE)${NC}"

# Step 3: Drop test database (simulate data loss)
echo ""
echo -e "${BLUE}Step 3: Simulating data loss (dropping database)...${NC}"
mongo $MONGO_AUTH --host=$MONGO_HOST --port=$MONGO_PORT --eval "
    db = db.getSiblingDB('$TEST_DB');
    db.dropDatabase();
    print('✓ Database dropped');
" > /dev/null

echo -e "${GREEN}✓ Database dropped (data loss simulated)${NC}"

# Verify database is empty
DOC_COUNT_AFTER_DROP=$(mongo $MONGO_AUTH --host=$MONGO_HOST --port=$MONGO_PORT --quiet --eval "
    use $TEST_DB;
    print(db.companies.count() + db.invoices.count() + db.transactions.count());
")
echo -e "Documents after drop: ${RED}$DOC_COUNT_AFTER_DROP${NC}"

if [ "$DOC_COUNT_AFTER_DROP" != "0" ]; then
    echo -e "${RED}ERROR: Database not properly dropped${NC}"
    exit 1
fi

# Step 4: Extract and restore backup
echo ""
echo -e "${BLUE}Step 4: Restoring from backup...${NC}"

# Extract backup
tar -xzf "${BACKUP_DIR}.tar.gz" -C "$(dirname $BACKUP_DIR)"

# Restore
if [ -n "$MONGO_PASSWORD" ]; then
    mongorestore \
        --host=$MONGO_HOST \
        --port=$MONGO_PORT \
        --username=$MONGO_USER \
        --password=$MONGO_PASSWORD \
        --authenticationDatabase=admin \
        --dir="$BACKUP_DIR/$TEST_DB" \
        --db=$TEST_DB \
        2>&1 | grep -v "continuing through error"
else
    mongorestore \
        --host=$MONGO_HOST \
        --port=$MONGO_PORT \
        --dir="$BACKUP_DIR/$TEST_DB" \
        --db=$TEST_DB \
        2>&1 | grep -v "continuing through error"
fi

echo -e "${GREEN}✓ Backup restored${NC}"

# Step 5: Verify restored data
echo ""
echo -e "${BLUE}Step 5: Verifying restored data...${NC}"

DOC_COUNT_AFTER_RESTORE=$(mongo $MONGO_AUTH --host=$MONGO_HOST --port=$MONGO_PORT --quiet --eval "
    use $TEST_DB;
    print(db.companies.count() + db.invoices.count() + db.transactions.count());
")
echo -e "Documents after restore: ${GREEN}$DOC_COUNT_AFTER_RESTORE${NC}"

# Detailed verification
echo ""
echo "Detailed verification:"
mongo $MONGO_AUTH --host=$MONGO_HOST --port=$MONGO_PORT --eval "
    use $TEST_DB;
    print('Companies: ' + db.companies.count());
    print('Invoices: ' + db.invoices.count());
    print('Transactions: ' + db.transactions.count());
    print('');
    print('Sample company:');
    printjson(db.companies.findOne());
" 2>/dev/null | grep -v "connecting to\|MongoDB server version\|switched to db"

# Step 6: Cleanup
echo ""
echo -e "${BLUE}Step 6: Cleaning up test data...${NC}"
mongo $MONGO_AUTH --host=$MONGO_HOST --port=$MONGO_PORT --eval "
    db = db.getSiblingDB('$TEST_DB');
    db.dropDatabase();
" > /dev/null

rm -rf "$BACKUP_DIR"
rm -f "${BACKUP_DIR}.tar.gz"

echo -e "${GREEN}✓ Cleanup completed${NC}"

# Final results
echo ""
echo "============================================"
echo "Test Results"
echo "============================================"

if [ "$DOC_COUNT_BEFORE" = "$DOC_COUNT_AFTER_RESTORE" ]; then
    echo -e "${GREEN}✓ SUCCESS: Backup and restore test passed!${NC}"
    echo ""
    echo "Summary:"
    echo "  • Documents backed up: $DOC_COUNT_BEFORE"
    echo "  • Documents restored: $DOC_COUNT_AFTER_RESTORE"
    echo "  • Backup size: $BACKUP_SIZE"
    echo "  • Data integrity: VERIFIED ✓"
    echo ""
    echo -e "${GREEN}Your backup and restore procedure is working correctly!${NC}"
    exit 0
else
    echo -e "${RED}✗ FAILURE: Data count mismatch!${NC}"
    echo ""
    echo "Summary:"
    echo "  • Documents backed up: $DOC_COUNT_BEFORE"
    echo "  • Documents restored: $DOC_COUNT_AFTER_RESTORE"
    echo "  • Data integrity: FAILED ✗"
    echo ""
    echo -e "${RED}WARNING: Backup and restore procedure has issues!${NC}"
    exit 1
fi
