# GHCR (GitHub Container Registry) Setup

This document explains how to create a Personal Access Token (PAT) to allow GitHub Actions to push images to GHCR and how to add it to repository secrets as `GHCR_PAT`.

## Why this matters
The CI/build workflows attempt to push Docker images to `ghcr.io`. If the workflow doesn't have credentials with write permissions for the target package, the push will fail with an error like:

  denied: installation not allowed to Write organization package

To enable pushes from CI, grant a token with `write:packages` permission.

## Create a PAT (Personal Access Token)
1. Go to https://github.com/settings/tokens (you may need to sign in).
2. Click **Generate new token** > **Fine-grained tokens** (recommended), or classic tokens if preferred.
3. For classic token, select:
   - Expiration: choose a suitable expiration (e.g., 90 days) or no expiration
   - Scopes: `write:packages` (and optionally `read:packages`)
4. For fine-grained, set permissions on the repo or organization level with Packages write access.
5. Generate the token and copy it immediately (you won't see it again).

## Add the token to repository secrets
1. On the repository page, go to **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
2. Name: `GHCR_PAT`
3. Value: paste the copied PAT
4. Save secret

## Verify setup
After adding the secret, re-run the CI workflow (push a small commit or re-run the latest workflow). The pipeline will attempt to log in and push images. To validate manually:

- Check the `docker/login-action` step output for a successful login message.
- Check the `docker/build-push-action` step; it should perform `push` and not show the `denied: installation not allowed to Write organization package` error.

## Security notes
- Use a token with the smallest required scope (write:packages only). Do not grant broad repo or admin permissions unless necessary.
- Rotate the token periodically and update the secret.
- For organization-level pushing, you may need to configure organization package settings or use a GitHub App with package permissions.

If you'd like, I can also add a short workflow check step that asserts `GHCR_PAT` is present and fails early with an actionable message (I already added logging in the CI).