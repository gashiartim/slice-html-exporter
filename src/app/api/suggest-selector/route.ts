import { readFile } from "node:fs/promises";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { cleanupTempDir } from "@/lib/cleanup";
import { processUpload } from "@/lib/parse-html";

export async function POST(req: Request) {
  let dirPath = "";
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const useOllama = !!process.env.OLLAMA_MODEL;
    const hasGemini = !!process.env.GEMINI_API_KEY;

    if (!useOllama && !hasGemini) {
      return NextResponse.json(
        { error: "No AI provider configured. Please set OLLAMA_MODEL or GEMINI_API_KEY in .env" },
        { status: 500 }
      );
    }

    const { dirPath: tempDir, indexPath } = await processUpload(file);
    dirPath = tempDir;

    // Read the HTML content
    const htmlContent = await readFile(indexPath, "utf-8");

    // Ask Gemini/Ollama for the selector
    const prompt = `You are an expert web developer.
I want to extract the main repeating "slide" or "section" elements from the following HTML file to convert them to images.
1. Determine the best CSS selector that targets these repeating sections (e.g. '.slide', '.carousel-item', 'section', etc.).
2. Determine a short, descriptive base filename for these exported images based on the content (e.g. 'product-carousel', 'pitch-deck', 'instagram-post'). Use lowercase, hyphenated, no extension.

Return ONLY a valid JSON object with the following structure. Do not use markdown blocks, do not add any explanation:
{
  "selector": ".slide",
  "filename": "descriptive-name"
}

HTML Snippet (truncated):
${htmlContent.slice(0, 30000)}
`;

    let selector = ".slide";
    let filename = "slice-export";
    let rawText = "";

    if (useOllama) {
      const ollamaUrl = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
      const model = process.env.OLLAMA_MODEL as string;
      
      const res = await fetch(`${ollamaUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
        }),
      });
      
      if (!res.ok) {
        throw new Error(`Ollama failed: ${res.statusText}`);
      }
      
      const data = await res.json();
      rawText = data.response?.trim() || "";
    } else {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      rawText = response.text?.trim() || "";
    }

    // Clean up if it returned markdown
    if (rawText.startsWith("\`\`\`")) {
      rawText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    }
    
    try {
      const parsed = JSON.parse(rawText);
      if (parsed.selector) selector = parsed.selector;
      if (parsed.filename) filename = parsed.filename;
    } catch (e) {
      console.warn("AI didn't return valid JSON:", rawText);
      // Fallback
      if (!rawText.includes("{")) {
        selector = rawText.trim();
        if (selector.startsWith("\`") && selector.endsWith("\`")) {
          selector = selector.slice(1, -1);
        }
      }
    }

    return NextResponse.json({ selector, filename });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("AI selector error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    if (dirPath) {
      await cleanupTempDir(dirPath);
    }
  }
}
