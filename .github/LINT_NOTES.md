# Lint Notes for GitHub Actions Workflows

Some local YAML linters or the patching tool may flag expressions like `${{ secrets.SOME_SECRET }}` as "unrecognized named-value" during static analysis. These warnings are false positives for GitHub Actions runtime evaluation.

Guidance:

- GitHub Actions evaluates `${{ secrets.* }}` at runtime and it is valid in `env:` and `if:` expressions.
- To avoid local noise:
  - Use comments in workflows explaining the use of secrets (this repo includes those comments).
  - Configure your local linter to ignore `github-actions` checks for secret refs, or run `act`/`act`with proper secrets configured.

This file documents that the repository intentionally uses `${{ secrets.* }}` and that the warnings can be ignored for CI runtime.
