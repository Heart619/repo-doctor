# Repo Doctor Examples

These examples show common ways to run Repo Doctor in local development and GitHub Actions.

## Local Scan With Config

`examples/repo-doctor.config.json` shows a small configuration file that ignores one finding and sets a default CI failure threshold.

```bash
repo-doctor . --markdown
```

## GitHub Action

`examples/github-action/repo-doctor.yml` runs Repo Doctor on pull requests and pushes to `main`.

## SARIF Upload

`examples/sarif-upload/repo-doctor-sarif.yml` writes SARIF output and uploads it to GitHub code scanning.
