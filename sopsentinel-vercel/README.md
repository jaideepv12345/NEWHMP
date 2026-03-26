# SOPSentinel HMP Stress-Test Engine — Vercel Deployment

## Quick Deploy

1. Push this folder to a GitHub repository (or use Vercel CLI)
2. Connect the repo in [Vercel Dashboard](https://vercel.com/dashboard)
3. Vercel auto-detects the build settings from `vercel.json`
4. Deploy

## Architecture

- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui (builds to `dist/public/`)
- **Backend**: Express.js serverless function at `/api/` (Vercel Functions)
- **Storage**: In-memory (no database required — no native addons)
- **PDF Parsing**: `pdf-parse` (pure JavaScript)

## Notes

- All data is stored in-memory per serverless invocation. Data does not persist between cold starts — this is by design for a stateless analysis tool.
- No `better-sqlite3` or native C++ addons — fully compatible with Vercel's build environment.
- Maximum PDF size: 100MB / 500 pages.
