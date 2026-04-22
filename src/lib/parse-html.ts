import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import JSZip from "jszip";

export async function processUpload(
  file: File,
): Promise<{ dirPath: string; indexPath: string }> {
  const dirPath = join("/tmp", `slice-${randomUUID()}`);
  await mkdir(dirPath, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.name.endsWith(".zip") || file.type === "application/zip") {
    const zip = await JSZip.loadAsync(buffer);
    let indexPath = "";

    for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir) {
        await mkdir(join(dirPath, relativePath), { recursive: true });
        continue;
      }

      // Ensure parent directory exists
      const parts = relativePath.split("/");
      if (parts.length > 1) {
        const parent = parts.slice(0, -1).join("/");
        await mkdir(join(dirPath, parent), { recursive: true });
      }

      const content = await zipEntry.async("nodebuffer");
      await writeFile(join(dirPath, relativePath), content);

      if (
        relativePath.toLowerCase() === "index.html" ||
        relativePath.toLowerCase().endsWith("/index.html")
      ) {
        // Find the root-most index.html
        if (!indexPath || relativePath.length < indexPath.length) {
          indexPath = join(dirPath, relativePath);
        }
      }
    }

    if (!indexPath) {
      throw new Error("No index.html found in ZIP archive");
    }

    return { dirPath, indexPath };
  } else {
    // Single HTML file
    const indexPath = join(dirPath, "index.html");
    await writeFile(indexPath, buffer);
    return { dirPath, indexPath };
  }
}
