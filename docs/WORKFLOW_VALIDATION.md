# Workflow Validation - Local Setup (Windows / PowerShell)

This document explains how to run and enable the workflow YAML validator locally, install Husky hooks, and troubleshoot antivirus (Avast) interactions.

## What we added
- `scripts/validate-workflows.py` - Python script that parses all `.github/workflows/*.yml|yaml` files and exits with non-zero code if any file doesn't parse.
- `package.json` (root) includes:
  - `validate:workflows` script (runs the Python validator)
  - `prepare` script that runs `husky install`
- `.husky/pre-commit` - Husky hook that runs `npm run validate:workflows` before commit.

## One-time setup (per developer)
Open PowerShell in the repository root and run:

```powershell
# 1) Install Node deps (installs husky and other dev deps)
npm install

# 2) Ensure Husky hooks are installed (prepare script typically runs on npm install)
npx husky install

# Optional: verify pre-commit hook exists
Get-Content .husky/pre-commit
```

## Running the validator manually
If you only want to run the YAML validator (no commit):

```powershell
python .\scripts\validate-workflows.py
```

This prints `All workflow YAML files parsed successfully.` on success, or prints parse errors and exits with non-zero on failure.

## Why PowerShell errors appeared earlier
- PowerShell does not support Bash-style heredoc `python - <<'PY' ... PY` which caused the `Missing file specification after redirection operator` and related errors you saw.
- To run the same multi-line script in PowerShell, either run the saved script file (`python .\scripts\validate-workflows.py`) or use a here-string with `python -c`.

Example here-string usage in PowerShell (not recommended; use the script file):

```powershell
$script = @'
import glob, sys, yaml
files = glob.glob('.github/workflows/*.yml') + glob.glob('.github/workflows/*.yaml')
list(yaml.safe_load_all(open(files[0])))
'@
python -c $script
```

## Antivirus (Avast) & Python
If Avast (Hardened Mode) flagged `python3.13.exe` and added an exception, that's Avast's action on your machine. It can happen when:

- You installed Python via Chocolatey and Avast prompted to add the binary to exceptions.
- You ran Python after installing and Avast suggested an exception.

Recommended checks:

```powershell
# Find python path(s)
where.exe python
python --version

# Get file hash to verify
Get-FileHash -Path "C:\ProgramData\chocolatey\bin\python3.13.exe" -Algorithm SHA256

# Optional: check digital signature
Get-AuthenticodeSignature "C:\ProgramData\chocolatey\bin\python3.13.exe"
```

If you want to remove the Avast exception: open Avast UI -> Protection -> Core Shields -> Exceptions, and remove the entry. Re-run a quick scan to be safe.

## Troubleshooting
- If `npm install` fails due to permission or antivirus: temporarily disable Avast or add an exclusion for the repo path while installing.
- If Husky hooks don't run after `npm install`, run:

```powershell
npx husky install
npx husky add .husky/pre-commit "npm run validate:workflows"
```

## Notes
- CI performs both parse validation (`workflow-validate.yml`) and style checks (`workflow-lint.yml`). The pre-commit hook provides a local safety net.
- The validator script only parses YAML; it does not execute actions or run network calls.

If you want, I can also add a short section showing how to re-register Python from python.org if you prefer an official installer over Chocolatey.
