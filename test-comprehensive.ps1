# ========================================
# COMPREHENSIVE SYSTEM TEST - ALL MODULES
# ========================================

$ErrorActionPreference = "Continue"
$apiUrl = "https://hafjet-cloud-accounting-system-production.up.railway.app/api"
$testResults = @{
    passed = 0
    failed = 0
    errors = @()
}

function Test-Endpoint {
    param($Name, $Method, $Endpoint, $Body, $Token, $ExpectedStatus = 200)
    
    Write-Host "`n🧪 Testing: $Name" -ForegroundColor Cyan
    
    try {
        $headers = @{ "Content-Type" = "application/json" }
        if ($Token) { $headers["Authorization"] = "Bearer $Token" }
        
        $params = @{
            Uri = "$apiUrl$Endpoint"
            Method = $Method
            Headers = $headers
            TimeoutSec = 10
        }
        
        if ($Body) { 
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params -ErrorAction Stop
        
        Write-Host "   ✅ PASS: $Name" -ForegroundColor Green
        $script:testResults.passed++
        return $response
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "   ✅ PASS: $Name (Expected $ExpectedStatus)" -ForegroundColor Green
            $script:testResults.passed++
        } else {
            Write-Host "   ❌ FAIL: $Name - $($_.Exception.Message)" -ForegroundColor Red
            $script:testResults.failed++
            $script:testResults.errors += "$Name : $($_.Exception.Message)"
        }
        return $null
    }
}

Write-Host "`n════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "   🚀 COMPREHENSIVE SYSTEM TEST - ALL MODULES" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════`n" -ForegroundColor Yellow

# ========================================
# 1. HEALTH CHECK
# ========================================
Write-Host "`n═══ 1. HEALTH & INFRASTRUCTURE ═══" -ForegroundColor Yellow
Test-Endpoint "Health Check" "GET" "/health"

# ========================================
# 2. AUTHENTICATION
# ========================================
Write-Host "`n═══ 2. AUTHENTICATION & AUTHORIZATION ═══" -ForegroundColor Yellow

# Register new test user
$timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$testEmail = "autotest$timestamp@hafjet.com"
$testPassword = "Test@12345"

$registerData = @{
    name = "Auto Test User"
    email = $testEmail
    password = $testPassword
    companyName = "Auto Test Company $timestamp"
}

$registerResponse = Test-Endpoint "User Registration" "POST" "/auth/register" $registerData

# Login
$loginData = @{
    email = $testEmail
    password = $testPassword
}

$loginResponse = Test-Endpoint "User Login" "POST" "/auth/login" $loginData

if ($loginResponse -and $loginResponse.data.token) {
    $token = $loginResponse.data.token
    $userId = $loginResponse.data.user.id
    $companyId = $loginResponse.data.user.companyId
    Write-Host "`n   🔑 Token obtained: $($token.Substring(0,20))..." -ForegroundColor Green
    Write-Host "   👤 User ID: $userId" -ForegroundColor Gray
    Write-Host "   🏢 Company ID: $companyId" -ForegroundColor Gray
} else {
    Write-Host "`n   ❌ Failed to obtain auth token - stopping tests" -ForegroundColor Red
    exit 1
}

# Test protected route
Test-Endpoint "Get Current User" "GET" "/auth/me" -Token $token

# ========================================
# 3. DASHBOARD
# ========================================
Write-Host "`n=== 3. DASHBOARD AND ANALYTICS ===" -ForegroundColor Yellow
Test-Endpoint "Dashboard Stats" "GET" "/dashboard/stats" -Token $token
Test-Endpoint "Revenue Chart" "GET" "/dashboard/charts/revenue-expenses" -Token $token

# ========================================
# 4. INVOICES
# ========================================
Write-Host "`n═══ 4. INVOICES MODULE ═══" -ForegroundColor Yellow
Test-Endpoint "List Invoices" "GET" "/invoices" -Token $token

$invoiceData = @{
    customerName = "Test Customer"
    customerEmail = "customer@test.com"
    issueDate = (Get-Date).ToString("yyyy-MM-dd")
    dueDate = (Get-Date).AddDays(30).ToString("yyyy-MM-dd")
    items = @(
        @{
            description = "Test Item"
            quantity = 2
            unitPrice = 100
            taxRate = 0
        }
    )
}

$invoice = Test-Endpoint "Create Invoice" "POST" "/invoices" $invoiceData -Token $token

if ($invoice -and $invoice.data.id) {
    $invoiceId = $invoice.data.id
    Test-Endpoint "Get Invoice Details" "GET" "/invoices/$invoiceId" -Token $token
    
    $updateData = @{
        status = "sent"
    }
    Test-Endpoint "Update Invoice" "PATCH" "/invoices/$invoiceId" $updateData -Token $token
}

