import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const currentFindingIds = [
  "missing-readme",
  "readme-missing-install",
  "readme-missing-usage",
  "missing-license",
  "missing-tests",
  "missing-ci",
  "missing-security-policy",
  "missing-package-metadata",
  "node-package-missing-description",
  "node-package-missing-license",
  "node-package-missing-repository",
  "python-project-missing-name",
  "python-project-missing-test-tooling",
  "missing-issue-template",
  "missing-pr-template",
  "missing-changelog"
];

describe("finding documentation", () => {
  it("documents every current finding ID", async () => {
    const docs = await readFile("docs/findings.md", "utf8");

    for (const findingId of currentFindingIds) {
      expect(docs).toContain(`\`${findingId}\``);
    }

    expect(docs).toContain("Severities are heuristics");
  });
});

