# Finding Reference

This page documents the finding IDs emitted by Repo Doctor v0.1. Finding IDs are stable strings intended for reports, future configuration, and issue discussion.

Severities are heuristics, not a guarantee of project quality or risk. They may change across releases as checks become more precise.

| Finding ID | Severity | Meaning | Recommendation |
| --- | --- | --- | --- |
| `missing-readme` | high | The repository does not include a README file. | Add a README with installation, usage, and contribution guidance. |
| `readme-missing-install` | low | A README exists, but it does not include an obvious installation or setup section. | Add an Installation, Setup, or Getting started section. |
| `readme-missing-usage` | low | A README exists, but it does not include an obvious usage or examples section. | Add a Usage or Examples section with a copy-paste command. |
| `missing-license` | high | The repository does not include a license file. | Add a license file so users know how they may use the project. |
| `missing-tests` | medium | The repository does not expose an obvious test suite. | Add tests or a package test script so contributors can verify changes. |
| `missing-ci` | medium | The repository does not include a GitHub Actions workflow. | Add a CI workflow that runs tests and lint checks on pull requests. |
| `missing-security-policy` | medium | The repository does not document how to report security issues. | Add `SECURITY.md` with supported versions and a disclosure contact. |
| `missing-package-metadata` | medium | The repository does not include common package metadata. | Add package metadata for the project's ecosystem. |
| `missing-issue-template` | low | The repository does not include an issue template. | Add issue templates to guide bug reports and feature requests. |
| `missing-pr-template` | low | The repository does not include a pull request template. | Add a PR template that asks contributors for context and test evidence. |
| `missing-changelog` | low | The repository does not include changelog or release notes. | Add `CHANGELOG.md` to make release history easier to follow. |

## Severity Levels

- `high`: A missing signal that can block adoption or make project usage unclear.
- `medium`: A missing maintenance signal that weakens contributor confidence or CI automation.
- `low`: A useful maintainer workflow improvement.

## Notes

Repo Doctor v0.1 only checks local repository files. It does not inspect GitHub stars, forks, issue response time, maintainer activity, package downloads, or release cadence.

