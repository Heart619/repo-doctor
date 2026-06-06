# Repo Doctor

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

Print the installed version:

```bash
repo-doctor --version
```

Fail CI when medium or high severity findings exist:

```bash
repo-doctor . --fail-on medium
```

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
      - uses: Heart619/repo-doctor@v0.1.0
        with:
          path: "."
          args: "--markdown --fail-on medium"
```

## Checks

Repo Doctor v0.1 checks for:

- README presence and basic installation/usage sections.
- License file.
- Test directory or package test script.
- GitHub Actions workflow.
- Issue template.
- Pull request template.
- Security policy.
- Changelog or release notes.
- Common package metadata.

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

- Add language-specific checks for Python, Rust, and Go projects.
- Add SARIF output for code scanning integrations.
- Add configurable check selection.
- Add release-readiness checks for maintainers.
- Add GitHub API integration for issue and PR maintenance signals.

## Contributing

Issues and pull requests are welcome. Please include the repository shape you tested against and the command output when reporting false positives.

## License

MIT
