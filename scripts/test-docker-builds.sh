#!/bin/bash

# test-docker-builds.sh - Test Docker image builds for HAFJET Cloud Accounting
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
TAG="${TAG:-test}"
SKIP_BACKEND=false
SKIP_FRONTEND=false
NO_CACHE=""
FAILED_BUILDS=0

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-backend)
            SKIP_BACKEND=true
            shift
            ;;
        --skip-frontend)
            SKIP_FRONTEND=true
            shift
            ;;
        --tag)
            TAG="$2"
            shift 2
            ;;
        --no-cache)
            NO_CACHE="--no-cache"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo -e "${CYAN}"
echo "========================================"
echo "HAFJET Docker Build Testing"
echo "========================================"
echo -e "${NC}"

# Check 1: Verify Docker is installed
info "Checking Docker installation..."
if command -v docker &>/dev/null; then
    DOCKER_VERSION=$(docker --version)
    success "Docker is installed: $DOCKER_VERSION"
else
    error "Docker is not installed or not in PATH"
    exit 1
fi

# Check 2: Verify Docker daemon is running
info "Checking Docker daemon..."
if docker ps &>/dev/null; then
    success "Docker daemon is running"
else
    error "Docker daemon is not running. Please start Docker."
    exit 1
fi

# Build Backend Image
if [ "$SKIP_BACKEND" = false ]; then
    echo -e "\n${CYAN}========================================"
    echo "Building Backend Image"
    echo "========================================${NC}\n"
    
    BACKEND_IMAGE="hafjet-backend:$TAG"
    
    info "Building: $BACKEND_IMAGE"
    info "Dockerfile: backend/Dockerfile"
    
    BUILD_START=$(date +%s)
    
    if docker build $NO_CACHE -t "$BACKEND_IMAGE" -f backend/Dockerfile ./backend; then
        BUILD_DURATION=$(($(date +%s) - BUILD_START))
        success "Backend image built successfully in ${BUILD_DURATION}s"
        
        # Get image size
        IMAGE_SIZE=$(docker images "$BACKEND_IMAGE" --format "{{.Size}}")
        info "Image size: $IMAGE_SIZE"
        
        # Verify image can run
        info "Testing backend container startup..."
        CONTAINER_ID=$(docker run -d --rm -e NODE_ENV=production -e PORT=3001 "$BACKEND_IMAGE")
        
        sleep 5
        
        if docker ps | grep -q "$CONTAINER_ID"; then
            success "Backend container started successfully"
            docker stop "$CONTAINER_ID" >/dev/null
        else
            error "Backend container failed to start"
            docker logs "$CONTAINER_ID"
            docker rm -f "$CONTAINER_ID" >/dev/null 2>&1
            ((FAILED_BUILDS++))
        fi
        
        # List layers
        info "Image layers (top 10):"
        docker history "$BACKEND_IMAGE" --format "table {{.CreatedBy}}\t{{.Size}}" --no-trunc=false | head -n 11
        
    else
        error "Backend image build failed"
        ((FAILED_BUILDS++))
    fi
fi

# Build Frontend Image
if [ "$SKIP_FRONTEND" = false ]; then
    echo -e "\n${CYAN}========================================"
    echo "Building Frontend Image"
    echo "========================================${NC}\n"
    
    FRONTEND_IMAGE="hafjet-frontend:$TAG"
    
    info "Building: $FRONTEND_IMAGE"
    info "Dockerfile: frontend/Dockerfile"
    
    BUILD_START=$(date +%s)
    
    if docker build $NO_CACHE -t "$FRONTEND_IMAGE" -f frontend/Dockerfile ./frontend; then
        BUILD_DURATION=$(($(date +%s) - BUILD_START))
        success "Frontend image built successfully in ${BUILD_DURATION}s"
        
        # Get image size
        IMAGE_SIZE=$(docker images "$FRONTEND_IMAGE" --format "{{.Size}}")
        info "Image size: $IMAGE_SIZE"
        
        # Verify image can run
        info "Testing frontend container startup..."
        CONTAINER_ID=$(docker run -d --rm -p 8080:80 "$FRONTEND_IMAGE")
        
        sleep 3
        
        if docker ps | grep -q "$CONTAINER_ID"; then
            success "Frontend container started successfully"
            
            # Test HTTP response
            if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200"; then
                success "Frontend is serving content (HTTP 200)"
            else
                warning "Frontend may not be responding correctly"
            fi
            
            docker stop "$CONTAINER_ID" >/dev/null
        else
            error "Frontend container failed to start"
            docker logs "$CONTAINER_ID"
            docker rm -f "$CONTAINER_ID" >/dev/null 2>&1
            ((FAILED_BUILDS++))
        fi
        
        # List layers
        info "Image layers (top 10):"
        docker history "$FRONTEND_IMAGE" --format "table {{.CreatedBy}}\t{{.Size}}" --no-trunc=false | head -n 11
        
    else
        error "Frontend image build failed"
        ((FAILED_BUILDS++))
    fi
fi

# Security Scanning (if trivy is available)
echo -e "\n${CYAN}========================================"
echo "Security Scanning"
echo "========================================${NC}\n"

if command -v trivy &>/dev/null; then
    TRIVY_VERSION=$(trivy --version | head -n 1)
    info "Trivy is installed: $TRIVY_VERSION"
    
    if [ "$SKIP_BACKEND" = false ]; then
        info "Scanning backend image for vulnerabilities..."
        trivy image --severity HIGH,CRITICAL "hafjet-backend:$TAG" || true
    fi
    
    if [ "$SKIP_FRONTEND" = false ]; then
        info "Scanning frontend image for vulnerabilities..."
        trivy image --severity HIGH,CRITICAL "hafjet-frontend:$TAG" || true
    fi
else
    warning "Trivy not installed. Skipping security scanning."
    info "Install Trivy: https://github.com/aquasecurity/trivy"
fi

# Summary
echo -e "\n${CYAN}========================================"
echo "Build Summary"
echo "========================================${NC}\n"

info "Built images:"
docker images --filter "reference=hafjet-*:$TAG" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

if [ "$FAILED_BUILDS" -eq 0 ]; then
    success "\nAll builds passed successfully!"
    echo -e "\n${CYAN}Next steps:${NC}"
    echo "  1. Tag images for registry: docker tag hafjet-backend:$TAG ghcr.io/username/hafjet-backend:$TAG"
    echo "  2. Push to registry: docker push ghcr.io/username/hafjet-backend:$TAG"
    echo "  3. Deploy to production: kubectl apply -f deploy/k8s/"
    exit 0
else
    error "\n$FAILED_BUILDS build(s) failed. Please check the errors above."
    exit 1
fi
