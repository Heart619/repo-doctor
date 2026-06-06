import { mkdir, mkdtemp, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { runCli } from "../src/cli.js";
import type { ScanResult } from "../src/core/types.js";
import packageJson from "../package.json" with { type: "json" };

interface Capture {
  stdout: string;
  stderr: string;
  env?: Record<string, string | undefined>;
}

function createCapture(): Capture & {
  writeStdout(value: string): void;
  writeStderr(value: string): void;
} {
  const capture = {
    stdout: "",
    stderr: "",
    env: undefined,
    writeStdout(value: string): void {
      capture.stdout += value;
    },
    writeStderr(value: string): void {
      capture.stderr += value;
    }
  };

  return capture;
}

async function createFixture(): Promise<string> {
  return mkdtemp(path.join(tmpdir(), "repo-doctor-cli-"));
}

async function writeFixtureFile(
  rootPath: string,
  relativePath: string,
  content = ""
): Promise<void> {
  const targetPath = path.join(rootPath, relativePath);
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, content, "utf8");
}

async function createHealthyFixture(): Promise<string> {
  const rootPath = await createFixture();
  await writeFixtureFile(
    rootPath,
    "README.md",
    "# Example\n\n## Installation\n\nnpm install\n\n## Usage\n\nrepo-doctor .\n"
  );
  await writeFixtureFile(rootPath, "LICENSE", "MIT\n");
  await writeFixtureFile(rootPath, "package.json", '{"scripts":{"test":"vitest"}}');
  await writeFixtureFile(rootPath, "tests/example.test.ts", "test('ok', () => {})");
  await writeFixtureFile(rootPath, ".github/workflows/ci.yml", "name: CI\n");
  await writeFixtureFile(rootPath, ".github/ISSUE_TEMPLATE/bug.md", "bug\n");
  await writeFixtureFile(rootPath, ".github/PULL_REQUEST_TEMPLATE.md", "pr\n");
  await writeFixtureFile(rootPath, "SECURITY.md", "security\n");
  await writeFixtureFile(rootPath, "CHANGELOG.md", "# Changelog\n");

  return rootPath;
}

describe("runCli", () => {
  it("prints the package version", async () => {
    const capture = createCapture();

    const exitCode = await runCli(["--version"], {
      writeStdout: capture.writeStdout,
      writeStderr: capture.writeStderr
    });

    expect(exitCode).toBe(0);
    expect(capture.stdout).toBe(`${packageJson.version}\n`);
    expect(capture.stderr).toBe("");
  });

  it("prints text output by default", async () => {
    const rootPath = await createHealthyFixture();
    const capture = createCapture();

    const exitCode = await runCli([rootPath], {
      writeStdout: capture.writeStdout,
      writeStderr: capture.writeStderr
    });

    expect(exitCode).toBe(0);
    expect(capture.stdout).toContain("Repo Doctor");
    expect(capture.stdout).toContain("Score: 100/100");
    expect(capture.stderr).toBe("");
  });

  it("prints JSON output", async () => {
    const rootPath = await createHealthyFixture();
    const capture = createCapture();

    const exitCode = await runCli([rootPath, "--json"], {
      writeStdout: capture.writeStdout,
      writeStderr: capture.writeStderr
    });
    const parsed = JSON.parse(capture.stdout) as ScanResult;

    expect(exitCode).toBe(0);
    expect(parsed.score).toBe(100);
    expect(parsed.findings).toEqual([]);
  });

  it("prints Markdown output", async () => {
    const rootPath = await createHealthyFixture();
    const capture = createCapture();

    const exitCode = await runCli([rootPath, "--markdown"], {
      writeStdout: capture.writeStdout,
      writeStderr: capture.writeStderr
    });

    expect(exitCode).toBe(0);
    expect(capture.stdout).toContain("# Repo Doctor Report");
  });

  it("writes a Markdown report to GITHUB_STEP_SUMMARY", async () => {
    const rootPath = await createHealthyFixture();
    const summaryPath = path.join(rootPath, "summary.md");
    const capture = createCapture();
    capture.env = { GITHUB_STEP_SUMMARY: summaryPath };

    const exitCode = await runCli([rootPath, "--json"], {
      env: capture.env,
      writeStdout: capture.writeStdout,
      writeStderr: capture.writeStderr
    });
    const summary = await readFile(summaryPath, "utf8");

    expect(exitCode).toBe(0);
    expect(JSON.parse(capture.stdout)).toMatchObject({ score: 100 });
    expect(summary).toContain("# Repo Doctor Report");
    expect(summary).toContain("**Score:** 100/100");
  });

  it("does not write a job summary when --no-job-summary is provided", async () => {
    const rootPath = await createHealthyFixture();
    const summaryPath = path.join(rootPath, "summary.md");
    const capture = createCapture();
    capture.env = { GITHUB_STEP_SUMMARY: summaryPath };

    const exitCode = await runCli([rootPath, "--no-job-summary"], {
      env: capture.env,
      writeStdout: capture.writeStdout,
      writeStderr: capture.writeStderr
    });

    await expect(stat(summaryPath)).rejects.toMatchObject({ code: "ENOENT" });
    expect(exitCode).toBe(0);
  });

  it("fails when findings meet the fail-on threshold", async () => {
    const rootPath = await createFixture();
    const capture = createCapture();

    const exitCode = await runCli([rootPath, "--fail-on", "medium"], {
      writeStdout: capture.writeStdout,
      writeStderr: capture.writeStderr
    });

    expect(exitCode).toBe(1);
    expect(capture.stdout).toContain("Score:");
  });

  it("uses ignore and failOn from repo-doctor.config.json", async () => {
    const rootPath = await createFixture();
    await writeFixtureFile(
      rootPath,
      "repo-doctor.config.json",
      JSON.stringify({
        ignore: [
          "missing-readme",
          "missing-license",
          "missing-tests",
          "missing-ci",
          "missing-security-policy",
          "missing-package-metadata"
        ],
        failOn: "low"
      })
    );
    const capture = createCapture();

    const exitCode = await runCli([rootPath, "--json"], {
      writeStdout: capture.writeStdout,
      writeStderr: capture.writeStderr
    });
    const parsed = JSON.parse(capture.stdout) as ScanResult;

    expect(exitCode).toBe(1);
    expect(parsed.findings.map((finding) => finding.id)).toEqual([
      "missing-changelog",
      "missing-issue-template",
      "missing-pr-template"
    ]);
  });

  it("lets --fail-on override the config failOn value", async () => {
    const rootPath = await createFixture();
    await writeFixtureFile(
      rootPath,
      "repo-doctor.config.json",
      JSON.stringify({
        ignore: ["missing-readme", "missing-license"],
        failOn: "high"
      })
    );
    const capture = createCapture();

    const exitCode = await runCli([rootPath, "--fail-on", "medium"], {
      writeStdout: capture.writeStdout,
      writeStderr: capture.writeStderr
    });

    expect(exitCode).toBe(1);
    expect(capture.stdout).toContain("[MEDIUM]");
  });

  it("reports invalid repository paths", async () => {
    const capture = createCapture();
    const missingPath = path.join(tmpdir(), "repo-doctor-missing-path");

    const exitCode = await runCli([missingPath], {
      writeStdout: capture.writeStdout,
      writeStderr: capture.writeStderr
    });

    expect(exitCode).toBe(1);
    expect(capture.stderr).toContain("Path does not exist");
  });
});
