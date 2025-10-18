# Comprehensive API Testing Script
# Tests registration, login, and protected endpoints

$baseUrl = "https://hafjet-cloud-accounting-system-production.up.railway.app"
$testResults = @()

function Add-TestResult {
    param($testName, $passed, $message, $details = $null)
    $script:testResults += [PSCustomObject]@{
        Test = $testName
        Status = if($passed) { "✅ PASS" } else { "❌ FAIL" }
        Message = $message
        Details = $details
    }
    $color = if($passed) { "Green" } else { "Red" }
    Write-Host "$($script:testResults[-1].Status) $testName - $message" -ForegroundColor $color
}

Write-Host "`n🧪 COMPREHENSIVE API TESTING SUITE" -ForegroundColor Cyan
Write-Host "==================================`n" -ForegroundColor Cyan

# TEST 1: Health Check
Write-Host "TEST 1: Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method GET -TimeoutSec 10
    if ($health.status -eq "OK" -and $health.db -eq "connected") {
        Add-TestResult "Health Check" $true "API and Database operational"
    } else {
        Add-TestResult "Health Check" $false "Health check returned unexpected response"
    }
} catch {
    Add-TestResult "Health Check" $false $_.Exception.Message
}

# TEST 2: User Registration
Write-Host "`nTEST 2: User Registration..." -ForegroundColor Yellow
$timestamp = Get-Date -Format 'HHmmss'
$testEmail = "api.test.$timestamp@hafjet.cloud"
$testPassword = "ApiTest2024!"
$testName = "API Test User $timestamp"
$testCompany = "API Test Company $timestamp"

try {
    $regBody = @{
        email = $testEmail
        password = $testPassword
        name = $testName
        companyName = $testCompany
    } | ConvertTo-Json
    
    $regResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" `
        -Method POST -Body $regBody -ContentType "application/json" -TimeoutSec 15
    
    $isAdmin = $regResponse.data.user.role -eq "admin"
    $hasValidObjectId = $regResponse.data.user.companyId -match "^[0-9a-f]{24}$"
    $hasToken = $regResponse.data.token -ne $null
    
    if ($isAdmin -and $hasValidObjectId -and $hasToken) {
        Add-TestResult "User Registration" $true "User created with admin role and MongoDB ObjectId" `
            "Email: $testEmail, Role: $($regResponse.data.user.role), CompanyId: $($regResponse.data.user.companyId)"
        $testToken = $regResponse.data.token
        $testUserId = $regResponse.data.user.id
        $testCompanyId = $regResponse.data.user.companyId
    } else {
        Add-TestResult "User Registration" $false "Registration succeeded but data incorrect" `
            "Role: $($regResponse.data.user.role), CompanyId: $($regResponse.data.user.companyId)"
    }
} catch {
    Add-TestResult "User Registration" $false $_.Exception.Message $_.ErrorDetails.Message
    exit 1
}

# TEST 3: User Login
Write-Host "`nTEST 3: User Login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = $testEmail
        password = $testPassword
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method POST -Body $loginBody -ContentType "application/json" -TimeoutSec 10
    
    if ($loginResponse.data.token -and $loginResponse.data.user.email -eq $testEmail) {
        Add-TestResult "User Login" $true "Login successful with correct token"
        $loginToken = $loginResponse.data.token
    } else {
        Add-TestResult "User Login" $false "Login response invalid"
    }
} catch {
    Add-TestResult "User Login" $false $_.Exception.Message $_.ErrorDetails.Message
}

# TEST 4: Get Current User (/me)
Write-Host "`nTEST 4: Get Current User..." -ForegroundColor Yellow
try {
    $headers = @{ "Authorization" = "Bearer $testToken" }
    $meResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" `
        -Method GET -Headers $headers -TimeoutSec 10
    
    if ($meResponse.data.email -eq $testEmail) {
        Add-TestResult "Get Current User" $true "User profile retrieved successfully"
    } else {
        Add-TestResult "Get Current User" $false "User data mismatch"
    }
} catch {
    Add-TestResult "Get Current User" $false $_.Exception.Message
}

