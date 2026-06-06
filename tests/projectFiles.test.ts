import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { runProjectFileChecks } from "../src/checks/projectFiles.js";

async function createFixture(): Promise<string> {
  return mkdtemp(path.join(tmpdir(), "repo-doctor-checks-"));
}

async function writeFixtureFile(
  rootPath: string,
  relativePath: string,
  content = ""
): Promise<void> {
  const targetPath = path.join(rootPath, relativePath);
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, content, "utf8");
}

describe("runProjectFileChecks", () => {
  it("reports missing maintenance files in an empty repository", async () => {
    const rootPath = await createFixture();

    const findings = await runProjectFileChecks({ rootPath });

    expect(findings.map((finding) => finding.id)).toEqual([
      "missing-readme",
      "missing-license",
      "missing-tests",
      "missing-ci",
      "missing-security-policy",
      "missing-package-metadata",
      "missing-issue-template",
      "missing-pr-template",
      "missing-changelog"
    ]);
  });

  it("accepts a repository with common maintenance files", async () => {
    const rootPath = await createFixture();
    await writeFixtureFile(
      rootPath,
      "README.md",
      "# Example\n\n## Installation\n\nnpm install\n\n## Usage\n\nrepo-doctor .\n"
    );
    await writeFixtureFile(rootPath, "LICENSE", "MIT\n");
    await writeFixtureFile(
      rootPath,
      "package.json",
      JSON.stringify({
        description: "Example package.",
        license: "MIT",
        repository: "https://github.com/example/example",
        scripts: { test: "vitest" }
      })
    );
    await writeFixtureFile(rootPath, "tests/example.test.ts", "test('ok', () => {})");
    await writeFixtureFile(rootPath, ".github/workflows/ci.yml", "name: CI\n");
    await writeFixtureFile(rootPath, ".github/ISSUE_TEMPLATE/bug.md", "bug\n");
    await writeFixtureFile(rootPath, ".github/PULL_REQUEST_TEMPLATE.md", "pr\n");
    await writeFixtureFile(rootPath, "SECURITY.md", "security\n");
    await writeFixtureFile(rootPath, "CHANGELOG.md", "# Changelog\n");

    const findings = await runProjectFileChecks({ rootPath });

    expect(findings).toEqual([]);
  });

  it("reports README files without install or usage guidance", async () => {
    const rootPath = await createFixture();
    await writeFixtureFile(rootPath, "README.md", "# Example\n\nA project.\n");

    const findings = await runProjectFileChecks({ rootPath });

    expect(findings.map((finding) => finding.id)).toContain("readme-missing-install");
    expect(findings.map((finding) => finding.id)).toContain("readme-missing-usage");
  });

  it("reports missing Node package metadata fields", async () => {
    const rootPath = await createFixture();
    await writeFixtureFile(rootPath, "package.json", '{"scripts":{"test":"vitest"}}');

    const findings = await runProjectFileChecks({ rootPath });

    expect(findings.map((finding) => finding.id)).toEqual(
      expect.arrayContaining([
        "node-package-missing-description",
        "node-package-missing-license",
        "node-package-missing-repository"
      ])
    );
  });

  it("does not require package.json license when a license file exists", async () => {
    const rootPath = await createFixture();
    await writeFixtureFile(
      rootPath,
      "package.json",
      JSON.stringify({
        description: "Example package.",
        repository: "https://github.com/example/example",
        scripts: { test: "vitest" }
      })
    );
    await writeFixtureFile(rootPath, "LICENSE", "MIT\n");

    const findings = await runProjectFileChecks({ rootPath });

    expect(findings.map((finding) => finding.id)).not.toContain(
      "node-package-missing-license"
    );
  });
});
