import type { ScanResult } from "../core/types.js";

export function renderJsonReport(result: ScanResult): string {
  return `${JSON.stringify(result, null, 2)}\n`;
}

