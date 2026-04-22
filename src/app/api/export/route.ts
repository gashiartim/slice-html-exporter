import JSZip from "jszip";
import { NextResponse } from "next/server";
import { cleanupTempDir } from "@/lib/cleanup";
import { processUpload } from "@/lib/parse-html";
import { getBrowser } from "@/lib/render";

export async function POST(req: Request) {
  let dirPath = "";
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const selector = (formData.get("selector") as string) || ".slide";
    const baseFilename = (formData.get("filename") as string) || "slice-export";

    // settings comes as a JSON string
    const settingsStr = formData.get("settings") as string;
    const indicesStr = formData.get("indices") as string;

    if (!file || !settingsStr || !indicesStr) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 },
      );
    }

    const settings = JSON.parse(settingsStr);
    const indices = JSON.parse(indicesStr) as number[];

    const { dirPath: tempDir, indexPath } = await processUpload(file);
    dirPath = tempDir;

    const browser = await getBrowser();
    const context = await browser.newContext({
      deviceScaleFactor: settings.scale === 2 ? 2 : 1,
    });
    const page = await context.newPage();

    await page.goto(`file://${indexPath}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    const elements = await page.locator(selector).all();

    const zip = new JSZip();
    let exported = 0;

    for (let i = 0; i < elements.length; i++) {
      if (!indices.includes(i)) continue;

      const el = elements[i];

      // Check if user set custom resolution (ignoring for now if they didn't specify w/h overrides in settings but they might in future)
      // Playwright screenshots the element as-is. The dimensions are based on css.
      // We can force viewport if needed, but element screenshot works best.

      const buffer = await el.screenshot({
        omitBackground: false,
        type: "png",
      });

      const padIndex = String(i + 1).padStart(2, "0");
      zip.file(`${baseFilename}-${padIndex}.png`, buffer);
      exported++;
    }

    await context.close();

    if (exported === 0) {
      return NextResponse.json(
        { error: "No sections matched or selected" },
        { status: 400 },
      );
    }

    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "STORE",
    });

    return new Response(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${baseFilename}.zip"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Export error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    if (dirPath) {
      await cleanupTempDir(dirPath);
    }
  }
}
