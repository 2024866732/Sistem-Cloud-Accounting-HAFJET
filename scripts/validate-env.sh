#!/bin/bash
# ============================================
# HAFJET Cloud Accounting - Environment Validator
# Validates all required environment variables before deployment
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

echo "============================================"
echo "HAFJET Environment Validation"
echo "============================================"
echo ""

# Function to check if variable is set
check_required() {
    local var_name=$1
    local var_value=$2
    local min_length=${3:-1}
    
    if [ -z "$var_value" ]; then
        echo -e "${RED}✗ ERROR: $var_name is not set${NC}"
        ((ERRORS++))
        return 1
    elif [ ${#var_value} -lt $min_length ]; then
        echo -e "${RED}✗ ERROR: $var_name is too short (min: $min_length chars)${NC}"
        ((ERRORS++))
        return 1
    else
        echo -e "${GREEN}✓ $var_name is set${NC}"
        return 0
    fi
}

# Function to check optional variable
check_optional() {
    local var_name=$1
    local var_value=$2
    
    if [ -z "$var_value" ]; then
        echo -e "${YELLOW}⚠ WARNING: $var_name is not set (optional)${NC}"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✓ $var_name is set${NC}"
    fi
}

# Function to validate URL format
check_url() {
    local var_name=$1
    local var_value=$2
    local is_required=$3
    
    if [ -z "$var_value" ]; then
        if [ "$is_required" = "true" ]; then
            echo -e "${RED}✗ ERROR: $var_name (URL) is not set${NC}"
            ((ERRORS++))
        else
            echo -e "${YELLOW}⚠ WARNING: $var_name (URL) is not set${NC}"
            ((WARNINGS++))
        fi
        return
    fi
    
    if [[ ! "$var_value" =~ ^https?:// ]]; then
        echo -e "${RED}✗ ERROR: $var_name is not a valid URL (must start with http:// or https://)${NC}"
        ((ERRORS++))
    else
        echo -e "${GREEN}✓ $var_name is valid URL${NC}"
    fi
}

# Load .env file if it exists
if [ -f ".env.production" ]; then
    echo "Loading .env.production..."
    export $(cat .env.production | grep -v '^#' | xargs)
elif [ -f ".env" ]; then
    echo "Loading .env..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}No .env file found. Checking system environment...${NC}"
fi

echo ""
echo "=== Critical Backend Variables ==="
check_required "NODE_ENV" "$NODE_ENV"
check_required "PORT" "$PORT"
check_required "JWT_SECRET" "$JWT_SECRET" 32
check_required "MONGO_URI" "$MONGO_URI" 20
check_url "FRONTEND_URL" "$FRONTEND_URL" true

echo ""
echo "=== Database Configuration ==="
if [ -n "$MONGO_URI" ]; then
    if [[ "$MONGO_URI" =~ mongodb:// ]]; then
        echo -e "${GREEN}✓ MongoDB URI format valid${NC}"
    else
        echo -e "${RED}✗ ERROR: MONGO_URI must start with mongodb://${NC}"
        ((ERRORS++))
    fi
fi

echo ""
echo "=== Redis Configuration ==="
check_optional "REDIS_URL" "$REDIS_URL"

echo ""
echo "=== Security Configuration ==="
if [ -n "$JWT_SECRET" ] && [ ${#JWT_SECRET} -ge 32 ]; then
    echo -e "${GREEN}✓ JWT_SECRET length is secure (${#JWT_SECRET} chars)${NC}"
elif [ -n "$JWT_SECRET" ]; then
    echo -e "${YELLOW}⚠ WARNING: JWT_SECRET should be at least 32 characters (current: ${#JWT_SECRET})${NC}"
    ((WARNINGS++))
fi

echo ""
echo "=== Malaysian Tax Configuration ==="
check_optional "SST_RATE" "$SST_RATE"
check_optional "GST_RATE" "$GST_RATE"

if [ -n "$SST_RATE" ]; then
    if [[ "$SST_RATE" == "0.06" ]]; then
        echo -e "${GREEN}✓ SST_RATE is set to 6% (correct)${NC}"
    else
        echo -e "${YELLOW}⚠ WARNING: SST_RATE is $SST_RATE, expected 0.06 (6%)${NC}"
        ((WARNINGS++))
    fi
fi

echo ""
echo "=== Optional Services ==="
check_optional "LHDN_API_KEY" "$LHDN_API_KEY"
check_optional "EMAIL_HOST" "$EMAIL_HOST"
check_optional "SENTRY_DSN" "$SENTRY_DSN"

echo ""
echo "=== Frontend Configuration ==="
check_url "VITE_API_URL" "$VITE_API_URL" true
check_url "VITE_APP_URL" "$VITE_APP_URL" true

echo ""
echo "============================================"
echo "Validation Summary"
echo "============================================"
echo -e "Errors: ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}✗ VALIDATION FAILED${NC}"
    echo "Please fix all errors before deploying to production."
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠ VALIDATION PASSED WITH WARNINGS${NC}"
    echo "Consider addressing warnings for optimal configuration."
    exit 0
else
    echo -e "${GREEN}✓ VALIDATION PASSED${NC}"
    echo "All checks passed! Ready for deployment."
    exit 0
fi
