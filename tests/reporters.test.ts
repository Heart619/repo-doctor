import { describe, expect, it } from "vitest";

import { renderJsonReport } from "../src/reporters/json.js";
import { renderMarkdownReport } from "../src/reporters/markdown.js";
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

