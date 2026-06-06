import type { Finding, RepositoryCheck, ScanResult, Severity } from "./types.js";

const severityPenalty: Record<Severity, number> = {
  high: 25,
  medium: 10,
  low: 3
};

const severityRank: Record<Severity, number> = {
  high: 3,
  medium: 2,
  low: 1
};

export function scoreFindings(findings: Finding[]): number {
  const penalty = findings.reduce(
    (total, finding) => total + severityPenalty[finding.severity],
    0
  );

  return Math.max(0, 100 - penalty);
}

export function shouldFailForThreshold(
  findings: Finding[],
  threshold?: Severity
): boolean {
  if (!threshold) {
    return false;
  }

  return findings.some(
    (finding) => severityRank[finding.severity] >= severityRank[threshold]
  );
}

export async function scanRepository(
  rootPath: string,
  checks: RepositoryCheck[]
): Promise<ScanResult> {
  const findings = (
    await Promise.all(checks.map((check) => check.run({ rootPath })))
  ).flat();
  const sortedFindings = [...findings].sort((left, right) => {
    const severityDifference =
      severityRank[right.severity] - severityRank[left.severity];

    if (severityDifference !== 0) {
      return severityDifference;
    }

    return left.id.localeCompare(right.id);
  });

  return {
    rootPath,
    checkedAt: new Date().toISOString(),
    score: scoreFindings(sortedFindings),
    findings: sortedFindings
  };
}

