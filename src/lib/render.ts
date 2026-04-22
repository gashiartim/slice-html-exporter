import { type Browser, chromium } from "playwright";

let browserInstance: Browser | null = null;

export async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await chromium.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browserInstance;
}
