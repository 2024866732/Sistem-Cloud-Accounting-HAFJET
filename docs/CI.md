CI (GitHub Actions) for HAFJET Bukku

Overview

This repository includes a CI workflow at `.github/workflows/ci.yml` which:

- Runs backend TypeScript checks (`npx tsc --noEmit`) under `backend/`.
- Builds the frontend with Vite under `frontend/`.
- Builds Docker images for backend and frontend in the runner.
- Optionally publishes the built images to GitHub Container Registry (GHCR) when running on `main` and `GHCR_TOKEN` is configured.

Required secrets (for publishing to GHCR)

- `GHCR_TOKEN` — a personal access token (or `GITHUB_TOKEN` with appropriate permissions) used to push images to `ghcr.io`. To create/persist a token:
  1. Go to GitHub → Settings → Developer settings → Personal access tokens.
  2. Create a token with `write:packages` and `read:packages` scopes (and `repo` if needed).
  3. Add the token to the repository's Settings → Secrets -> Actions → New repository secret and name it `GHCR_TOKEN`.

Notes

- The CI workflow uses `ubuntu-latest` runners and executes Docker builds on the runner. If you prefer pushing images to Docker Hub, replace the GHCR steps with Docker Hub login and push steps, and set `DOCKERHUB_USERNAME`/`DOCKERHUB_TOKEN` secrets.
- The workflow includes placeholders for lint and unit tests. Add project-specific test commands (Jest/Vitest) and lint configuration.
- The repo must be pushed to GitHub (this workspace currently shows no local git repo). Commit the `.github/workflows/ci.yml` file and push to your remote to trigger CI.
