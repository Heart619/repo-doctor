import type { Finding, ScanResult } from "../core/types.js";

export function renderTextReport(result: ScanResult): string {
  const lines = [
    "Repo Doctor",
    `Repository: ${result.rootPath}`,
    `Checked at: ${result.checkedAt}`,
    `Score: ${result.score}/100`,
    ""
  ];

  if (result.findings.length === 0) {
    lines.push("No findings.");
    return `${lines.join("\n")}\n`;
  }

  lines.push("Findings:");

  for (const finding of result.findings) {
    lines.push("", renderFinding(finding));
  }

  return `${lines.join("\n")}\n`;
}

function renderFinding(finding: Finding): string {
  const lines = [
    `[${finding.severity.toUpperCase()}] ${finding.title}`,
    `ID: ${finding.id}`,
    `Message: ${finding.message}`,
    `Recommendation: ${finding.recommendation}`
  ];

  if (finding.files && finding.files.length > 0) {
    lines.push(`Files: ${finding.files.join(", ")}`);
  }

  return lines.join("\n");
}

