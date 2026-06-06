import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  scanRepository,
  scoreFindings,
  shouldFailForThreshold
} from "../src/core/scanner.js";
import type { Finding, RepositoryCheck } from "../src/core/types.js";

const lowFinding: Finding = {
  id: "low",
  title: "Low finding",
  severity: "low",
  message: "Low severity message.",
  recommendation: "Fix the low severity issue."
};

const mediumFinding: Finding = {
  id: "medium",
  title: "Medium finding",
  severity: "medium",
  message: "Medium severity message.",
  recommendation: "Fix the medium severity issue."
};

const highFinding: Finding = {
  id: "high",
  title: "High finding",
  severity: "high",
  message: "High severity message.",
  recommendation: "Fix the high severity issue."
};

describe("scoreFindings", () => {
  it("subtracts weighted penalties from a starting score of 100", () => {
    expect(scoreFindings([lowFinding, mediumFinding, highFinding])).toBe(62);
  });

  it("clamps scores at zero", () => {
    const findings = Array.from({ length: 6 }, (_, index) => ({
      ...highFinding,
      id: `high-${index}`
    }));

    expect(scoreFindings(findings)).toBe(0);
  });
});

describe("shouldFailForThreshold", () => {
  it("matches findings at or above the selected threshold", () => {
    expect(shouldFailForThreshold([lowFinding], "medium")).toBe(false);
    expect(shouldFailForThreshold([mediumFinding], "medium")).toBe(true);
    expect(shouldFailForThreshold([highFinding], "medium")).toBe(true);
    expect(shouldFailForThreshold([mediumFinding], "high")).toBe(false);
    expect(shouldFailForThreshold([highFinding], "high")).toBe(true);
  });

  it("does not fail when no threshold is provided", () => {
    expect(shouldFailForThreshold([highFinding])).toBe(false);
  });
});

describe("scanRepository", () => {
  it("runs checks and combines findings into a sorted scan result", async () => {
    const rootPath = await mkdtemp(path.join(tmpdir(), "repo-doctor-"));
    const checks: RepositoryCheck[] = [
      {
        id: "low-check",
        run: async () => [lowFinding]
      },
      {
        id: "high-check",
        run: async () => [highFinding]
      }
    ];

    const result = await scanRepository(rootPath, checks);

    expect(result.rootPath).toBe(rootPath);
    expect(result.score).toBe(72);
    expect(result.findings.map((finding) => finding.id)).toEqual(["high", "low"]);
    expect(result.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

