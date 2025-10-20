# COMPREHENSIVE API TEST - ALL MODULES
$ErrorActionPreference = "Continue"
$apiUrl = "https://hafjet-cloud-accounting-system-production.up.railway.app/api"
$passed = 0
$failed = 0
$errors = @()

function Test-API {
    param($Name, $Method, $Endpoint, $Body, $Token)
    
    Write-Host "`nTesting: $Name" -ForegroundColor Cyan
    
    try {
        $headers = @{ "Content-Type" = "application/json" }
        if ($Token) { $headers["Authorization"] = "Bearer $Token" }
        
        $params = @{
            Uri = "$apiUrl$Endpoint"
            Method = $Method
            Headers = $headers
            TimeoutSec = 15
        }
        
        if ($Body) { $params["Body"] = ($Body | ConvertTo-Json -Depth 10) }
        
        $response = Invoke-RestMethod @params -ErrorAction Stop
        Write-Host "   PASS: $Name" -ForegroundColor Green
        $script:passed++
        return $response
        
    } catch {
        Write-Host "   FAIL: $Name - $($_.Exception.Message)" -ForegroundColor Red
        $script:failed++
        $script:errors += "$Name : $($_.Exception.Message)"
        return $null
    }
}

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host " COMPREHENSIVE SYSTEM TEST - ALL MODULES" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Yellow

# 1. HEALTH CHECK
Write-Host "`n--- 1. HEALTH CHECK ---" -ForegroundColor Yellow
Test-API "Health Check" "GET" "/health"

# 2. AUTHENTICATION
Write-Host "`n--- 2. AUTHENTICATION ---" -ForegroundColor Yellow

$timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$testEmail = "test$timestamp@hafjet.com"
$testPassword = "Test12345678"

$registerData = @{
    name = "Test User $timestamp"
    email = $testEmail
    password = $testPassword
    companyName = "Test Company $timestamp"
}

$register = Test-API "Register" "POST" "/auth/register" $registerData

$loginData = @{ email = $testEmail; password = $testPassword }
$login = Test-API "Login" "POST" "/auth/login" $loginData

if ($login -and $login.data.token) {
    $token = $login.data.token
    Write-Host "   Token: $($token.Substring(0,20))..." -ForegroundColor Green
} else {
    Write-Host "   CRITICAL: No token - stopping" -ForegroundColor Red
    exit 1
}

Test-API "Get Me" "GET" "/auth/me" -Token $token

# 3. DASHBOARD
Write-Host "`n--- 3. DASHBOARD ---" -ForegroundColor Yellow
Test-API "Dashboard Stats" "GET" "/dashboard/stats" -Token $token
Test-API "Charts" "GET" "/dashboard/charts/revenue-expenses" -Token $token

# 4. INVOICES
Write-Host "`n--- 4. INVOICES ---" -ForegroundColor Yellow
Test-API "List Invoices" "GET" "/invoices" -Token $token

$invoiceData = @{
    customerName = "Test Customer"
    customerEmail = "customer@test.com"
    issueDate = (Get-Date).ToString("yyyy-MM-dd")
    dueDate = (Get-Date).AddDays(30).ToString("yyyy-MM-dd")
    items = @(@{
        description = "Test Item"
        quantity = 2
        unitPrice = 100
        taxRate = 0
    })
}

$inv = Test-API "Create Invoice" "POST" "/invoices" $invoiceData -Token $token
if ($inv -and $inv.data.id) {
    Test-API "Get Invoice" "GET" "/invoices/$($inv.data.id)" -Token $token
}

# 5. TRANSACTIONS
Write-Host "`n--- 5. TRANSACTIONS ---" -ForegroundColor Yellow
Test-API "List Transactions" "GET" "/transactions" -Token $token

$txData = @{
    type = "income"
    amount = 1000
    description = "Test Income"
    category = "Sales"
    date = (Get-Date).ToString("yyyy-MM-dd")
}

$tx = Test-API "Create Transaction" "POST" "/transactions" $txData -Token $token
if ($tx -and $tx.data.id) {
    Test-API "Get Transaction" "GET" "/transactions/$($tx.data.id)" -Token $token
}

# 6. PURCHASES
Write-Host "`n--- 6. PURCHASES ---" -ForegroundColor Yellow
Test-API "List Bills" "GET" "/purchases" -Token $token

$billData = @{
    supplierName = "Test Supplier"
    issueDate = (Get-Date).ToString("yyyy-MM-dd")
    dueDate = (Get-Date).AddDays(30).ToString("yyyy-MM-dd")
    items = @(@{
        description = "Test Purchase"
        quantity = 1
        unitPrice = 500
        amount = 500
    })
}

Test-API "Create Bill" "POST" "/purchases" $billData -Token $token

# 7. PRODUCTS
Write-Host "`n--- 7. PRODUCTS ---" -ForegroundColor Yellow
Test-API "List Products" "GET" "/products" -Token $token

$prodData = @{
    name = "Test Product $timestamp"
    type = "product"
    sellingPrice = 100
    costPrice = 60
    unit = "pcs"
}

$prod = Test-API "Create Product" "POST" "/products" $prodData -Token $token
if ($prod -and $prod.data.id) {
    Test-API "Get Product" "GET" "/products/$($prod.data.id)" -Token $token
}

# 8. CONTACTS
Write-Host "`n--- 8. CONTACTS ---" -ForegroundColor Yellow
Test-API "List Contacts" "GET" "/contacts" -Token $token

$contactData = @{
    name = "Test Contact $timestamp"
    type = "customer"
    email = "contact$timestamp@test.com"
    phone = "0123456789"
}

$contact = Test-API "Create Contact" "POST" "/contacts" $contactData -Token $token
if ($contact -and $contact.data.id) {
    Test-API "Get Contact" "GET" "/contacts/$($contact.data.id)" -Token $token
}

# 9. INVENTORY
Write-Host "`n--- 9. INVENTORY ---" -ForegroundColor Yellow
Test-API "Inventory Summary" "GET" "/inventory/summary" -Token $token
Test-API "Stock Movements" "GET" "/inventory/movements" -Token $token

# 10. COMPANIES
Write-Host "`n--- 10. COMPANIES ---" -ForegroundColor Yellow
if ($login.data.user.companyId) {
    $compId = $login.data.user.companyId
    Test-API "Get Company" "GET" "/companies/$compId" -Token $token
}

# 11. USERS
Write-Host "`n--- 11. USERS ---" -ForegroundColor Yellow
Test-API "List Users" "GET" "/users" -Token $token

# RESULTS
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host " TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Yellow

$total = $passed + $failed
$rate = if ($total -gt 0) { [math]::Round(($passed / $total) * 100, 1) } else { 0 }

Write-Host "`n   Passed: $passed" -ForegroundColor Green
Write-Host "   Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host "   Success Rate: $rate%" -ForegroundColor Cyan
Write-Host "   Total: $total" -ForegroundColor Gray

if ($failed -gt 0) {
    Write-Host "`n   FAILED TESTS:" -ForegroundColor Red
    foreach ($err in $errors) {
        Write-Host "      - $err" -ForegroundColor Yellow
    }
    Write-Host "`n   SYSTEM HAS ISSUES!" -ForegroundColor Red
} else {
    Write-Host "`n   ALL TESTS PASSED!" -ForegroundColor Green
}

Write-Host "`n"

