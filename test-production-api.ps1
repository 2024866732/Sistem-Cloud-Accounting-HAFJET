# Production API Testing Script
# Tests all endpoints with proper error handling

$baseUrl = "https://hafjet-cloud-accounting-system-production.up.railway.app"
$results = @()

function Test-Endpoint {
    param($name, $method, $path, $body, $token)
    
    try {
        $headers = @{ "Content-Type" = "application/json" }
        if ($token) { $headers["Authorization"] = "Bearer $token" }
        
        $params = @{
            Uri = "$baseUrl$path"
            Method = $method
            UseBasicParsing = $true
            TimeoutSec = 10
            ErrorAction = 'Stop'
        }
        
        if ($headers) { $params['Headers'] = $headers }
        if ($body) { $params['Body'] = ($body | ConvertTo-Json) }
        
        $response = Invoke-WebRequest @params
        
        $result = @{
            Test = $name
            Status = "✅ PASS"
            Code = $response.StatusCode
            Response = $response.Content.Substring(0, [Math]::Min(100, $response.Content.Length))
        }
    }
    catch {
        $result = @{
            Test = $name  
            Status = "❌ FAIL"
            Code = $_.Exception.Response.StatusCode.value__
            Error = $_.Exception.Message.Substring(0, [Math]::Min(150, $_.Exception.Message.Length))
        }
    }
    
    $global:results += $result
    Write-Host "$($result.Status) $name" -ForegroundColor $(if($result.Status -match 'PASS'){'Green'}else{'Red'})
    return $result
}

Write-Host "`n🧪 PRODUCTION API TESTING SUITE" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Test 1: Health Check
Test-Endpoint "Health Check" "GET" "/api/health"

# Test 2: System Status  
Test-Endpoint "System Status" "GET" "/api/system/status"

# Test 3: Login (will fail if no users - expected)
$loginResult = Test-Endpoint "Login (temp user)" "POST" "/api/auth/login" @{
    email = "admin@hafjet.com"
    password = "admin123"
}

# Test 4: Create invoice without auth (should fail)
Test-Endpoint "Invoices (no auth)" "GET" "/api/invoices"

# Test 5: Dashboard without auth
Test-Endpoint "Dashboard (no auth)" "GET" "/api/dashboard"

# Test 6: Transactions without auth
Test-Endpoint "Transactions (no auth)" "GET" "/api/transactions"

Write-Host "`n📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "===============`n" -ForegroundColor Cyan

$passed = ($results | Where-Object { $_.Status -match 'PASS' }).Count
$failed = ($results | Where-Object { $_.Status -match 'FAIL' }).Count
$total = $results.Count

Write-Host "Total: $total | Passed: $passed | Failed: $failed"
Write-Host "`nPass Rate: $([math]::Round(($passed/$total)*100, 1))%`n"

$results | ForEach-Object {
    Write-Host "$($_.Status) $($_.Test) - HTTP $($_.Code)"
}

Write-Host "`n✅ Testing Complete!" -ForegroundColor Green

