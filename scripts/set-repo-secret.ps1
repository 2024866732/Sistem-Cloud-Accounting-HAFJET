Param(
    [Parameter(Mandatory=$true)]
    [string]$Name,
    [Parameter(Mandatory=$true)]
    [string]$Value
)

# Helper: set a repo secret using gh CLI (interactive, requires gh auth)
Write-Host "Setting repo secret $Name"
gh secret set $Name --body $Value
