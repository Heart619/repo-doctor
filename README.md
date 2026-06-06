# Repo Doctor

[![CI](https://github.com/Heart619/repo-doctor/actions/workflows/ci.yml/badge.svg)](https://github.com/Heart619/repo-doctor/actions/workflows/ci.yml)
[![Maintenance Dogfood](https://github.com/Heart619/repo-doctor/actions/workflows/maintenance-dogfood.yml/badge.svg)](https://github.com/Heart619/repo-doctor/actions/workflows/maintenance-dogfood.yml)
[![CodeQL](https://github.com/Heart619/repo-doctor/actions/workflows/codeql.yml/badge.svg)](https://github.com/Heart619/repo-doctor/actions/workflows/codeql.yml)
[![OSSF Scorecard](https://github.com/Heart619/repo-doctor/actions/workflows/scorecard.yml/badge.svg)](https://github.com/Heart619/repo-doctor/actions/workflows/scorecard.yml)
[![Release](https://img.shields.io/github/v/release/Heart619/repo-doctor)](https://github.com/Heart619/repo-doctor/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Repo Doctor is a small CLI and GitHub Action that audits open-source repository maintenance health. It checks for common project signals such as README guidance, license, tests, CI, issue templates, pull request templates, security policy, changelog, and package metadata.

The score is a heuristic, not a quality certificate. The goal is to give maintainers a fast checklist with concrete next steps.

## Installation

Run from source:

```bash
git clone https://github.com/Heart619/repo-doctor.git
cd repo-doctor
npm ci
npm run build
node dist/cli.js .
```

After the package is published, run it with npm:

```bash
npx @heart619/repo-doctor@latest .
```

## Maintenance Evidence

Repo Doctor is maintained as a real OSS project rather than a one-off demo:

- CI verifies tests, linting, TypeScript build, and a self-audit on every pull request.
- The maintenance dogfood workflow runs Repo Doctor together with README Command Verifier, GHA Linter Lite, and PR Risk Scanner.
- CodeQL and OSSF Scorecard workflows provide scheduled security and supply-chain checks.
- Issues track focused roadmap items, and release notes document user-visible changes.
- Pull requests are kept scoped to one feature or maintenance improvement and are merged through CI.

## Documentation

- [Finding Reference](docs/findings.md) lists every finding ID, severity, and recommendation.
- [Maintainer Workflows](docs/maintainer-workflows.md) describes issue triage, pull request review, release readiness, and dogfooding.
- [Roadmap](docs/roadmap.md) links planned v0.3.0 work to public issues and milestones.
- [Examples](examples/README.md) shows local config, GitHub Action, and SARIF upload examples.
- [Contributing](CONTRIBUTING.md) explains local setup, issue reporting, pull request expectations, and release discipline.

## Usage

Scan the current repository:

```bash
repo-doctor .
```

Print JSON for automation:

```bash
repo-doctor . --json
```

Print a Markdown report:

```bash
repo-doctor . --markdown
```

Print a SARIF 2.1.0 report:

```bash
repo-doctor . --sarif
```

Print the installed version:

```bash
repo-doctor --version
```

Fail CI when medium or high severity findings exist:

```bash
repo-doctor . --fail-on medium
```

Disable GitHub Actions job summary output:

```bash
repo-doctor . --no-job-summary
```

## Configuration

Repo Doctor reads `repo-doctor.config.json` from the repository root when it exists:

```json
{
  "ignore": ["missing-changelog"],
  "failOn": "medium"
}
```

`ignore` skips findings by ID. `failOn` sets the default CI failure threshold. CLI flags take precedence over config values, so `repo-doctor . --fail-on high` overrides `failOn` from the config file.

## Example Output

```text
Repo Doctor
Repository: /path/to/repo
Checked at: 2026-06-06T06:00:00.000Z
Score: 72/100

Findings:

[HIGH] Missing license
ID: missing-license
Message: The repository does not include a license file.
Recommendation: Add a license file so users know how they may use the project.
Files: LICENSE, LICENSE.md, COPYING
```

## GitHub Action

Use Repo Doctor in a workflow:

```yaml
name: Repo Doctor

on:
  pull_request:
  push:
    branches: [main]

jobs:
  repo-doctor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: Heart619/repo-doctor@v0.2.0
        with:
          path: "."
          args: "--markdown --fail-on medium"
```

When the action runs in GitHub Actions, Repo Doctor appends a Markdown report to the job summary by default. Add `--no-job-summary` to `args` to disable this.

SARIF output can be redirected to a file and uploaded with GitHub code scanning tools:

```bash
repo-doctor . --sarif --no-job-summary > repo-doctor.sarif
```

## Checks

Repo Doctor checks for:

- README presence and basic installation/usage sections.
- License file.
- Test directory or package test script.
- GitHub Actions workflow.
- Issue template.
- Pull request template.
- Security policy.
- Changelog or release notes.
- Common package metadata.
- Node package description, license, and repository metadata.
- Python project name and test tooling hints.

See [Finding Reference](docs/findings.md) for every current finding ID, severity, and recommendation.

## Development

Install dependencies:

```bash
npm ci
```

Run tests:

```bash
npm test
```

Run lint:

```bash
npm run lint
```

Build:

```bash
npm run build
```

Run Repo Doctor against itself:

```bash
npm run build
npm run doctor:self
```

## Roadmap

- Improve monorepo package detection.
- Add config schema validation.
- Improve SARIF rule metadata.
- Add release-readiness checks for maintainers.
- Add GitHub API integration for issue and PR maintenance signals.

## Contributing

Issues and pull requests are welcome. Please include the repository shape you tested against and the command output when reporting false positives.

## License

MIT
