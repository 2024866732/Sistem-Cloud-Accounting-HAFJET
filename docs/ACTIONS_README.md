Download GitHub Actions logs locally

This helper script downloads and extracts a specific GitHub Actions run's logs to your repository folder. Use it only on your local machine. It requires a GitHub Personal Access Token (PAT) with `repo` scope (and `workflow` if available).

Usage (PowerShell):

1. Open PowerShell in repository root.
2. Run:

   .\scripts\download-action-logs.ps1 18236494660

3. When prompted, paste your PAT (input is hidden). The script will download `run-<ID>-logs.zip` and extract to `run-<ID>-logs`.

4. Inspect the extracted files and paste the failing step output here for analysis.

Security:
- Do NOT paste your PAT into chat. The script reads it locally and does not store it persistently.
- Remove the ZIP and extracted logs after use:

  Remove-Item -Recurse -Force .\run-18236494660-logs .\run-18236494660-logs.zip
