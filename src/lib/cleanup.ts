import { rm } from "node:fs/promises";

export async function cleanupTempDir(path: string) {
  try {
    if (path.startsWith("/tmp/slice-")) {
      await rm(path, { recursive: true, force: true });
    }
  } catch (error) {
    console.error(`Failed to clean up temp dir ${path}`, error);
  }
}
