import path from "node:path";
import { readFile } from "node:fs/promises";

import {
  anyPathExists,
  directoryContainsFile,
  pathExists,
  readFirstExistingText
} from "../core/fs.js";
import type { CheckContext, Finding, RepositoryCheck } from "../core/types.js";

const readmeFiles = ["README.md", "README", "readme.md"];

export const projectFileChecks: RepositoryCheck[] = [
  {
    id: "project-files",
    run: runProjectFileChecks
  }
];

export async function runProjectFileChecks({
  rootPath
}: CheckContext): Promise<Finding[]> {
  const findings: Finding[] = [];

  await checkReadme(rootPath, findings);
  await checkRequiredFile(rootPath, findings, {
    id: "missing-license",
    title: "Missing license",
    severity: "high",
    candidates: ["LICENSE", "LICENSE.md", "COPYING"],
    message: "The repository does not include a license file.",
    recommendation: "Add a license file so users know how they may use the project."
  });
  await checkTests(rootPath, findings);
  await checkCi(rootPath, findings);
  await checkRequiredFile(rootPath, findings, {
    id: "missing-security-policy",
    title: "Missing security policy",
    severity: "medium",
    candidates: ["SECURITY.md", ".github/SECURITY.md"],
    message: "The repository does not document how to report security issues.",
    recommendation: "Add SECURITY.md with supported versions and a disclosure contact."
  });
  await checkPackageMetadata(rootPath, findings);
  await checkIssueTemplate(rootPath, findings);
  await checkRequiredFile(rootPath, findings, {
    id: "missing-pr-template",
    title: "Missing pull request template",
    severity: "low",
    candidates: [
      ".github/PULL_REQUEST_TEMPLATE.md",
      "docs/PULL_REQUEST_TEMPLATE.md",
      "PULL_REQUEST_TEMPLATE.md"
    ],
    message: "The repository does not include a pull request template.",
    recommendation: "Add a PR template that asks contributors for context and test evidence."
  });
  await checkRequiredFile(rootPath, findings, {
    id: "missing-changelog",
    title: "Missing changelog",
    severity: "low",
    candidates: ["CHANGELOG.md", "HISTORY.md", "RELEASES.md"],
    message: "The repository does not include changelog or release notes.",
    recommendation: "Add CHANGELOG.md to make release history easier to follow."
  });

  return findings;
}

async function checkReadme(
  rootPath: string,
  findings: Finding[]
): Promise<void> {
  const readme = await readFirstExistingText(rootPath, readmeFiles);

  if (readme === undefined) {
    findings.push({
      id: "missing-readme",
      title: "Missing README",
      severity: "high",
      message: "The repository does not include a README file.",
      recommendation: "Add a README with installation, usage, and contribution guidance.",
      files: readmeFiles
    });
    return;
  }

  if (!hasSection(readme, ["install", "installation", "setup", "getting started"])) {
    findings.push({
      id: "readme-missing-install",
      title: "README missing installation guidance",
      severity: "low",
      message: "The README exists but does not include an obvious installation section.",
      recommendation: "Add an Installation or Getting started section.",
      files: readmeFiles
    });
  }

  if (!hasSection(readme, ["usage", "quick start", "examples"])) {
    findings.push({
      id: "readme-missing-usage",
      title: "README missing usage guidance",
      severity: "low",
      message: "The README exists but does not include an obvious usage section.",
      recommendation: "Add a Usage or Examples section with a copy-paste command.",
      files: readmeFiles
    });
  }
}

async function checkRequiredFile(
  rootPath: string,
  findings: Finding[],
  options: Finding & { candidates: string[] }
): Promise<void> {
  if (await anyPathExists(rootPath, options.candidates)) {
    return;
  }

  findings.push({
    id: options.id,
    title: options.title,
    severity: options.severity,
    message: options.message,
    recommendation: options.recommendation,
    files: options.candidates
  });
}

async function checkTests(
  rootPath: string,
  findings: Finding[]
): Promise<void> {
  const hasTestDirectory = await anyPathExists(rootPath, [
    "tests",
    "test",
    "__tests__"
  ]);
  const packageJsonHasTestScript = await hasPackageJsonTestScript(rootPath);

  if (hasTestDirectory || packageJsonHasTestScript) {
    return;
  }

  findings.push({
    id: "missing-tests",
    title: "Missing tests",
    severity: "medium",
    message: "The repository does not expose an obvious test suite.",
    recommendation: "Add tests or a package test script so contributors can verify changes.",
    files: ["tests", "test", "__tests__", "package.json"]
  });
}

async function checkCi(rootPath: string, findings: Finding[]): Promise<void> {
  const hasWorkflow = await directoryContainsFile(
    rootPath,
    ".github/workflows",
    (fileName) => fileName.endsWith(".yml") || fileName.endsWith(".yaml")
  );

  if (hasWorkflow) {
    return;
  }

  findings.push({
    id: "missing-ci",
    title: "Missing CI workflow",
    severity: "medium",
    message: "The repository does not include a GitHub Actions workflow.",
    recommendation: "Add a CI workflow that runs tests and lint checks on pull requests.",
    files: [".github/workflows"]
  });
}

