param(
    [Parameter(Mandatory=$true)]
    [string]$Url,
    [Parameter(Mandatory=$true)]
    [int]$Issue,
    [string]$Repo = "2024866732/Sistem-Cloud-Accounting-HAFJET"
)

function Write-ErrAndExit($msg){
    Write-Error $msg
    exit 1
}

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-ErrAndExit "gh CLI not found in PATH. Please install and authenticate 'gh'."
}

Write-Host "Running smoke test against: $Url/api/health"

try {
    $resp = Invoke-WebRequest -Uri "$Url/api/health" -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
    $status = $resp.StatusCode
    $body = $resp.Content
} catch {
    $status = ($_.Exception.Response.StatusCode.Value__  -as [int]) 2>$null
    if (-not $status) { $status = 0 }
    $body = $_.Exception.Message
}

$snippet = if ($body.Length -gt 800) { $body.Substring(0,800) + "..." } else { $body }

$passed = ($status -ge 200 -and $status -lt 300)

$comment = @"
Automated smoke test run by repository automation on $(Get-Date -Format u)

Target URL: $Url/api/health
HTTP status: $status

Response snippet:
$snippet

Result: $(if ($passed) { 'PASS' } else { 'FAIL' })
"@

Write-Host "Posting comment to issue #$Issue"
echo $comment | gh issue comment $Issue --repo $Repo --body -

if ($passed) {
    Write-Host "Closing issue #$Issue (health check passed)"
    gh issue close $Issue --repo $Repo
}

if (-not $passed) { exit 2 }
