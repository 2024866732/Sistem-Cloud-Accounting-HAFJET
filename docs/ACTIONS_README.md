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


Deploy workflow notes
---------------------
The repository contains a `build-and-deploy` workflow (`.github/workflows/deploy.yml`) with the following safeguards:

- Smoke-check: prints whether the `KUBE_CONFIG` repository secret is present so you can quickly see why a deploy was skipped.
- Protected-branch guard: for pushes to `main` or `master` the workflow will fail early if `KUBE_CONFIG` is not set (prevents silent skips for production deploys).
- Redacted fingerprint: when `KUBE_CONFIG` is present, the workflow prints a short SHA256-derived fingerprint of the base64 secret so you can confirm which secret is in use without exposing the secret.
- Masked sample: the workflow also prints a masked sample (first 8 and last 8 characters) of the base64 payload so you can visually confirm the secret without revealing full contents.

Metrics access note
-------------------
The backend exposes `/api/metrics`. For local testing the workflow uses `METRICS_BASIC_AUTH`. In production you can set `METRICS_BEARER_TOKEN` instead. Bearer token authentication is supported by the server (preferred) and should be protected by network policies (Prometheus scrape jobs or cluster network ACLs).
- Tag-only deploy job: there is a separate `deploy-on-tag` job that runs only for tag pushes (`refs/tags/*`) and requires `KUBE_CONFIG`. Use tag pushes for explicit, auditable releases.

How to enable deploys:

1. Add a repository secret `KUBE_CONFIG` containing the base64-encoded contents of your kubeconfig.
2. Push a git tag to trigger the tag-only deploy, or push to `main`/`master` with the secret present for branch deploys.

Manual deploys via GitHub UI
----------------------------
You can also trigger a manual deploy from the Actions tab using the "Manual Deploy" workflow. Steps:

1. Go to Actions → Manual Deploy → Run workflow.
2. Set the `confirm` input to the literal string `deploy` to confirm the action.
3. The workflow requires the `KUBE_CONFIG` secret (base64 kubeconfig) to be set in repository secrets.

Use manual deploys for one-off releases or emergency rollouts.

Required repository secrets
---------------------------
The following secrets are used by workflows in this repo. Add them in Settings → Secrets → Actions when you intend to run deploy/backup jobs.

- `KUBE_CONFIG` — base64-encoded kubeconfig used by deploy workflows.
- `SENTRY_AUTH_TOKEN` — optional Sentry auth token for source map uploads.
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` — credentials for S3 backup/restore verification.
- `S3_BUCKET` — S3 bucket name used for backups.
- `AWS_REGION` — AWS region for the bucket (optional; defaults supported).

Restore E2E (S3) workflow
-------------------------
The repository provides a manual workflow `Restore E2E S3 Verify` (`.github/workflows/restore-e2e-s3.yml`) which:

- Runs a local backup/restore test (`backend/scripts/test-backup-restore.js`).
- Optionally uploads the created backup to S3 and verifies a restore from the bucket.

Inputs:
- `use_inmemory` (optional): set to `true` when triggering the workflow manually to run the test using an in-memory MongoDB server (no Docker required). This is useful for runners or local machines without Docker.

Notes:
- If you set `use_inmemory=true`, the workflow skips the initial AWS secret presence check; however, the S3 upload and download steps still require `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `S3_BUCKET` to be set as repository secrets.
- To run a full S3 E2E, ensure the AWS secrets and `S3_BUCKET` are present; otherwise the workflow will run the local/in-memory test only and skip upload/download.


