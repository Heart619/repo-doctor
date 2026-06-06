# Maintainers

## Current Maintainer

- Heart619

## Maintenance Principles

- Keep checks explainable and useful for small open source projects.
- Prefer static analysis and repository metadata over network-dependent heuristics.
- Require tests for parser, reporter, and scoring behavior changes.
- Keep GitHub Action output readable in pull request and job summary contexts.

## Release Process

1. Confirm `npm test`, `npm run lint`, `npm run build`, and `npm run doctor:self` pass.
2. Update `CHANGELOG.md` for user-visible changes.
3. Merge through a pull request with passing GitHub Actions checks.
4. Create a GitHub release with concise notes and upgrade guidance.
