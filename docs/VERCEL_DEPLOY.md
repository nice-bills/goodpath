# Deploy on Vercel (web + API in one project)

The Next app serves the Hono API at **`/goodpath-api`** (SQLite in `/tmp` on Vercel — fine for preview; use persistent volume elsewhere for production).

## CLI

Link once from repo root (`npx vercel@latest link`). The Vercel project must use **Root Directory** `apps/web` (Dashboard → Settings, or API `rootDirectory` + `sourceFilesOutsideRootDirectory: true`).

```bash
cd /path/to/goodpath
npx vercel@latest deploy --yes          # preview
npx vercel@latest deploy --yes --prod   # production
```

`apps/web/vercel.json` runs `pnpm install` and builds from the monorepo root.

## Required env (Vercel project → Settings → Environment Variables)

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | from Reown |
| `NEXT_PUBLIC_PRIVY_APP_ID` | from Privy |
| `NEXT_PUBLIC_GOODDOLLAR_ENV` | `production` or `staging` |
| `NEXT_PUBLIC_TIP_RECIPIENT` | `0x069C76420DD98cAfa97cc1D349BC1cC708284032` |
| `NEXT_PUBLIC_SUPPORT_RECIPIENT` | same (or a GoodCollective pool) |
| `GOODDOLLAR_ENV` | match web |
| `TIP_RECIPIENT` | same as web |
| `SUPPORT_RECIPIENT` | same as tip if unset |
| `CORS_ORIGINS` | `https://goodpath-app.vercel.app` |

`NEXT_PUBLIC_API_URL` is **optional** — on Vercel it defaults to `https://<deployment>/goodpath-api`.

## Project URL

- Vercel project name: **`goodpath`** (renamed from `web`).
- **`goodpath.vercel.app`** is taken globally on Vercel; use one of:
  - **https://goodpath-app.vercel.app** (short alias)
  - **https://goodpath-nice-bills-projects.vercel.app** (team default)
- Production may also answer on `https://web-blush-beta-87.vercel.app` until you promote a new prod deploy.

## After deploy

1. Add your chosen URL to **Privy** allowed origins and `CORS_ORIGINS`.
2. Smoke: `SMOKE_URL=https://goodpath-app.vercel.app pnpm --filter @goodpath/web smoke`
3. Note: preview DB resets when serverless cold-starts; use dedicated API host + `GOODPATH_DATA_DIR` for persistent data.
