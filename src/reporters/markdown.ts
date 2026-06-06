import type { Finding, ScanResult } from "../core/types.js";

export function renderMarkdownReport(result: ScanResult): string {
  const lines = [
    "# Repo Doctor Report",
    "",
    `**Repository:** \`${result.rootPath}\``,
    `**Checked at:** ${result.checkedAt}`,
    `**Score:** ${result.score}/100`,
    ""
  ];

  if (result.findings.length === 0) {
    lines.push("No findings.");
    return `${lines.join("\n")}\n`;
  }

  lines.push(
    "| Severity | Finding | Recommendation | Files |",
    "| --- | --- | --- | --- |"
  );

  for (const finding of result.findings) {
    lines.push(renderFindingRow(finding));
  }

  return `${lines.join("\n")}\n`;
}

function renderFindingRow(finding: Finding): string {
  const files =
    finding.files && finding.files.length > 0
      ? finding.files.map((file) => `\`${escapeMarkdown(file)}\``).join(", ")
      : "";

  return `| ${finding.severity} | ${escapeMarkdown(
    finding.title
  )} | ${escapeMarkdown(finding.recommendation)} | ${files} |`;
}

function escapeMarkdown(value: string): string {
  return value.replace(/\|/g, "\\|");
}

