# Maintainer Workflows

Repo Doctor is designed for small, repeatable maintenance decisions. It is not a replacement for human review, but it gives maintainers a consistent checklist before issues, pull requests, and releases drift.

## Issue Triage

Use Repo Doctor when a project reports setup, documentation, or release-readiness problems:

```bash
npm run build
node dist/cli.js /path/to/project --markdown
```

Triage findings into:

- **Bug**: the project has the file or metadata, but Repo Doctor reports the wrong state.
- **Documentation gap**: README, changelog, security policy, or templates are missing or unclear.
- **Roadmap candidate**: the requested signal needs a new check or better severity model.

For false positives, capture a minimal repository shape in a test before changing scanner behavior.

## Pull Request Review

Run Repo Doctor on contributor branches to catch maintenance regressions:

```bash
repo-doctor . --markdown --fail-on medium
```

Reviewers should focus on whether findings are actionable. A finding should help a maintainer decide what to do next, not create vague quality pressure.

## Release Readiness

Before a release:

1. Run `npm test`, `npm run lint`, `npm run build`, and `npm run doctor:self`.
2. Confirm `CHANGELOG.md` lists user-visible changes.
3. Confirm the GitHub Action example points at the new release tag.
4. Confirm findings documentation matches current scanner behavior.
5. Create the release only after the release PR has passed CI.

## Dogfooding

Repo Doctor dogfoods a small maintenance toolkit:

- `repo-doctor` checks repository health signals.
- `readme-command-verifier` checks README command drift.
- `gha-linter-lite` checks workflow hygiene.
- `pr-risk-scanner` summarizes changed-file risk in pull requests.

The goal is to keep maintenance work public, reproducible, and reviewable.
