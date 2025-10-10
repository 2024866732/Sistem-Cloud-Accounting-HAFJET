#!/bin/bash
# =============================================================================
# Pre-Deployment Validation Script (Bash version)
# =============================================================================
# Script ini akan validate semua requirements sebelum push ke Git
# Run script ini sebelum setiap deployment untuk ensure quality
#
# Usage: ./scripts/pre-deploy-check.sh
# =============================================================================

set +e

ERROR_COUNT=0
WARNING_COUNT=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

function check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
}

function check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((ERROR_COUNT++))
}

function check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNING_COUNT++))
}

function check_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

echo -e "${CYAN}"
echo "🔍 HAFJET Bukku - Pre-Deployment Validation"
echo "============================================================"
echo -e "${NC}"

# =============================================================================
# Check 1: GitHub CLI & Authentication
# =============================================================================
echo -e "${YELLOW}1️⃣ Checking GitHub CLI...${NC}"

if command -v gh &> /dev/null; then
    GH_VERSION=$(gh --version | head -n1)
    check_pass "GitHub CLI installed: $GH_VERSION"
    
    if gh auth status &> /dev/null; then
        check_pass "GitHub authenticated"
    else
        check_fail "GitHub not authenticated - run 'gh auth login'"
    fi
else
    check_fail "GitHub CLI not found - install from https://cli.github.com"
fi

# =============================================================================
# Check 2: Required Secrets
# =============================================================================
echo -e "\n${YELLOW}2️⃣ Checking GitHub Secrets...${NC}"

if command -v gh &> /dev/null; then
    SECRETS=$(gh secret list 2>&1)
    
    if echo "$SECRETS" | grep -q "RAILWAY_TOKEN"; then
        check_pass "RAILWAY_TOKEN secret found"
    else
        check_fail "RAILWAY_TOKEN secret missing"
    fi
    
    if echo "$SECRETS" | grep -q "RAILWAY_PROJECT"; then
        check_pass "RAILWAY_PROJECT secret found"
    else
        check_fail "RAILWAY_PROJECT secret missing"
    fi
else
    check_fail "Cannot check secrets - GitHub CLI not available"
fi

# =============================================================================
# Check 3: Workflow YAML Syntax
# =============================================================================
echo -e "\n${YELLOW}3️⃣ Validating Workflow YAML...${NC}"

