# Repo Doctor MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and verify the first public MVP of Repo Doctor, a TypeScript CLI that audits OSS repository maintenance health.

**Architecture:** A small TypeScript Node CLI will expose one command that runs deterministic filesystem checks. Check modules produce typed findings, the scanner computes a score, and reporters render text, JSON, or Markdown.

**Tech Stack:** Node.js, TypeScript, Vitest, ESLint, npm scripts, GitHub Actions.

---

## File Structure

- `package.json`: package metadata, CLI bin, scripts, dependencies.
- `tsconfig.json`: TypeScript compiler configuration.
- `vitest.config.ts`: test configuration.
- `eslint.config.js`: lint configuration.
- `src/core/types.ts`: shared types.
- `src/core/fs.ts`: filesystem helpers.
- `src/core/scanner.ts`: check orchestration and scoring.
- `src/checks/projectFiles.ts`: repository maintenance checks.
- `src/reporters/text.ts`: human-readable report.
- `src/reporters/json.ts`: JSON report.
- `src/reporters/markdown.ts`: Markdown report.
- `src/cli.ts`: CLI argument parsing and process exit behavior.
- `tests/*.test.ts`: unit and CLI tests with temp fixtures.
- `.github/workflows/ci.yml`: CI for test, lint, and build.
- `action.yml`: GitHub Action metadata.
- `README.md`: public-facing documentation.
- `LICENSE`: MIT license.
- `.gitignore`: generated files and dependency folders.

## Tasks

### Task 1: Bootstrap Project Metadata

- [ ] Create `package.json` with package name `@heart619/repo-doctor`, CLI bin `repo-doctor`, and scripts: `build`, `test`, `lint`, `doctor:self`.
- [ ] Create `tsconfig.json`, `vitest.config.ts`, `eslint.config.js`, `.gitignore`, and `LICENSE`.
- [ ] Install dependencies with `npm install`.
- [ ] Verify `npm test` initially runs with no tests or expected setup output.

### Task 2: Define Core Types and Scanner with TDD

- [ ] Write failing tests for scan result shape, score calculation, and severity threshold matching.
- [ ] Implement `src/core/types.ts` and `src/core/scanner.ts`.
- [ ] Run targeted tests and confirm they pass.

### Task 3: Implement Repository Checks with TDD

- [ ] Write failing fixture tests for missing README, license, CI, templates, security policy, changelog, tests, and package metadata.
- [ ] Implement `src/core/fs.ts` and `src/checks/projectFiles.ts`.
- [ ] Run targeted tests and confirm they pass.

### Task 4: Implement Reporters with TDD

- [ ] Write failing tests for text, JSON, and Markdown reporter output.
- [ ] Implement `src/reporters/text.ts`, `src/reporters/json.ts`, and `src/reporters/markdown.ts`.
- [ ] Run targeted tests and confirm they pass.

### Task 5: Implement CLI with TDD

- [ ] Write failing CLI tests for default text output, `--json`, `--markdown`, missing path handling, and `--fail-on`.
- [ ] Implement `src/cli.ts`.
- [ ] Run targeted CLI tests and confirm they pass.

### Task 6: Add Public Project Materials

- [ ] Write `README.md` with install, usage, output examples, GitHub Action usage, roadmap, and contribution notes.
- [ ] Add `.github/workflows/ci.yml`.
- [ ] Add `action.yml`.
- [ ] Run `npm run doctor:self` and include the tool's own report in local verification notes.

### Task 7: Final Verification and Git History

- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Run `npm run doctor:self`.
- [ ] Commit the finished MVP locally.

