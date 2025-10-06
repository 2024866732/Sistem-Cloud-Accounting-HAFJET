# Simple secure secret generator for HAFJET Cloud Accounting
# This script generates cryptographically secure secrets

Write-Host "==================================================="
Write-Host "Generating Secure Secrets for HAFJET Cloud Accounting"
Write-Host "==================================================="
Write-Host ""

# Generate secure random string using .NET crypto
function New-SecurePassword {
    param([int]$Length = 32)
    
    $bytes = New-Object byte[] $Length
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    $secret = [Convert]::ToBase64String($bytes) -replace '[^a-zA-Z0-9]', ''
    
    # Ensure we have enough characters
    while ($secret.Length -lt $Length) {
        $moreBytes = New-Object byte[] $Length
        $rng.GetBytes($moreBytes)
        $secret += [Convert]::ToBase64String($moreBytes) -replace '[^a-zA-Z0-9]', ''
    }
    
    return $secret.Substring(0, $Length)
}

Write-Host "Generating JWT Secret (32 characters)..."
$JWT_SECRET = New-SecurePassword -Length 32
Write-Host "Generated: $JWT_SECRET"
Write-Host ""

Write-Host "Generating MongoDB Password (24 characters)..."
$MONGO_PASSWORD = New-SecurePassword -Length 24
Write-Host "Generated: $MONGO_PASSWORD"
Write-Host ""

Write-Host "Generating Redis Password (16 characters)..."
$REDIS_PASSWORD = New-SecurePassword -Length 16
Write-Host "Generated: $REDIS_PASSWORD"
Write-Host ""

Write-Host "Generating Grafana Admin Password (16 characters)..."
$GRAFANA_PASSWORD = New-SecurePassword -Length 16
Write-Host "Generated: $GRAFANA_PASSWORD"
Write-Host ""

Write-Host "==================================================="
Write-Host "COPY THESE TO YOUR PASSWORD MANAGER NOW!"
Write-Host "==================================================="
Write-Host ""
Write-Host "JWT_SECRET=$JWT_SECRET"
Write-Host "MONGO_ROOT_PASSWORD=$MONGO_PASSWORD"
Write-Host "REDIS_PASSWORD=$REDIS_PASSWORD"
Write-Host "GRAFANA_ADMIN_PASSWORD=$GRAFANA_PASSWORD"
Write-Host ""
Write-Host "Press any key to continue and create .env files..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
