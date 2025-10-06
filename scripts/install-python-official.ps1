<#
.SYNOPSIS
  Download and optionally silently install an official Python installer from python.org.

.DESCRIPTION
  Helper script to download the official python.org installer and run it silently.
  Supports dry-run and optional SHA256 verification. Does not auto-elevate; if you
  pass -InstallAllUsers, run PowerShell as Administrator.

.EXAMPLES
  # Dry-run with version resolution
  .\scripts\install-python-official.ps1 -Version 3.11.7 -DryRun -VerboseLog

  # Actual install (requires elevation for InstallAllUsers)
  .\scripts\install-python-official.ps1 -Url "https://www.python.org/ftp/python/3.11.7/python-3.11.7-amd64.exe" -InstallAllUsers
#>

param(
	[string]$Version = '',
	[string]$Url = '',
	[string]$Sha256 = '',
	[switch]$InstallAllUsers,
	[string]$TargetDir = '',
	[switch]$VerboseLog,
	[switch]$DryRun
)

function Write-Log([string]$Message, [string]$Level = 'INFO') {
	$ts = (Get-Date).ToString('s')
	if ($Level -eq 'DEBUG' -and -not $VerboseLog) { return }
	Write-Output "[$ts] [$Level] $Message"
}

try {
	if (-not $Url -and $Version) {
		$Url = "https://www.python.org/ftp/python/$Version/python-$Version-amd64.exe"
		Write-Log "Resolved download URL to $Url" 'DEBUG'
	}

	if (-not $Url) { throw 'No download URL specified. Provide -Url or -Version.' }

	$tmp = [System.IO.Path]::GetTempPath()
	$file = Join-Path $tmp ([System.IO.Path]::GetFileName($Url))
	Write-Log "Will download to $file"

	if ($DryRun) {
		Write-Log 'DryRun: skipping download' 'INFO'
	} else {
		Invoke-WebRequest -Uri $Url -OutFile $file -UseBasicParsing -ErrorAction Stop
		Write-Log 'Download finished' 'DEBUG'
	}

	if ($Sha256) {
		if (-not $DryRun) {
			$actual = (Get-FileHash -Path $file -Algorithm SHA256).Hash.ToLowerInvariant()
			if ($actual -ne $Sha256.ToLowerInvariant()) { throw "SHA256 mismatch" }
			Write-Log 'SHA256 verified' 'INFO'
		} else { Write-Log 'DryRun: skipping checksum verification' 'DEBUG' }
	}

	$installer = $file
	$installerArgs = @('InstallAllUsers=0','PrependPath=1')
	if ($InstallAllUsers) { $installerArgs[0] = 'InstallAllUsers=1' }
	if ($TargetDir) { $installerArgs += ('TargetDir="{0}"' -f $TargetDir) }
	$argString = '/quiet ' + ($installerArgs -join ' ')

	if ($DryRun) {
		Write-Log "DryRun: would run: $installer $argString" 'INFO'
	} else {
		$proc = Start-Process -FilePath $installer -ArgumentList $argString -Wait -PassThru -ErrorAction Stop
		if ($proc.ExitCode -ne 0) { throw "Installer exited with code $($proc.ExitCode)" }
		Write-Log 'Installer finished successfully' 'INFO'
	}

	Write-Log 'Done.' 'INFO'

} catch {
	Write-Log "ERROR: $($_.Exception.Message)" 'ERROR'
	exit 1
}
