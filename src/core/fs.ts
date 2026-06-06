import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function anyPathExists(
  rootPath: string,
  relativePaths: string[]
): Promise<boolean> {
  for (const relativePath of relativePaths) {
    if (await pathExists(path.join(rootPath, relativePath))) {
      return true;
    }
  }

  return false;
}

export async function readFirstExistingText(
  rootPath: string,
  relativePaths: string[]
): Promise<string | undefined> {
  for (const relativePath of relativePaths) {
    const targetPath = path.join(rootPath, relativePath);

    if (await pathExists(targetPath)) {
      return readFile(targetPath, "utf8");
    }
  }

  return undefined;
}

export async function directoryContainsFile(
  rootPath: string,
  relativeDir: string,
  predicate: (fileName: string) => boolean
): Promise<boolean> {
  const dirPath = path.join(rootPath, relativeDir);

  if (!(await pathExists(dirPath))) {
    return false;
  }

  const entries = await readdir(dirPath, { withFileTypes: true });

  return entries.some((entry) => entry.isFile() && predicate(entry.name));
}

