# SOPSentinel HMP Stress-Test Engine — Vercel Deployment

## Quick Deploy

1. Extract this zip
2. Push ALL the files to the ROOT of your GitHub repo (package.json, vercel.json, etc. must be at the top level — NOT inside a subfolder)
3. Connect the repo in [Vercel Dashboard](https://vercel.com/dashboard)
4. Vercel auto-detects the build settings from `vercel.json`
5. Deploy

**IMPORTANT**: Do NOT upload the files inside a subfolder like `sopsentinel-vercel/`. The `package.json` and `vercel.json` must be at the repository root for Vercel to find them.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui (builds to `dist/public/`)
- **Backend**: Express.js serverless function at `/api/` (Vercel Functions)
- **Storage**: In-memory (no database required — no native addons)
- **PDF Parsing**: `pdf-parse` (pure JavaScript)

## Notes

- All data is stored in-memory per serverless invocation. Data does not persist between cold starts — this is by design for a stateless analysis tool.
- No `better-sqlite3` or native C++ addons — fully compatible with Vercel's build environment.
- Maximum PDF size: 100MB / 1000 pages.
