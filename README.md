# Slice

*Slice an HTML page into publish-ready images.*

Slice is a fast, server-rendered Next.js app that takes an HTML file (or ZIP with assets) and renders its sections into a downloadable ZIP of PNG images.

## Features
- Fast Refresh with Turbopack and React Compiler
- Server-side rendering using Playwright Chromium
- Extract by CSS selector with **Free AI Auto-detect** (via Gemini)
- Format and Scale output settings

## AI Auto-Detect Setup (Optional)
You can use either the free Gemini API or a local Ollama instance to automatically detect your HTML structure.

**Option A: Gemini (Fastest, requires free key)**
1. Go to [Google AI Studio](https://aistudio.google.com/) and create a free API key.
2. Copy `.env.example` to `.env` and set `GEMINI_API_KEY="your_key"`.

**Option B: Local Ollama (Private, runs on your machine)**
1. Ensure Ollama is running locally.
2. Copy `.env.example` to `.env` and set:
   - `OLLAMA_MODEL="gemma4"` (or whichever model you have pulled, e.g. `llama3`)
   - `OLLAMA_URL="http://127.0.0.1:11434"` (default)

## Local Development
1. Install dependencies: `pnpm install`
2. Run dev server: `pnpm run dev`
3. Drop the `examples/test-carousel.html` to test.

## Deployment to Coolify
1. Push this repository to GitHub.
2. In your Coolify dashboard, click **New Resource** → **Application** → **Public Repository** (or Private if you prefer).
3. Set the **Build Pack** to `Dockerfile`.
4. Set the **Port** to `3000`.
5. Set the **Health Check Path** to `/api/health`.
6. Click **Deploy**.

The custom multi-stage Dockerfile uses the official Playwright base image (`mcr.microsoft.com/playwright:v1.59.1-jammy`), so there is no need to manually install Chromium dependencies.
