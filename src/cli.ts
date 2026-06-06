#!/usr/bin/env node
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { appendFile } from "node:fs/promises";

import { projectFileChecks } from "./checks/projectFiles.js";
import { loadRepoDoctorConfig } from "./core/config.js";
import { pathExists } from "./core/fs.js";
import { scanRepository, shouldFailForThreshold } from "./core/scanner.js";
import type { Severity } from "./core/types.js";
import { renderJsonReport } from "./reporters/json.js";
import { renderMarkdownReport } from "./reporters/markdown.js";
import { renderTextReport } from "./reporters/text.js";

type OutputFormat = "text" | "json" | "markdown";

interface CliOptions {
  targetPath: string;
  outputFormat: OutputFormat;
  failOn?: Severity;
  writeJobSummary: boolean;
}

interface CliIo {
  cwd?: string;
  env?: Record<string, string | undefined>;
  writeStdout(value: string): void;
  writeStderr(value: string): void;
}

export async function runCli(args: string[], io: CliIo): Promise<number> {
  try {
    if (args.includes("--version") || args.includes("-v")) {
      io.writeStdout(`${readPackageVersion()}\n`);
      return 0;
    }

    const options = parseArgs(args);
    const rootPath = path.resolve(io.cwd ?? process.cwd(), options.targetPath);

    if (!(await pathExists(rootPath))) {
      io.writeStderr(`Path does not exist: ${rootPath}\n`);
      return 1;
    }

    const config = await loadRepoDoctorConfig(rootPath);
    const result = await scanRepository(rootPath, projectFileChecks, {
      ignoreFindingIds: config.ignore
    });
    io.writeStdout(renderResult(result, options.outputFormat));
    await writeJobSummaryIfNeeded(result, options, io.env ?? process.env);

    return shouldFailForThreshold(result.findings, options.failOn ?? config.failOn)
      ? 1
      : 0;
  } catch (error) {
    io.writeStderr(`${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}

function parseArgs(args: string[]): CliOptions {
  let targetPath = ".";
  let outputFormat: OutputFormat = "text";
  let failOn: Severity | undefined;
  let writeJobSummary = true;
  let sawOutputFlag = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--help" || arg === "-h") {
      throw new Error(helpText());
    }

    if (arg === "--json" || arg === "--markdown") {
      if (sawOutputFlag) {
        throw new Error("Choose only one output format: --json or --markdown.");
      }

      outputFormat = arg === "--json" ? "json" : "markdown";
      sawOutputFlag = true;
      continue;
    }

    if (arg === "--no-job-summary") {
      writeJobSummary = false;
      continue;
    }

    if (arg === "--fail-on") {
      const value = args[index + 1];

      if (!isSeverity(value)) {
        throw new Error("--fail-on must be one of: low, medium, high.");
      }

      failOn = value;
      index += 1;
      continue;
    }

    if (arg?.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    if (targetPath !== ".") {
      throw new Error("Repo Doctor accepts only one repository path.");
    }

    targetPath = arg ?? ".";
  }

  return {
    targetPath,
    outputFormat,
    failOn,
    writeJobSummary
  };
}

function renderResult(
  result: Awaited<ReturnType<typeof scanRepository>>,
  outputFormat: OutputFormat
): string {
  if (outputFormat === "json") {
    return renderJsonReport(result);
  }

  if (outputFormat === "markdown") {
    return renderMarkdownReport(result);
  }

  return renderTextReport(result);
}

function isSeverity(value: string | undefined): value is Severity {
  return value === "low" || value === "medium" || value === "high";
}

function helpText(): string {
  return [
    "Repo Doctor",
    "",
    "Usage:",
    "  repo-doctor [path] [--json|--markdown] [--fail-on low|medium|high]",
    "",
    "Options:",
    "  --version    Print the package version.",
    "  --json       Print machine-readable JSON.",
    "  --markdown   Print a Markdown report.",
    "  --fail-on    Exit 1 when findings meet or exceed a severity threshold.",
    "  --no-job-summary  Do not write to GITHUB_STEP_SUMMARY."
  ].join("\n");
}

async function writeJobSummaryIfNeeded(
  result: Awaited<ReturnType<typeof scanRepository>>,
  options: CliOptions,
  env: Record<string, string | undefined>
): Promise<void> {
  const summaryPath = env.GITHUB_STEP_SUMMARY;

  if (!options.writeJobSummary || !summaryPath) {
    return;
  }

  await appendFile(summaryPath, renderMarkdownReport(result), "utf8");
}

function readPackageVersion(): string {
  const packageJsonUrl = new URL("../package.json", import.meta.url);
  const packageJson = JSON.parse(readFileSync(packageJsonUrl, "utf8")) as {
    version?: unknown;
  };

  return typeof packageJson.version === "string" ? packageJson.version : "0.0.0";
}

const entryPath = fileURLToPath(import.meta.url);

if (process.argv[1] && path.resolve(process.argv[1]) === entryPath) {
  const exitCode = await runCli(process.argv.slice(2), {
    writeStdout: (value) => process.stdout.write(value),
    writeStderr: (value) => process.stderr.write(value)
  });

  process.exitCode = exitCode;
}