# ========================================
# 5. TRANSACTIONS
# ========================================
Write-Host "`n═══ 5. TRANSACTIONS MODULE ═══" -ForegroundColor Yellow
Test-Endpoint "List Transactions" "GET" "/transactions" -Token $token

$transactionData = @{
    type = "income"
    amount = 1000
    description = "Test Income"
    category = "Sales"
    date = (Get-Date).ToString("yyyy-MM-dd")
}

$transaction = Test-Endpoint "Create Transaction" "POST" "/transactions" $transactionData -Token $token

if ($transaction -and $transaction.data.id) {
    $transactionId = $transaction.data.id
    Test-Endpoint "Get Transaction" "GET" "/transactions/$transactionId" -Token $token
}

# ========================================
# 6. PURCHASES/BILLS
# ========================================
Write-Host "`n═══ 6. PURCHASES MODULE ═══" -ForegroundColor Yellow
Test-Endpoint "List Bills" "GET" "/purchases" -Token $token

$billData = @{
    supplierName = "Test Supplier"
    billDate = (Get-Date).ToString("yyyy-MM-dd")
    dueDate = (Get-Date).AddDays(30).ToString("yyyy-MM-dd")
    items = @(
        @{
            description = "Test Purchase"
            quantity = 1
            unitPrice = 500
        }
    )
}

Test-Endpoint "Create Bill" "POST" "/purchases" $billData -Token $token

# ========================================
# 7. PRODUCTS
# ========================================
Write-Host "`n═══ 7. PRODUCTS MODULE ═══" -ForegroundColor Yellow
Test-Endpoint "List Products" "GET" "/products" -Token $token

$productData = @{
    name = "Test Product"
    type = "product"
    sellingPrice = 100
    costPrice = 60
    unit = "pcs"
}

$product = Test-Endpoint "Create Product" "POST" "/products" $productData -Token $token

if ($product -and $product.data.id) {
    $productId = $product.data.id
    Test-Endpoint "Get Product" "GET" "/products/$productId" -Token $token
}

# ========================================
# 8. CONTACTS
# ========================================
Write-Host "`n═══ 8. CONTACTS MODULE ═══" -ForegroundColor Yellow
Test-Endpoint "List Contacts" "GET" "/contacts" -Token $token

$contactData = @{
    name = "Test Contact"
    type = "customer"
    email = "contact@test.com"
    phone = "0123456789"
}

$contact = Test-Endpoint "Create Contact" "POST" "/contacts" $contactData -Token $token

if ($contact -and $contact.data.id) {
    $contactId = $contact.data.id
    Test-Endpoint "Get Contact" "GET" "/contacts/$contactId" -Token $token
}

# ========================================
# 9. INVENTORY
# ========================================
Write-Host "`n═══ 9. INVENTORY MODULE ═══" -ForegroundColor Yellow
Test-Endpoint "Inventory Summary" "GET" "/inventory/summary" -Token $token
Test-Endpoint "Stock Movements" "GET" "/inventory/movements" -Token $token

# ========================================
# 10. COMPANY MANAGEMENT
# ========================================
Write-Host "`n═══ 10. COMPANY MANAGEMENT ═══" -ForegroundColor Yellow
Test-Endpoint "Get Company Profile" "GET" "/companies/$companyId" -Token $token

$companyUpdate = @{
    businessType = "Services"
}

Test-Endpoint "Update Company" "PUT" "/companies/$companyId" $companyUpdate -Token $token

# ========================================
# 11. USER MANAGEMENT
# ========================================
Write-Host "`n═══ 11. USER MANAGEMENT ═══" -ForegroundColor Yellow
Test-Endpoint "List Users" "GET" "/users" -Token $token
Test-Endpoint "Get User Details" "GET" "/users/$userId" -Token $token

# ========================================
# FINAL RESULTS
# ========================================
Write-Host "`n════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "   📊 COMPREHENSIVE TEST RESULTS" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Yellow

$total = $testResults.passed + $testResults.failed
$successRate = [math]::Round(($testResults.passed / $total) * 100, 1)

Write-Host "`n   ✅ Passed: $($testResults.passed)" -ForegroundColor Green
Write-Host "   ❌ Failed: $($testResults.failed)" -ForegroundColor Red
Write-Host "   📈 Success Rate: $successRate%" -ForegroundColor Cyan
Write-Host "   📝 Total Tests: $total" -ForegroundColor Gray

if ($testResults.failed -gt 0) {
    Write-Host "`n   🔴 FAILED TESTS:" -ForegroundColor Red
    foreach ($error in $testResults.errors) {
        Write-Host "      • $error" -ForegroundColor Yellow
    }
    Write-Host "`n   ⚠️  SYSTEM HAS ISSUES - NEEDS FIXING!" -ForegroundColor Red
    exit 1
} else {
    Write-Host "`n   🎉 ALL TESTS PASSED! SYSTEM FULLY FUNCTIONAL!" -ForegroundColor Green
    exit 0
}

