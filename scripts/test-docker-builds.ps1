<#
.SYNOPSIS
    Test Docker image builds for HAFJET Cloud Accounting

.DESCRIPTION
    This script builds backend and frontend Docker images locally, validates them,
    and provides detailed build information including size and security scanning.

.PARAMETER SkipBackend
    Skip building backend image

.PARAMETER SkipFrontend
    Skip building frontend image

.PARAMETER Tag
    Docker image tag (default: test)

.PARAMETER NoBuildCache
    Build without using cache

.EXAMPLE
    .\scripts\test-docker-builds.ps1
    .\scripts\test-docker-builds.ps1 -Tag "latest" -NoBuildCache

.NOTES
    Author: HAFJET Development Team
    Date: 2025
#>

param(
    [switch]$SkipBackend,
    [switch]$SkipFrontend,
    [string]$Tag = "test",
    [switch]$NoBuildCache
)

$ErrorActionPreference = "Stop"

# Colors
function Write-Success { Write-Host "✓ $args" -ForegroundColor Green }
function Write-Warning { Write-Host "⚠ $args" -ForegroundColor Yellow }
function Write-Error { Write-Host "✗ $args" -ForegroundColor Red }
function Write-Info { Write-Host "ℹ $args" -ForegroundColor Cyan }

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "HAFJET Docker Build Testing" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$BuildCache = if ($NoBuildCache) { "--no-cache" } else { "" }
$FailedBuilds = 0

# Check 1: Verify Docker is installed
Write-Info "Checking Docker installation..."
try {
    $dockerVersion = docker --version
    Write-Success "Docker is installed: $dockerVersion"
} catch {
    Write-Error "Docker is not installed or not in PATH"
    exit 1
}

# Check 2: Verify Docker daemon is running
Write-Info "Checking Docker daemon..."
try {
    docker ps | Out-Null
    Write-Success "Docker daemon is running"
} catch {
    Write-Error "Docker daemon is not running. Please start Docker."
    exit 1
}

# Build Backend Image
if (-not $SkipBackend) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Building Backend Image" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    $BackendImage = "hafjet-backend:$Tag"
    
    Write-Info "Building: $BackendImage"
    Write-Info "Dockerfile: backend/Dockerfile"
    
    try {
        $buildStart = Get-Date
        
        if ($NoBuildCache) {
            docker build --no-cache -t $BackendImage -f backend/Dockerfile ./backend
        } else {
            docker build -t $BackendImage -f backend/Dockerfile ./backend
        }
        
        $buildDuration = (Get-Date) - $buildStart
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Backend image built successfully in $($buildDuration.TotalSeconds.ToString('F2')) seconds"
            
            # Get image size
            $imageSize = docker images $BackendImage --format "{{.Size}}"
            Write-Info "Image size: $imageSize"
            
            # Verify image can run
            Write-Info "Testing backend container startup..."
            $containerId = docker run -d --rm -e NODE_ENV=production -e PORT=3001 $BackendImage
            
            Start-Sleep -Seconds 5
            
            $containerStatus = docker ps -a --filter "id=$containerId" --format "{{.Status}}"
            
            if ($containerStatus -match "Up") {
                Write-Success "Backend container started successfully"
                docker stop $containerId | Out-Null
            } else {
                Write-Error "Backend container failed to start"
                docker logs $containerId
                docker rm -f $containerId | Out-Null
                $FailedBuilds++
            }
            
            # List layers
            Write-Info "Image layers:"
            docker history $BackendImage --format "table {{.CreatedBy}}\t{{.Size}}" --no-trunc=false | Select-Object -First 10
            
        } else {
            Write-Error "Backend image build failed"
            $FailedBuilds++
        }
    } catch {
        Write-Error "Backend build error: $_"
        $FailedBuilds++
    }
}

# Build Frontend Image
if (-not $SkipFrontend) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Building Frontend Image" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    $FrontendImage = "hafjet-frontend:$Tag"
    
    Write-Info "Building: $FrontendImage"
    Write-Info "Dockerfile: frontend/Dockerfile"
    
    try {
        $buildStart = Get-Date
        
        if ($NoBuildCache) {
            docker build --no-cache -t $FrontendImage -f frontend/Dockerfile ./frontend
        } else {
            docker build -t $FrontendImage -f frontend/Dockerfile ./frontend
        }
        
        $buildDuration = (Get-Date) - $buildStart
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Frontend image built successfully in $($buildDuration.TotalSeconds.ToString('F2')) seconds"
            
            # Get image size
            $imageSize = docker images $FrontendImage --format "{{.Size}}"
            Write-Info "Image size: $imageSize"
            
            # Verify image can run
            Write-Info "Testing frontend container startup..."
            $containerId = docker run -d --rm -p 8080:80 $FrontendImage
            
            Start-Sleep -Seconds 3
            
            $containerStatus = docker ps -a --filter "id=$containerId" --format "{{.Status}}"
            
            if ($containerStatus -match "Up") {
                Write-Success "Frontend container started successfully"
                
                # Test HTTP response
                try {
                    $response = Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing -TimeoutSec 5
                    if ($response.StatusCode -eq 200) {
                        Write-Success "Frontend is serving content (HTTP 200)"
                    } else {
                        Write-Warning "Frontend returned HTTP $($response.StatusCode)"
                    }
                } catch {
                    Write-Warning "Could not connect to frontend: $_"
                }
                
                docker stop $containerId | Out-Null
            } else {
                Write-Error "Frontend container failed to start"
                docker logs $containerId
                docker rm -f $containerId | Out-Null
                $FailedBuilds++
            }
            
            # List layers
            Write-Info "Image layers:"
            docker history $FrontendImage --format "table {{.CreatedBy}}\t{{.Size}}" --no-trunc=false | Select-Object -First 10
            
        } else {
            Write-Error "Frontend image build failed"
            $FailedBuilds++
        }
    } catch {
        Write-Error "Frontend build error: $_"
        $FailedBuilds++
    }
}

# Security Scanning (if trivy is available)
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Security Scanning" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

try {
    $trivyVersion = trivy --version 2>$null
    Write-Info "Trivy is installed: $trivyVersion"
    
    if (-not $SkipBackend) {
        Write-Info "Scanning backend image for vulnerabilities..."
        trivy image --severity HIGH,CRITICAL "hafjet-backend:$Tag"
    }
    
    if (-not $SkipFrontend) {
        Write-Info "Scanning frontend image for vulnerabilities..."
        trivy image --severity HIGH,CRITICAL "hafjet-frontend:$Tag"
    }
} catch {
    Write-Warning "Trivy not installed. Skipping security scanning."
    Write-Info "Install Trivy: https://github.com/aquasecurity/trivy"
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Build Summary" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Info "Built images:"
docker images --filter "reference=hafjet-*:$Tag" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

if ($FailedBuilds -eq 0) {
    Write-Success "`nAll builds passed successfully!"
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "  1. Tag images for registry: docker tag hafjet-backend:$Tag ghcr.io/username/hafjet-backend:$Tag" -ForegroundColor Gray
    Write-Host "  2. Push to registry: docker push ghcr.io/username/hafjet-backend:$Tag" -ForegroundColor Gray
    Write-Host "  3. Deploy to production: kubectl apply -f deploy/k8s/" -ForegroundColor Gray
    exit 0
} else {
    Write-Error "`n$FailedBuilds build(s) failed. Please check the errors above."
    exit 1
}
