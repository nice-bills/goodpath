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
| `NEXT_PUBLIC_TIP_RECIPIENT` | `0x…` |
| `NEXT_PUBLIC_SUPPORT_RECIPIENT` | pool or team wallet |
| `GOODDOLLAR_ENV` | match web |
| `TIP_RECIPIENT` | same as web |
| `SUPPORT_RECIPIENT` | optional |
| `CORS_ORIGINS` | `https://your-app.vercel.app` |

`NEXT_PUBLIC_API_URL` is **optional** — on Vercel it defaults to `https://<deployment>/goodpath-api`.

## After deploy

1. Add deploy URL to **Privy** allowed origins.
2. Smoke: `SMOKE_URL=https://your-app.vercel.app pnpm --filter @goodpath/web smoke`
3. Note: preview DB resets when serverless cold-starts; use dedicated API host + `GOODPATH_DATA_DIR` for persistent data.
