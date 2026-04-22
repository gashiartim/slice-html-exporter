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

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const { dirPath: tempDir, indexPath } = await processUpload(file);
    dirPath = tempDir;

    const browser = await getBrowser();
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(`file://${indexPath}`, { waitUntil: "networkidle" });
    // Additional wait for fonts and dynamic icons
    await page.waitForTimeout(1500);

    const elements = await page.locator(selector).all();
    const sections = [];

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const box = await el.boundingBox();
      if (!box) continue;

      const buffer = await el.screenshot({
        type: "jpeg",
        quality: 60,
        scale: "css",
      });
      const thumbnail = `data:image/jpeg;base64,${buffer.toString("base64")}`;

      sections.push({
        index: i,
        width: Math.round(box.width),
        height: Math.round(box.height),
        thumbnail,
      });
    }

    await context.close();

    return NextResponse.json({ sections });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Parse error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    if (dirPath) {
      await cleanupTempDir(dirPath);
    }
  }
}
