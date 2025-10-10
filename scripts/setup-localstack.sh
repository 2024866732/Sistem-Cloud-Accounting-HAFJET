#!/usr/bin/env bash
# setup-localstack.sh - LocalStack installer for WSL/user-only (no sudo)
set -e

INFO() { echo -e "[INFO] $1"; }
ERROR() { echo -e "[ERROR] $1" >&2; }

# 1. Check python3
if ! command -v python3 &>/dev/null; then
  ERROR "python3 not found. Please install Python 3 manually (no sudo)."
  exit 1
else
  INFO "python3 found: $(python3 --version)"
fi

# 2. Check pip3, install to user dir if missing
if ! command -v pip3 &>/dev/null; then
  INFO "pip3 not found. Installing pip locally (no sudo)..."
  curl -sS https://bootstrap.pypa.io/get-pip.py -o get-pip.py
  python3 get-pip.py --user
  rm get-pip.py
  INFO "pip3 installed to user directory."
else
  INFO "pip3 found: $(pip3 --version)"
fi

# 3. Ensure ~/.local/bin in PATH
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
  INFO "Adding ~/.local/bin to PATH in ~/.bashrc..."
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
  export PATH="$HOME/.local/bin:$PATH"
fi

# 4. Install LocalStack CLI, awslocal, AWS CLI (user only)
INFO "Installing LocalStack CLI (user)..."
pip3 install --user --upgrade localstack
INFO "Installing awslocal CLI (user)..."
pip3 install --user awscli-local
INFO "Installing AWS CLI (user)..."
pip3 install --user awscli

# 5. Export environment variables to ~/.bashrc
INFO "Exporting environment variables to ~/.bashrc..."
cat >> "$HOME/.bashrc" <<EOF
# LocalStack CLI setup
export LOCALSTACK_AUTH_TOKEN="ls-kitUDIKa-TupI-DUfE-2300-qajEjemU52f9"
export AWS_ACCESS_KEY_ID="test"
export AWS_SECRET_ACCESS_KEY="test"
export AWS_DEFAULT_REGION="us-east-1"
EOF
export LOCALSTACK_AUTH_TOKEN="ls-kitUDIKa-TupI-DUfE-2300-qajEjemU52f9"
export AWS_ACCESS_KEY_ID="test"
export AWS_SECRET_ACCESS_KEY="test"
export AWS_DEFAULT_REGION="us-east-1"

# 6. Source ~/.bashrc to update PATH and env vars
source "$HOME/.bashrc"

# 7. Validate install
INFO "Validating LocalStack CLI installation..."
if ! command -v localstack &>/dev/null; then
  ERROR "localstack not found in PATH. Try opening a new shell or manually add ~/.local/bin to PATH."
  exit 1
fi
localstack --version && INFO "LocalStack CLI installed successfully."

# 8. Test LocalStack start and create S3 bucket
INFO "Starting LocalStack in background..."
localstack start -d
sleep 10
INFO "Creating sample S3 bucket (hafjet-local-bucket)..."
awslocal s3 mb s3://hafjet-local-bucket || INFO "Bucket may already exist."

INFO "Setup complete! If any step failed, try running 'export PATH=$HOME/.local/bin:$PATH' and re-run the script. No sudo required."
