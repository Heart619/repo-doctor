import type { Finding, ScanResult, Severity } from "../core/types.js";

type SarifLevel = "error" | "warning" | "note";

const severityToSarifLevel: Record<Severity, SarifLevel> = {
  high: "error",
  medium: "warning",
  low: "note"
};

export function renderSarifReport(result: ScanResult): string {
  return `${JSON.stringify(
    {
      $schema:
        "https://json.schemastore.org/sarif-2.1.0.json",
      version: "2.1.0",
      runs: [
        {
          tool: {
            driver: {
              name: "Repo Doctor",
              informationUri: "https://github.com/Heart619/repo-doctor",
              rules: result.findings.map(toRule)
            }
          },
          results: result.findings.map(toResult)
        }
      ]
    },
    null,
    2
  )}\n`;
}

function toRule(finding: Finding): object {
  return {
    id: finding.id,
    name: finding.title,
    shortDescription: {
      text: finding.title
    },
    fullDescription: {
      text: finding.message
    },
    help: {
      text: finding.recommendation
    }
  };
}

function toResult(finding: Finding): object {
  return {
    ruleId: finding.id,
    level: severityToSarifLevel[finding.severity],
    message: {
      text: finding.message
    },
    locations: [
      {
        physicalLocation: {
          artifactLocation: {
            uri: finding.files?.[0] ?? "."
          }
        }
      }
    ]
  };
}

