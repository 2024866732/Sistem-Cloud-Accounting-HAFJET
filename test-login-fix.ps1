# Test Login Fix - Comprehensive API Test
# Tests registration and login flow to verify password hashing fix

$baseUrl = "https://hafjet-cloud-accounting-system-production.up.railway.app"
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$testEmail = "test-$timestamp@hafjet-test.com"
$testPassword = "TestPassword123!"
$testName = "Test User $timestamp"
$testCompany = "Test Company $timestamp Sdn Bhd"

Write-Host "`nTESTING LOGIN FIX - COMPREHENSIVE TEST" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$results = @{
    Total = 10
    Passed = 0
    Failed = 0
}

function Test-Endpoint {
    param($name, $method, $path, $body, $token, $expectedCode = 200)
    
    Write-Host "`nTesting: $name" -ForegroundColor Yellow
    
    try {
        $headers = @{ "Content-Type" = "application/json" }
        if ($token) { $headers["Authorization"] = "Bearer $token" }
        
        $params = @{
            Uri = "$baseUrl$path"
            Method = $method
            UseBasicParsing = $true
            TimeoutSec = 30
            ErrorAction = 'Stop'
        }
        
        if ($headers.Count -gt 0) { $params['Headers'] = $headers }
        if ($body) { $params['Body'] = ($body | ConvertTo-Json -Depth 10) }
        
        $response = Invoke-WebRequest @params
        $content = $response.Content | ConvertFrom-Json
        
        if ($response.StatusCode -eq $expectedCode) {
            Write-Host "PASS - HTTP $($response.StatusCode)" -ForegroundColor Green
            $script:results.Passed++
            return @{ Success = $true; Data = $content; Response = $response }
        } else {
            Write-Host "FAIL - Expected $expectedCode, got $($response.StatusCode)" -ForegroundColor Red
            $script:results.Failed++
            return @{ Success = $false; Data = $content }
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq $expectedCode) {
            Write-Host "PASS - HTTP $statusCode (expected)" -ForegroundColor Green
            $script:results.Passed++
            return @{ Success = $true; StatusCode = $statusCode }
        } else {
            Write-Host "FAIL - HTTP $statusCode" -ForegroundColor Red
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
            $script:results.Failed++
            return @{ Success = $false; Error = $_.Exception.Message; StatusCode = $statusCode }
        }
    }
}

# Test 1: Health Check
$healthResult = Test-Endpoint "Health Check" "GET" "/api/health"
Start-Sleep -Seconds 1

# Test 2: Register New User
Write-Host "`nRegistration Details:" -ForegroundColor Cyan
Write-Host "  Email: $testEmail"
Write-Host "  Password: $testPassword"
Write-Host "  Name: $testName"
Write-Host "  Company: $testCompany"

$registerResult = Test-Endpoint "User Registration" "POST" "/api/auth/register" @{
    email = $testEmail
    password = $testPassword
    name = $testName
    companyName = $testCompany
} -expectedCode 201

if ($registerResult.Success) {
    $registrationToken = $registerResult.Data.data.token
    $userId = $registerResult.Data.data.user.id
    $companyId = $registerResult.Data.data.user.companyId
    
    Write-Host "  Token received: $($registrationToken.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host "  User ID: $userId" -ForegroundColor Gray
    Write-Host "  Company ID: $companyId" -ForegroundColor Gray
} else {
    Write-Host "  Registration failed - cannot continue" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 2

# Test 3: Login with Same Credentials (THE KEY TEST!)
Write-Host "`nAttempting login with same credentials..." -ForegroundColor Cyan
$loginResult = Test-Endpoint "User Login (CRITICAL)" "POST" "/api/auth/login" @{
    email = $testEmail
    password = $testPassword
}

if ($loginResult.Success) {
    $loginToken = $loginResult.Data.data.token
    Write-Host "  LOGIN SUCCESSFUL!" -ForegroundColor Green
    Write-Host "  Token received: $($loginToken.Substring(0, 20))..." -ForegroundColor Gray
    
    if ($loginToken -ne $registrationToken) {
        Write-Host "  Note: Different token generated (expected)" -ForegroundColor Gray
    }
} else {
    Write-Host "  LOGIN FAILED - Password double-hashing issue!" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 4: Get Current User (with registration token)
$meResult1 = Test-Endpoint "Get Current User (reg token)" "GET" "/api/auth/me" -token $registrationToken

# Test 5: Get Current User (with login token)
if ($loginToken) {
    $meResult2 = Test-Endpoint "Get Current User (login token)" "GET" "/api/auth/me" -token $loginToken
}

# Test 6: Dashboard Access
$dashboardResult = Test-Endpoint "Dashboard Access" "GET" "/api/dashboard" -token $(if($loginToken){$loginToken}else{$registrationToken})

# Test 7: Invoices List
$invoicesResult = Test-Endpoint "Invoices List" "GET" "/api/invoices" -token $(if($loginToken){$loginToken}else{$registrationToken})

# Test 8: Transactions List
$transactionsResult = Test-Endpoint "Transactions List" "GET" "/api/transactions" -token $(if($loginToken){$loginToken}else{$registrationToken})

# Test 9: Products List
$productsResult = Test-Endpoint "Products List" "GET" "/api/products" -token $(if($loginToken){$loginToken}else{$registrationToken})

# Test 10: Auth Protection Test (no token)
$authProtectResult = Test-Endpoint "Auth Protection" "GET" "/api/dashboard" -expectedCode 401

# Summary
Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

$passRate = [math]::Round(($results.Passed / $results.Total) * 100, 1)

Write-Host "Total Tests: $($results.Total)"
Write-Host "Passed: $($results.Passed)" -ForegroundColor Green
Write-Host "Failed: $($results.Failed)" -ForegroundColor $(if($results.Failed -eq 0){'Green'}else{'Red'})
Write-Host "`nPass Rate: $passRate%" -ForegroundColor $(if($passRate -eq 100){'Green'}elseif($passRate -ge 90){'Yellow'}else{'Red'})

Write-Host "`n============================================================" -ForegroundColor Cyan

if ($passRate -eq 100) {
    Write-Host "`nPRODUCTION SCORE: 100% - ALL SYSTEMS OPERATIONAL!" -ForegroundColor Green
    Write-Host "Login fix verified successfully!" -ForegroundColor Green
} elseif ($passRate -ge 90) {
    Write-Host "`nPRODUCTION SCORE: $passRate% - MOSTLY OPERATIONAL" -ForegroundColor Yellow
} else {
    Write-Host "`nPRODUCTION SCORE: $passRate% - NEEDS ATTENTION" -ForegroundColor Red
}

Write-Host "`nTesting Complete!`n" -ForegroundColor Cyan