async function checkPackageMetadata(
  rootPath: string,
  findings: Finding[]
): Promise<void> {
  const packageJsonPath = path.join(rootPath, "package.json");
  const hasMetadata = await anyPathExists(rootPath, [
    "package.json",
    "pyproject.toml",
    "setup.py",
    "Cargo.toml",
    "go.mod",
    "pom.xml"
  ]);

  if (!hasMetadata) {
    findings.push({
      id: "missing-package-metadata",
      title: "Missing package metadata",
      severity: "medium",
      message: "The repository does not include common package metadata.",
      recommendation: "Add package metadata for the project's ecosystem.",
      files: ["package.json", "pyproject.toml", "Cargo.toml", "go.mod", "pom.xml"]
    });
  }

  if (await pathExists(packageJsonPath)) {
    await checkNodePackageMetadata(rootPath, findings);
  }
}

async function checkIssueTemplate(
  rootPath: string,
  findings: Finding[]
): Promise<void> {
  const hasSingleTemplate = await anyPathExists(rootPath, [
    ".github/ISSUE_TEMPLATE.md",
    "ISSUE_TEMPLATE.md"
  ]);
  const hasTemplateDirectory = await directoryContainsFile(
    rootPath,
    ".github/ISSUE_TEMPLATE",
    (fileName) =>
      fileName.endsWith(".md") ||
      fileName.endsWith(".yml") ||
      fileName.endsWith(".yaml")
  );

  if (hasSingleTemplate || hasTemplateDirectory) {
    return;
  }

  findings.push({
    id: "missing-issue-template",
    title: "Missing issue template",
    severity: "low",
    message: "The repository does not include an issue template.",
    recommendation: "Add issue templates to guide bug reports and feature requests.",
    files: [".github/ISSUE_TEMPLATE.md", ".github/ISSUE_TEMPLATE"]
  });
}

async function hasPackageJsonTestScript(rootPath: string): Promise<boolean> {
  const parsed = await readPackageJson(rootPath);

  return typeof parsed?.scripts?.test === "string";
}

async function checkNodePackageMetadata(
  rootPath: string,
  findings: Finding[]
): Promise<void> {
  const packageJson = await readPackageJson(rootPath);

  if (!packageJson) {
    return;
  }

  if (!isNonEmptyString(packageJson.description)) {
    findings.push({
      id: "node-package-missing-description",
      title: "Node package missing description",
      severity: "low",
      message: "package.json does not include a description.",
      recommendation: "Add a short package description for npm and GitHub metadata.",
      files: ["package.json"]
    });
  }

  if (
    !isNonEmptyString(packageJson.license) &&
    !(await anyPathExists(rootPath, ["LICENSE", "LICENSE.md", "COPYING"]))
  ) {
    findings.push({
      id: "node-package-missing-license",
      title: "Node package missing license metadata",
      severity: "low",
      message: "package.json does not include a license and no license file exists.",
      recommendation: "Add a package.json license field or a license file.",
      files: ["package.json", "LICENSE"]
    });
  }

  if (!hasRepositoryMetadata(packageJson.repository)) {
    findings.push({
      id: "node-package-missing-repository",
      title: "Node package missing repository metadata",
      severity: "low",
      message: "package.json does not include repository metadata.",
      recommendation: "Add a repository field that points to the source repository.",
      files: ["package.json"]
    });
  }
}

async function readPackageJson(rootPath: string): Promise<
  | {
      description?: unknown;
      license?: unknown;
      repository?: unknown;
      scripts?: Record<string, unknown>;
    }
  | undefined
> {
  const packageJsonPath = path.join(rootPath, "package.json");

  if (!(await pathExists(packageJsonPath))) {
    return undefined;
  }

  try {
    const rawPackageJson = await readFile(packageJsonPath, "utf8");
    return JSON.parse(rawPackageJson) as {
      description?: unknown;
      license?: unknown;
      repository?: unknown;
      scripts?: Record<string, unknown>;
    };
  } catch {
    return undefined;
  }
}

function hasRepositoryMetadata(repository: unknown): boolean {
  if (isNonEmptyString(repository)) {
    return true;
  }

  if (
    typeof repository === "object" &&
    repository !== null &&
    "url" in repository
  ) {
    return isNonEmptyString(repository.url);
  }

  return false;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasSection(content: string, names: string[]): boolean {
  const lowerContent = content.toLowerCase();

  return names.some((name) =>
    new RegExp(`(^|\\n)\\s*#{1,6}\\s+${escapeRegExp(name)}\\b`).test(
      lowerContent
    )
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
