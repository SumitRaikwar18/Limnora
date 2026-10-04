# Deployment and Operations Guide

This guide covers setting up, running, and deploying Limnora on local environments and Vercel.

---

## Prerequisites

- **Node.js**: `22.x` or newer
- **Package Manager**: `npm` (strictly npm-only with committed `package-lock.json`)
- **Database / Storage**: Supabase project
- **Vision Model API**: OpenRouter API key with a vision-capable model (e.g., `qwen/qwen3.8-27b:free`)

---

## Local Development Setup

1. **Clone the repository & install dependencies**:
   ```sh
   git clone https://github.com/SumitRaikwar18/Limnora.git
   cd Limnora
   npm ci
   ```

2. **Configure environment variables**:
   ```sh
   cp .env.example .env.local
   ```
   Fill in `.env.local`:
   ```ini
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   SUPABASE_SECRET_KEY=YOUR_SERVER_ONLY_SUPABASE_SECRET_KEY
   OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY
   OPENROUTER_MODEL=qwen/qwen3.8-27b:free
   ```

3. **Apply Database Migrations**:
   In your Supabase project SQL Editor, apply the following migrations in order:
   - `supabase/schema.sql`
   - `supabase/server-access-hardening.sql`
   - `supabase/freshwater-readiness.sql`

4. **Run the development server**:
   ```sh
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## Environment Variables Reference

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public / Client & Server | Your Supabase project HTTPS URL. |
| `SUPABASE_SECRET_KEY` | Server-only | Supabase service-role / secret key. Never prefix with `NEXT_PUBLIC_`. |
| `OPENROUTER_API_KEY` | Server-only | OpenRouter API key for vision-based AI screening. |
| `OPENROUTER_MODEL` | Server-only | Image-capable model ID (e.g., `qwen/qwen3.8-27b:free`). |
| `NEXT_PUBLIC_SITE_URL` | Public / Build | Verified public HTTPS origin (no trailing slash). Enables canonical URLs, Open Graph / Twitter cards, sitemap, and indexing. |
| `NEXT_PUBLIC_SHOWCASE_OBSERVATION_ID` | Optional | ID of a permissioned original observation to showcase in the evidence loop. |
| `NEXT_PUBLIC_OSM_TILE_URL` | Optional | Custom map tile server URL (defaults to OpenFreeMap / OSM). |

> [!NOTE]
> `NEXT_PUBLIC_SUPABASE_ANON_KEY` is not required by current backend code, as all sensitive queries run securely via server routes using `SUPABASE_SECRET_KEY`.

---

## Vercel Deployment

1. **Import the repository** into Vercel.
2. **Framework Preset**: Next.js.
3. **Build & Install Commands**:
   - Install Command: `npm ci`
   - Build Command: `npm run build`
4. **Environment Variables**:
   - Add `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`.
   - Set `NEXT_PUBLIC_SITE_URL` to your production domain (e.g., `https://limnora.vercel.app`).
5. **Vercel Web Analytics**:
   - Enable Web Analytics in the Vercel project dashboard.
   - Analytics are active only on production builds and only track allowlisted public pages with query strings/IDs stripped to protect privacy.

---

## Verification & Health Checks

Run test suites before deployment:
```sh
npm run typecheck
npm test
npm run build
```

Health endpoint:
- Check `https://YOUR_DOMAIN/api/health` to verify server configuration health.
