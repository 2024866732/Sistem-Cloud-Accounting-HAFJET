#!/bin/bash

# verify-migrations.sh - Verify database migrations for HAFJET Cloud Accounting
# Author: HAFJET Development Team

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Functions
success() { echo -e "${GREEN}✓ $1${NC}"; }
error() { echo -e "${RED}✗ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
info() { echo -e "${CYAN}ℹ $1${NC}"; }

# Configuration
MONGO_URI="${MONGODB_URI:-mongodb://localhost:27017/hafjet-bukku}"
BACKEND_DIR="backend"
MIGRATIONS_DIR="$BACKEND_DIR/migrations"
CONFIG_FILE="$BACKEND_DIR/migrate-mongo-config.js"
FAILED_CHECKS=0

echo -e "${CYAN}"
echo "========================================"
echo "HAFJET Database Migrations Verification"
echo "========================================"
echo -e "${NC}"

# Check 1: Verify migrations directory exists
info "Checking migrations directory..."
if [ -d "$MIGRATIONS_DIR" ]; then
    success "Migrations directory exists: $MIGRATIONS_DIR"
else
    error "Migrations directory not found: $MIGRATIONS_DIR"
    ((FAILED_CHECKS++))
fi

# Check 2: Verify migrate-mongo-config.js exists
info "Checking migrate-mongo configuration..."
if [ -f "$CONFIG_FILE" ]; then
    success "Configuration file exists: $CONFIG_FILE"
else
    error "Configuration file not found: $CONFIG_FILE"
    ((FAILED_CHECKS++))
fi

# Check 3: List migration files
info "Listing migration files..."
MIGRATION_COUNT=$(find "$MIGRATIONS_DIR" -name "*.js" ! -name "README.md" 2>/dev/null | wc -l)
if [ "$MIGRATION_COUNT" -gt 0 ]; then
    success "Found $MIGRATION_COUNT migration file(s):"
    find "$MIGRATIONS_DIR" -name "*.js" ! -name "README.md" -exec basename {} \; | while read -r file; do
        echo "  - $file"
    done
else
    warning "No migration files found in $MIGRATIONS_DIR"
fi

# Check 4: Validate migration file structure
info "Validating migration file structure..."
VALID_MIGRATIONS=0
INVALID_MIGRATIONS=0

while IFS= read -r file; do
    if grep -q "exports.up\s*=" "$file" && grep -q "exports.down\s*=" "$file"; then
        success "Valid migration: $(basename "$file")"
        ((VALID_MIGRATIONS++))
    else
        error "Invalid migration: $(basename "$file") (missing up/down functions)"
        ((INVALID_MIGRATIONS++))
        ((FAILED_CHECKS++))
    fi
done < <(find "$MIGRATIONS_DIR" -name "*.js" ! -name "README.md")

echo -e "\n${CYAN}Validation Summary:${NC}"
echo -e "${GREEN}  Valid: $VALID_MIGRATIONS${NC}"
echo -e "${RED}  Invalid: $INVALID_MIGRATIONS${NC}"

# Check 5: Verify Node.js and npm
info "Checking Node.js and npm..."
if command -v node &>/dev/null && command -v npm &>/dev/null; then
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    success "Node.js: $NODE_VERSION, npm: $NPM_VERSION"
else
    error "Node.js or npm not found. Please install Node.js."
    ((FAILED_CHECKS++))
fi

# Check 6: Verify migrate-mongo package
info "Checking migrate-mongo installation..."
cd "$BACKEND_DIR" || exit 1

if grep -q "migrate-mongo" package.json; then
    MIGRATE_VERSION=$(grep "migrate-mongo" package.json | cut -d'"' -f4)
    success "migrate-mongo is in package.json: $MIGRATE_VERSION"
else
    warning "migrate-mongo not found in package.json devDependencies"
    ((FAILED_CHECKS++))
fi

if [ -f "node_modules/.bin/migrate-mongo" ]; then
    success "migrate-mongo CLI is installed"
else
    warning "migrate-mongo CLI not installed. Run 'npm install' in backend/"
fi

cd - >/dev/null || exit 1

# Check 7: Test MongoDB connection
info "Testing MongoDB connection..."
if command -v mongosh &>/dev/null; then
    if mongosh "$MONGO_URI" --eval "db.runCommand({ping: 1})" --quiet &>/dev/null; then
        success "Successfully connected to MongoDB: $MONGO_URI"
    else
        warning "Could not connect to MongoDB: $MONGO_URI"
    fi
elif command -v mongo &>/dev/null; then
    if mongo "$MONGO_URI" --eval "db.runCommand({ping: 1})" --quiet &>/dev/null; then
        success "Successfully connected to MongoDB: $MONGO_URI"
    else
        warning "Could not connect to MongoDB: $MONGO_URI"
    fi
else
    warning "MongoDB shell not found. Cannot test connection."
fi

# Check 8: Run migrate-mongo status
info "Checking migration status..."
cd "$BACKEND_DIR" || exit 1

export MONGODB_URI="$MONGO_URI"
if npx migrate-mongo status 2>/dev/null; then
    success "Migration status check successful"
else
    warning "Failed to check migration status"
fi

cd - >/dev/null || exit 1

# Summary
echo -e "\n${CYAN}========================================"
echo "Verification Summary"
echo "========================================${NC}\n"

if [ "$FAILED_CHECKS" -eq 0 ]; then
    success "All checks passed! Migrations are ready."
    echo -e "\n${CYAN}Next steps:${NC}"
    echo "  1. Run 'cd backend && npx migrate-mongo status' to check applied migrations"
    echo "  2. Run 'npx migrate-mongo up' to apply pending migrations"
    echo "  3. Run 'npx migrate-mongo down' to rollback last migration"
    exit 0
else
    error "\n$FAILED_CHECKS check(s) failed. Please fix the issues above."
    exit 1
fi
