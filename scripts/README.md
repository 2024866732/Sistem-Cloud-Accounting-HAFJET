Script: install-python-official.ps1

Usage examples

PowerShell (dry-run, resolves version to python.org URL):

```powershell
.\scripts\install-python-official.ps1 -Version 3.11.7 -DryRun -VerboseLog
```

Download and install (system-wide — run PowerShell as Administrator):

```powershell
.\scripts\install-python-official.ps1 -Url "https://www.python.org/ftp/python/3.11.7/python-3.11.7-amd64.exe" -InstallAllUsers
```

Notes
- Use -Sha256 to verify installer integrity.
- DryRun avoids network and execution steps so you can inspect the would-be actions.
