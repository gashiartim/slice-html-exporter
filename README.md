# Slice 🍰

**Turn Claude Artifacts and HTML designs into production-ready social media images.**

## Why Slice?

If you use [Claude Design](https://claude.ai) or other AI tools to generate beautiful HTML/CSS marketing materials, presentations, or Instagram carousels, you might have noticed a missing feature: **you can't easily export those HTML elements as high-quality images.**

**Slice** bridges that gap. 

Simply drop your generated `.html` file (or a `.zip` containing your assets) into Slice. Our built-in AI will automatically detect your repeating slide elements. Slice then uses a headless Chromium browser to render your code with pixel-perfect accuracy and lets you batch-export the sections as a neat `.zip` of high-resolution PNGs.

---

## ✨ Features

- **🪄 AI Auto-Detect**: Automatically finds the right CSS selector for your slides and generates descriptive filenames using Google Gemini or a local Ollama instance.
- **🎨 Pixel-Perfect Rendering**: Server-side Playwright ensures your custom CSS, fonts, and layouts look exactly as they do in the browser.
- **📦 Batch Zip Exports**: Select the slides you want and download them all at once in high-resolution (up to 2x Retina scale).
- **⚡️ Modern Stack**: Built on Next.js 16 (App Router) with Turbopack and React Compiler for blazing fast performance.
- **🐳 Docker Ready**: Ships with a highly optimized, multi-stage Dockerfile using the official Playwright base image.

---

## 🚀 Getting Started

### 1. Run via Docker (Recommended)
This is the easiest way to ensure Playwright has all necessary system dependencies:

\`\`\`bash
# Build the image
docker build -t slice-app .

# Run the container
docker run -p 3000:3000 --env-file .env slice-app
\`\`\`
Then open [http://localhost:3000](http://localhost:3000)

### 2. Run Natively (Development)
Ensure you are using Node.js v24 (run \`nvm use\`).

\`\`\`bash
# Install dependencies (including Playwright browsers)
pnpm install
pnpm exec playwright install chromium

# Start development server
pnpm dev
\`\`\`

---

## 🤖 AI Auto-Detect Setup (Optional)

Slice features a smart "Wand" button that automatically parses your HTML to find the correct CSS selector and names your files. You can power this feature for free using either Gemini or a local Ollama model.

1. Copy `.env.example` to `.env`
2. **Option A (Gemini):** Get a free API key from [Google AI Studio](https://aistudio.google.com/) and set \`GEMINI_API_KEY="your_key"\`.
3. **Option B (Local Ollama):** Keep \`GEMINI_API_KEY\` empty and set \`OLLAMA_MODEL="gemma4"\` (or your preferred local model).

---

## 🛠 Tech Stack
- **Framework**: Next.js 16.2
- **Styling**: Tailwind CSS v4 + Shadcn UI
- **Rendering Engine**: Playwright (Chromium)
- **Zip Generation**: JSZip
- **AI Integration**: @google/genai

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