WORKFLOW_DIR=".github/workflows"
if [ -d "$WORKFLOW_DIR" ]; then
    YAML_COUNT=0
    
    for file in "$WORKFLOW_DIR"/*.yml; do
        if [ -f "$file" ]; then
            ((YAML_COUNT++))
            
            # Check for inline comments after run:
            if grep -E '^\s+run:.*#' "$file" > /dev/null; then
                check_fail "$(basename "$file"): Contains inline comment after 'run:'"
            fi
            
            # Check for LocalStack references
            if grep -iE 'localstack|--endpoint-url.*4566' "$file" > /dev/null; then
                check_warn "$(basename "$file"): Contains LocalStack references"
            fi
            
            # Check for improper if: syntax
            if grep -E 'if:\s*\$\{\{\s*(success|failure|always)\(\)' "$file" > /dev/null; then
                check_fail "$(basename "$file"): Unnecessary '\${{ }}' in if: expression"
            fi
        fi
    done
    
    check_pass "Analyzed $YAML_COUNT workflow files"
else
    check_fail "Workflow directory not found"
fi

# =============================================================================
# Check 4: Frontend Build
# =============================================================================
echo -e "\n${YELLOW}4️⃣ Testing Frontend...${NC}"

if [ "$1" != "--skip-build" ]; then
    if [ -d "frontend" ]; then
        cd frontend
        
        if [ -f "package.json" ]; then
            check_pass "Frontend package.json found"
            
            echo "   Building frontend (this may take a moment)..."
            if npm run build > /tmp/frontend-build.log 2>&1; then
                check_pass "Frontend build successful"
                
                if [ -d "dist" ]; then
                    check_pass "Frontend dist/ folder created"
                else
                    check_warn "Frontend dist/ folder not found"
                fi
            else
                check_fail "Frontend build failed"
                if [ "$2" == "--verbose" ]; then
                    cat /tmp/frontend-build.log
                fi
            fi
        else
            check_fail "Frontend package.json not found"
        fi
        
        cd ..
    else
        check_fail "Frontend directory not found"
    fi
else
    check_info "Frontend build check skipped (--skip-build)"
fi

# =============================================================================
# Check 5: Backend Build
# =============================================================================
echo -e "\n${YELLOW}5️⃣ Testing Backend...${NC}"

if [ "$1" != "--skip-build" ]; then
    if [ -d "backend" ]; then
        cd backend
        
        if [ -f "package.json" ]; then
            check_pass "Backend package.json found"
            
            echo "   Building backend (this may take a moment)..."
            if npm run build > /tmp/backend-build.log 2>&1; then
                check_pass "Backend build successful"
            else
                check_fail "Backend build failed"
                if [ "$2" == "--verbose" ]; then
                    cat /tmp/backend-build.log
                fi
            fi
        else
            check_fail "Backend package.json not found"
        fi
        
        cd ..
    else
        check_fail "Backend directory not found"
    fi
else
    check_info "Backend build check skipped (--skip-build)"
fi

# =============================================================================
# Check 6: Railway CLI (Optional)
# =============================================================================
echo -e "\n${YELLOW}6️⃣ Checking Railway CLI...${NC}"

if command -v railway &> /dev/null; then
    RAILWAY_VERSION=$(railway --version 2>&1)
    check_pass "Railway CLI installed: $RAILWAY_VERSION"
    
    if railway status &> /dev/null; then
        check_pass "Railway project linked"
    else
        check_info "Railway project not linked (optional for CI)"
    fi
else
    check_info "Railway CLI not installed (optional for CI)"
fi

# =============================================================================
# Check 7: Git Status
# =============================================================================
echo -e "\n${YELLOW}7️⃣ Checking Git Status...${NC}"

if command -v git &> /dev/null; then
    GIT_STATUS=$(git status --porcelain 2>&1)
    
    if [ -n "$GIT_STATUS" ]; then
        FILE_COUNT=$(echo "$GIT_STATUS" | wc -l)
        check_info "$FILE_COUNT uncommitted file(s)"
        
        # Check for potential secrets
        if git diff | grep -iE '(secret|token|password|api_key|private_key)' > /dev/null; then
            check_warn "Potential secrets in uncommitted changes - review carefully!"
        fi
    else
        check_pass "Working directory clean"
    fi
    
    BRANCH=$(git branch --show-current 2>&1)
    check_info "Current branch: $BRANCH"
else
    check_fail "Git not available"
fi

# =============================================================================
# Check 8: Required Files
# =============================================================================
echo -e "\n${YELLOW}8️⃣ Checking Required Files...${NC}"

REQUIRED_FILES=(
    ".github/workflows/deploy.yml"
    ".github/workflows/monitor-deploy.yml"
    "frontend/package.json"
    "backend/package.json"
    "README.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_pass "$file exists"
    else
        check_fail "$file missing"
    fi
done

# =============================================================================
# Summary
# =============================================================================
echo -e "\n${CYAN}============================================================${NC}"

if [ $ERROR_COUNT -eq 0 ] && [ $WARNING_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED - Safe to deploy!${NC}\n"
    echo -e "${CYAN}Next steps:${NC}"
    echo "  git add ."
    echo "  git commit -m 'your message'"
    echo "  git push origin main"
    echo "  gh run watch"
    exit 0
    
elif [ $ERROR_COUNT -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNING_COUNT WARNING(S) - Review before deploying${NC}\n"
    echo "You can proceed, but review warnings carefully."
    exit 0
    
else
    echo -e "${RED}❌ $ERROR_COUNT ERROR(S) found - Fix before deploying!${NC}"
    if [ $WARNING_COUNT -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNING_COUNT WARNING(S) also found${NC}"
    fi
    echo -e "\nFix the errors above before pushing to Git."
    echo "Run with --verbose flag for detailed error messages."
    exit 1
fi
