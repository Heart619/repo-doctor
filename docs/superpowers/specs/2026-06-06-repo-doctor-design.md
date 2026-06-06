# Repo Doctor Design

## Goal

Build a small, useful open-source maintainer tool that audits a repository for common project-health signals and reports actionable gaps. The first release should be credible as a public GitHub project: tested, documented, CI-backed, and usable as both a local CLI and a GitHub Action.

## Assumptions

- The initial repository owner will be `Heart619`.
- The first public repository name will be `repo-doctor`.
- The MVP will not call GitHub APIs. It will inspect files in a local checkout.
- The tool will avoid speculative AI features in v0.1. That keeps the first release deterministic, fast, and easy to trust.
- The tool will provide useful checks without pretending to measure real project quality perfectly.

## Scope

Repo Doctor v0.1 scans a local repository path and checks for:

- README presence and basic usage/install sections.
- License file presence.
- Test configuration or test files.
- CI workflow presence.
- Issue template presence.
- Pull request template presence.
- Security policy presence.
- Changelog or release notes presence.
- Package metadata for Node, Python, or Rust projects.

The CLI supports:

- `repo-doctor [path]` for human-readable output.
- `repo-doctor [path] --json` for machine-readable output.
- `repo-doctor [path] --markdown` for a Markdown report.
- `repo-doctor [path] --fail-on medium` to make CI fail when findings at or above a severity threshold exist.

## Non-Goals

- No GitHub API integration in v0.1.
- No star, fork, download, or popularity scoring.
- No automated PR creation.
- No LLM-generated findings in the first release.
- No broad language-specific static analysis.

## Architecture

The project is a TypeScript Node CLI with a small core library. The scanner walks a repository root through focused checks. Each check returns zero or more findings plus a score contribution. Reporters convert the scan result into text, JSON, or Markdown without knowing filesystem details.

Core units:

- `src/core/types.ts`: shared types for findings, checks, and reports.
- `src/core/fs.ts`: safe filesystem helpers used by checks.
- `src/checks/*.ts`: one focused check per maintenance signal.
- `src/core/scanner.ts`: orchestrates checks and computes the score.
- `src/reporters/*.ts`: text, JSON, and Markdown output.
- `src/cli.ts`: argument parsing, CLI execution, exit code handling.

## Data Flow

1. CLI parses arguments and resolves the target repository path.
2. Scanner runs the registered checks against the target path.
3. Scanner combines findings and computes a health score from 0 to 100.
4. Reporter renders the selected output format.
5. CLI writes the report and exits with `0` or `1` based on `--fail-on`.

## Finding Model

Each finding includes:

- `id`: stable identifier, such as `missing-license`.
- `title`: short human-readable title.
- `severity`: `low`, `medium`, or `high`.
- `message`: explanation of the gap.
- `recommendation`: concrete next step.
- `files`: optional related paths.

## Scoring

Start at 100 and subtract:

- 25 for high findings.
- 10 for medium findings.
- 3 for low findings.

The final score is clamped between 0 and 100. This is intentionally simple for v0.1 and documented as a heuristic.

## GitHub Action

The repository will include a composite action in `action.yml` that runs:

```yaml
npx @heart619/repo-doctor . --markdown
```

The README will also show direct CLI usage in GitHub Actions before the package is published.

## Testing

Use Vitest with temporary fixture directories. Tests cover:

- Each check's positive and negative behavior.
- Score calculation.
- Text, JSON, and Markdown reporters.
- CLI exit behavior for severity thresholds.

## Release Readiness

The first local release candidate is ready when:

- `npm test` passes.
- `npm run build` passes.
- `npm run lint` passes.
- `npm run doctor:self` runs against the project and returns a report.
- README documents install, usage, GitHub Action usage, output formats, and roadmap.

