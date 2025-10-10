#!/usr/bin/env bash
# Manual deployment script for LocalStack (Linux/WSL/Git Bash)
set -e

# Configurable variables
BUILD_DIR="frontend/dist" # Change to your build output folder
S3_BUCKET="${S3_BUCKET:-hafjet-local-bucket}" # Default bucket name
AWS_ENDPOINT="http://localhost:4566"

# AWS credentials (use test values for LocalStack)
export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-test}"
export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-test}"
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-us-east-1}"

# Step 1: Build project
if [ -d "frontend" ]; then
  echo "[INFO] Building frontend..."
  cd frontend && npm install && npm run build && cd ..
fi
if [ -d "backend" ]; then
  echo "[INFO] Building backend..."
  cd backend && npm install && npm run build && cd ..
fi

# Step 2: Create S3 bucket if not exists
aws s3 mb s3://$S3_BUCKET --endpoint-url=$AWS_ENDPOINT || echo "[INFO] Bucket may already exist."

# Step 3: Upload build artefact to S3
if [ -d "$BUILD_DIR" ]; then
  echo "[INFO] Uploading $BUILD_DIR to S3 bucket $S3_BUCKET..."
  aws s3 cp "$BUILD_DIR" s3://$S3_BUCKET/ --recursive --endpoint-url=$AWS_ENDPOINT
else
  echo "[ERROR] Build directory $BUILD_DIR not found!"
  exit 1
fi

# Step 4: Validate artefact exists in S3
aws s3 ls s3://$S3_BUCKET/ --endpoint-url=$AWS_ENDPOINT

# Step 5: Run tests (frontend & backend)
if [ -d "frontend" ]; then
  echo "[INFO] Running frontend tests..."
  cd frontend && npm test || echo "[WARN] Frontend tests failed." && cd ..
fi
if [ -d "backend" ]; then
  echo "[INFO] Running backend tests..."
  cd backend && npm test || echo "[WARN] Backend tests failed." && cd ..
fi

# Step 6: Inform success or failure
if aws s3 ls s3://$S3_BUCKET/ --endpoint-url=$AWS_ENDPOINT | grep -q .; then
  echo "[SUCCESS] Deployment completed and artefact uploaded to S3 bucket $S3_BUCKET."
else
  echo "[FAILURE] Deployment failed or artefact missing in S3 bucket $S3_BUCKET."
  exit 1
fi

# For production deployment, use real AWS endpoint and secure secrets
# export AWS_ACCESS_KEY_ID="<your-aws-access-key>"
# export AWS_SECRET_ACCESS_KEY="<your-aws-secret-key>"
# export AWS_DEFAULT_REGION="<your-region>"
# AWS_ENDPOINT="https://s3.<your-region>.amazonaws.com"
# aws s3 cp <build-folder> s3://<your-prod-bucket>/ --recursive --endpoint-url=$AWS_ENDPOINT
