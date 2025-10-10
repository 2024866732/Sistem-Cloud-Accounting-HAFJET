@echo off
REM install-localstack.bat
REM Automated LocalStack CLI installer for Windows Batch

REM 1. Check Python 3
where python >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Python not found. Please install Python 3 from https://www.python.org/downloads/
  pause
  exit /b 1
) else (
  python --version
  echo [INFO] Python found.
)

REM 2. Check pip
where pip >nul 2>nul
if errorlevel 1 (
  echo [WARN] pip not found. Using python -m pip for installation.
  set PIPCMD=python -m pip
) else (
  set PIPCMD=pip
  %PIPCMD% --version
)

REM 3. Install LocalStack CLI
%PIPCMD% install --upgrade localstack
if errorlevel 1 (
  echo [ERROR] Failed to install LocalStack CLI.
  pause
  exit /b 1
) else (
  echo [INFO] LocalStack CLI installed/upgraded.
)

REM 4. Set persistent environment variables
setx LOCALSTACK_AUTH_TOKEN "ls-kitUDIKa-TupI-DUfE-2300-qajEjemU52f9" >nul
setx AWS_ACCESS_KEY_ID "test" >nul
setx AWS_SECRET_ACCESS_KEY "test" >nul
setx AWS_DEFAULT_REGION "us-east-1" >nul
set LOCALSTACK_AUTH_TOKEN=ls-kitUDIKa-TupI-DUfE-2300-qajEjemU52f9
set AWS_ACCESS_KEY_ID=test
set AWS_SECRET_ACCESS_KEY=test
set AWS_DEFAULT_REGION=us-east-1

REM 5. Install awslocal
%PIPCMD% install awscli-local
if errorlevel 1 (
  echo [ERROR] Failed to install awslocal CLI.
  pause
  exit /b 1
) else (
  echo [INFO] awslocal CLI installed.
)

REM 6. Verify LocalStack installation
localstack --version >nul 2>nul
if errorlevel 1 (
  echo [ERROR] LocalStack CLI verification failed.
  pause
  exit /b 1
) else (
  localstack --version
  echo [INFO] LocalStack CLI version verified.
)

REM 7. Test LocalStack start and create sample S3 bucket
start /b localstack start
ping 127.0.0.1 -n 10 >nul
awslocal s3 mb s3://hafjet-local-bucket
if errorlevel 1 (
  echo [WARN] Failed to create S3 bucket. It may already exist or LocalStack is not ready.
) else (
  echo [INFO] Sample S3 bucket created.
)

echo [INFO] LocalStack CLI setup complete!
pause
