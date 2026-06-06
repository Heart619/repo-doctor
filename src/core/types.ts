export type Severity = "low" | "medium" | "high";

export interface Finding {
  id: string;
  title: string;
  severity: Severity;
  message: string;
  recommendation: string;
  files?: string[];
}

export interface CheckContext {
  rootPath: string;
}

export interface RepositoryCheck {
  id: string;
  run(context: CheckContext): Promise<Finding[]> | Finding[];
}

export interface ScanResult {
  rootPath: string;
  checkedAt: string;
  score: number;
  findings: Finding[];
}

