# Contributing to Repo Doctor

Thanks for helping improve Repo Doctor. This project is intentionally small: changes should be easy to review, backed by tests when behavior changes, and useful to maintainers of real open source repositories.

## Development Setup

Use Node.js 20 or newer.

```bash
git clone https://github.com/Heart619/repo-doctor.git
cd repo-doctor
npm ci
npm run build
npm test
```

Run the full local verification set before opening a pull request:

```bash
npm test
npm run lint
npm run build
npm run doctor:self
```

## Reporting Issues

For bugs and false positives, include:

- the repository shape that triggered the result;
- the command you ran;
- the relevant output;
- the behavior you expected.

For feature requests, describe the maintainer workflow it would improve. Repo Doctor favors checks that are explainable from local files or repository metadata.

## Pull Request Guidelines

- Keep each pull request focused on one behavior, documentation, or maintenance improvement.
- Add or update tests for scanner, reporter, config, or CLI behavior changes.
- Update `docs/findings.md` when adding, removing, or changing finding IDs.
- Update `README.md` when command usage, GitHub Action usage, or configuration changes.
- Update `CHANGELOG.md` for user-visible changes.

## Adding A Check

New checks should return actionable findings, not broad quality judgments. A good finding has:

- a stable ID;
- a severity that matches maintainer impact;
- a clear recommendation;
- file evidence when possible;
- tests for present and missing repository shapes.

## Release Process

Maintainers follow the process in `MAINTAINERS.md`: verify locally, update changelog entries, merge through a pull request with passing CI, then create a GitHub release with concise notes.
