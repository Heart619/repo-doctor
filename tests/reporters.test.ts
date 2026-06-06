import { describe, expect, it } from "vitest";

import { renderJsonReport } from "../src/reporters/json.js";
import { renderMarkdownReport } from "../src/reporters/markdown.js";
import { renderSarifReport } from "../src/reporters/sarif.js";
import { renderTextReport } from "../src/reporters/text.js";
import type { ScanResult } from "../src/core/types.js";

const result: ScanResult = {
  rootPath: "C:/repo",
  checkedAt: "2026-06-06T06:00:00.000Z",
  score: 62,
  findings: [
    {
      id: "missing-license",
      title: "Missing license",
      severity: "high",
      message: "The repository does not include a license file.",
      recommendation: "Add a license file.",
      files: ["LICENSE"]
    },
    {
      id: "missing-ci",
      title: "Missing CI workflow",
      severity: "medium",
      message: "The repository does not include a GitHub Actions workflow.",
      recommendation: "Add a CI workflow."
    }
  ]
};

describe("renderTextReport", () => {
  it("renders a readable terminal report", () => {
    const report = renderTextReport(result);

    expect(report).toContain("Repo Doctor");
    expect(report).toContain("Score: 62/100");
    expect(report).toContain("[HIGH] Missing license");
    expect(report).toContain("Recommendation: Add a license file.");
  });
});

describe("renderJsonReport", () => {
  it("renders parseable JSON", () => {
    const parsed = JSON.parse(renderJsonReport(result)) as ScanResult;

    expect(parsed.score).toBe(62);
    expect(parsed.findings[0]?.id).toBe("missing-license");
  });
});

describe("renderMarkdownReport", () => {
  it("renders a Markdown report with a findings table", () => {
    const report = renderMarkdownReport(result);

    expect(report).toContain("# Repo Doctor Report");
    expect(report).toContain("**Score:** 62/100");
    expect(report).toContain(
      "| high | Missing license | Add a license file. | `LICENSE` |"
    );
  });
});

describe("renderSarifReport", () => {
  it("renders SARIF 2.1.0 with finding IDs as rule IDs", () => {
    const parsed = JSON.parse(renderSarifReport(result)) as {
      version: string;
      runs: Array<{
        tool: {
          driver: {
            name: string;
            rules: Array<{ id: string }>;
          };
        };
        results: Array<{
          ruleId: string;
          level: string;
          message: { text: string };
          locations: Array<{
            physicalLocation: { artifactLocation: { uri: string } };
          }>;
        }>;
      }>;
    };

    expect(parsed.version).toBe("2.1.0");
    expect(parsed.runs[0]?.tool.driver.name).toBe("Repo Doctor");
    expect(parsed.runs[0]?.tool.driver.rules.map((rule) => rule.id)).toEqual([
      "missing-license",
      "missing-ci"
    ]);
    expect(parsed.runs[0]?.results[0]).toMatchObject({
      ruleId: "missing-license",
      level: "error",
      message: { text: "The repository does not include a license file." }
    });
    expect(
      parsed.runs[0]?.results[0]?.locations[0]?.physicalLocation
        .artifactLocation.uri
    ).toBe("LICENSE");
    expect(parsed.runs[0]?.results[1]?.level).toBe("warning");
  });
});