# TEST 5: Dashboard (Protected Endpoint)
Write-Host "`nTEST 5: Dashboard Access..." -ForegroundColor Yellow
try {
    $headers = @{ "Authorization" = "Bearer $testToken" }
    $dashResponse = Invoke-RestMethod -Uri "$baseUrl/api/dashboard" `
        -Method GET -Headers $headers -TimeoutSec 10
    
    Add-TestResult "Dashboard Access" $true "Dashboard data retrieved" `
        "Keys: $($dashResponse.PSObject.Properties.Name -join ', ')"
} catch {
    Add-TestResult "Dashboard Access" $false $_.Exception.Message
}

# TEST 6: Invoices List
Write-Host "`nTEST 6: Invoices List..." -ForegroundColor Yellow
try {
    $headers = @{ "Authorization" = "Bearer $testToken" }
    $invResponse = Invoke-RestMethod -Uri "$baseUrl/api/invoices" `
        -Method GET -Headers $headers -TimeoutSec 10
    
    if ($invResponse.success) {
        Add-TestResult "Invoices List" $true "Invoice list retrieved (empty collection OK)"
    } else {
        Add-TestResult "Invoices List" $false "API returned success=false"
    }
} catch {
    Add-TestResult "Invoices List" $false $_.Exception.Message
}

# TEST 7: Transactions List
Write-Host "`nTEST 7: Transactions List..." -ForegroundColor Yellow
try {
    $headers = @{ "Authorization" = "Bearer $testToken" }
    $txnResponse = Invoke-RestMethod -Uri "$baseUrl/api/transactions" `
        -Method GET -Headers $headers -TimeoutSec 10
    
    if ($txnResponse.success) {
        Add-TestResult "Transactions List" $true "Transaction list retrieved"
    } else {
        Add-TestResult "Transactions List" $false "API returned success=false"
    }
} catch {
    Add-TestResult "Transactions List" $false $_.Exception.Message
}

# TEST 8: Products List
Write-Host "`nTEST 8: Products List..." -ForegroundColor Yellow
try {
    $headers = @{ "Authorization" = "Bearer $testToken" }
    $prodResponse = Invoke-RestMethod -Uri "$baseUrl/api/products" `
        -Method GET -Headers $headers -TimeoutSec 10
    
    if ($prodResponse.success) {
        Add-TestResult "Products List" $true "Product list retrieved"
    } else {
        Add-TestResult "Products List" $false "API returned success=false"
    }
} catch {
    Add-TestResult "Products List" $false $_.Exception.Message
}

# TEST 9: Contacts List
Write-Host "`nTEST 9: Contacts List..." -ForegroundColor Yellow
try {
    $headers = @{ "Authorization" = "Bearer $testToken" }
    $contactResponse = Invoke-RestMethod -Uri "$baseUrl/api/contacts" `
        -Method GET -Headers $headers -TimeoutSec 10
    
    if ($contactResponse.success) {
        Add-TestResult "Contacts List" $true "Contact list retrieved"
    } else {
        Add-TestResult "Contacts List" $false "API returned success=false"
    }
} catch {
    Add-TestResult "Contacts List" $false $_.Exception.Message
}

# TEST 10: Unauthorized Access (No Token)
Write-Host "`nTEST 10: Unauthorized Access Protection..." -ForegroundColor Yellow
try {
    $unauthResponse = Invoke-RestMethod -Uri "$baseUrl/api/invoices" `
        -Method GET -TimeoutSec 10
    Add-TestResult "Unauthorized Access" $false "API allowed access without token!"
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Add-TestResult "Unauthorized Access" $true "API correctly blocks unauthorized requests"
    } else {
        Add-TestResult "Unauthorized Access" $false "Unexpected error: $($_.Exception.Message)"
    }
}

# SUMMARY
Write-Host "`n📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "===============`n" -ForegroundColor Cyan

$passed = ($testResults | Where-Object { $_.Status -match "PASS" }).Count
$failed = ($testResults | Where-Object { $_.Status -match "FAIL" }).Count
$total = $testResults.Count

$passRate = [math]::Round(($passed / $total) * 100, 1)

Write-Host "Total Tests: $total"
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if($failed -gt 0){'Red'}else{'Green'})
Write-Host "Pass Rate: $passRate%`n"

$testResults | Format-Table -AutoSize

if ($failed -eq 0) {
    Write-Host "`n🎉 ALL TESTS PASSED! System 100% Operational!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n⚠️ Some tests failed. Review details above." -ForegroundColor Yellow
    exit 1
}

