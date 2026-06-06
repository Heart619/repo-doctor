# Codex for OSS Application Notes

## Primary Repository

Repository: `Heart619/repo-doctor`

Repo Doctor is a CLI and GitHub Action for open source maintainers. It audits repository health signals such as README guidance, license, test setup, CI, issue and pull request templates, security policy, changelog, package metadata, Node package metadata, Python metadata, and SARIF reporting. The project is intentionally scoped around practical maintenance workflows rather than broad quality claims.

## Why This Repository Fits

Repo Doctor has visible maintenance activity: multiple issues, scoped pull requests, passing CI, release tags, changelog entries, and a self-audit workflow. The project also dogfoods related tools from the same maintenance toolkit:

- `Heart619/readme-command-verifier` checks README command examples.
- `Heart619/gha-linter-lite` checks GitHub Actions workflow hygiene.
- `Heart619/pr-risk-scanner` scores changed-file risk in pull requests.

Together these repositories form a small OSS maintenance toolkit for repeatable pull request review, issue triage, release readiness, and repository health checks.

## How Codex Credits Would Be Used

Codex credits would be used for maintainership work, not for end-user paid features:

- triaging issues into reproducible bugs, documentation gaps, and roadmap candidates;
- drafting focused pull requests with tests for parser and reporter behavior;
- reviewing CI failures and GitHub Action logs;
- improving documentation examples and release notes;
- preparing small external contributions where these tools identify real documentation or workflow problems in other OSS repositories.

The main goal is to reduce maintainer overhead while keeping each change reviewable, tested, and useful to other open source projects.

## Supporting Repositories

- `Heart619/readme-command-verifier`: static README command validation, released as a CLI and GitHub Action.
- `Heart619/gha-linter-lite`: lightweight GitHub Actions workflow linting, released as a CLI and GitHub Action.
- `Heart619/pr-risk-scanner`: changed-file pull request risk scoring, released as a CLI and GitHub Action.

## Short Form Draft

I maintain `Heart619/repo-doctor`, a CLI and GitHub Action that helps open source maintainers audit repository health signals such as README quality, license, CI, templates, security policy, changelog, package metadata, and SARIF output. The repository has passing CI, scoped issues and pull requests, release tags, changelog entries, and a dogfooding workflow. It is part of a small maintenance toolkit with `readme-command-verifier`, `gha-linter-lite`, and `pr-risk-scanner`, which cover README command drift, workflow hygiene, and pull request risk signals.

I would use Codex credits for maintainership tasks: issue triage, test-backed feature work, CI failure analysis, documentation improvements, release preparation, and small external OSS contributions found by these tools. The credits would directly support open source maintenance workflows rather than private product development.
