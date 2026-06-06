import { readFile } from "node:fs/promises";
import path from "node:path";

import { pathExists } from "./fs.js";
import type { Severity } from "./types.js";

export interface RepoDoctorConfig {
  ignore: string[];
  failOn?: Severity;
}

export async function loadRepoDoctorConfig(
  rootPath: string
): Promise<RepoDoctorConfig> {
  const configPath = path.join(rootPath, "repo-doctor.config.json");

  if (!(await pathExists(configPath))) {
    return { ignore: [] };
  }

  const rawConfig = await readFile(configPath, "utf8");
  const parsed = JSON.parse(rawConfig) as {
    ignore?: unknown;
    failOn?: unknown;
  };

  return {
    ignore: Array.isArray(parsed.ignore)
      ? parsed.ignore.filter((value): value is string => typeof value === "string")
      : [],
    failOn: isSeverity(parsed.failOn) ? parsed.failOn : undefined
  };
}

function isSeverity(value: unknown): value is Severity {
  return value === "low" || value === "medium" || value === "high";
}

