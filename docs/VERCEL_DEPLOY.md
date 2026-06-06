# Deploy on Vercel (web + Convex)

GoodPath app state (profiles, quests, league, referrals) lives in **Convex** as the **primary backend**. The Next.js app talks to Convex via **`NEXT_PUBLIC_CONVEX_URL`**, and that variable is **required** on Vercel for production. On-chain quest execution stays in the browser (Privy / wagmi / GoodSDKs).

The Hono API at **`/goodpath-api`** is **legacy only** — SQLite (`better-sqlite3`), only when `GOODPATH_USE_HONO_API=1` or `NEXT_PUBLIC_GOODPATH_USE_HONO_API=1`. Without those flags the route returns **410** and does not load SQLite (safe for Vercel production).

See also: [Convex migration](./architecture/CONVEX_MIGRATION.md), [Production checklist](./VERCEL_PRODUCTION_CHECKLIST.md).

## Vercel projects and domains

This monorepo deploys from **`apps/web`** (see `apps/web/vercel.json`). Use a Vercel project named **`goodpath`** (or your choice) with **Root Directory** `apps/web`.

**`goodpath-app.vercel.app`** may still be aliased to an older **`web`** project from an earlier setup. In the Vercel dashboard:

1. Open the **`goodpath`** project → **Settings → Domains**.
2. Add `goodpath-app.vercel.app` (or your preferred hostname).
3. Remove that domain from the legacy **`web`** project if it is still attached there.

CLI (when logged in and linked to the `goodpath` project):

```bash
cd /path/to/goodpath/apps/web
npx vercel@latest domains add goodpath-app.vercel.app
```

## Continuous deployment (GitHub Actions)

Every push to **`main`** runs [`.github/workflows/deploy-production.yml`](../.github/workflows/deploy-production.yml):

1. **`npx convex deploy`** → production Convex (`original-cod-804.convex.cloud`)
2. **`npx vercel deploy --prod`** → Vercel `goodpath` project
3. Re-aliases **`goodpath-app.vercel.app`** to the new deployment

### One-time: GitHub secrets

In **GitHub → nice-bills/goodpath → Settings → Secrets and variables → Actions**, add:

| Secret | Where to get it |
|--------|-----------------|
| `CONVEX_DEPLOY_KEY` | [Production deployment settings](https://dashboard.convex.dev/t/will-is-bill/goodpath-de170/original-cod-804) → **Settings** → **Generate Production Deploy Key** (must be from **original-cod-804**, not the dev deployment; not Preview; paste the full key with no spaces/newlines). Add as a **repository** secret (not environment-only unless the workflow uses that environment). |
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) → Create token (scope: deploy) |
| `VERCEL_ORG_ID` | Vercel → Team settings → **team_SZu6NDEvr72dzqVTJL8ILliE** (or copy from `.vercel/project.json` after `vercel link`) |
| `VERCEL_PROJECT_ID` | Vercel → **goodpath** project → Settings → **prj_gXx0Oxxtvwsqa5mbrN4JdNLnShPC** |

After secrets are set, merge to `main` — no manual `vercel deploy` or `convex deploy` needed.

Workflow runs: **Actions** tab on GitHub. Failed deploys do not roll back the previous live site.

## CLI deploy (manual)

Link once from repo root (`npx vercel@latest link`). The Vercel project must use **Root Directory** `apps/web` (Dashboard → Settings, or API `rootDirectory` + `sourceFilesOutsideRootDirectory: true`).

```bash
cd /path/to/goodpath
npx vercel@latest deploy --yes          # preview
npx vercel@latest deploy --yes --prod   # production
```

`apps/web/vercel.json` runs `pnpm install` and builds from the monorepo root.

## Required env (Vercel project → Settings → Environment Variables)

### Vercel (Production) — minimum

| Variable | Example / notes |
|----------|-----------------|
| **`NEXT_PUBLIC_CONVEX_URL`** | **`https://<your-prod-deployment>.convex.cloud`** — from [Convex dashboard](https://dashboard.convex.dev) → project → **Settings** → deployment URL. **Required.** This is the primary backend URL for production. Redeploy after setting. |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | from Reown |
| `NEXT_PUBLIC_PRIVY_APP_ID` | from Privy |
| `NEXT_PUBLIC_GOODDOLLAR_ENV` | `production` or `staging` |
| `NEXT_PUBLIC_TIP_RECIPIENT` | `0x…` |
| `NEXT_PUBLIC_SUPPORT_RECIPIENT` | pool or team wallet |
| `GOODDOLLAR_ENV` | match web (if any server code reads it) |
| `TIP_RECIPIENT` | same as web tip recipient |
| `SUPPORT_RECIPIENT` | optional |
| `CORS_ORIGINS` | `https://goodpath-app.vercel.app` (your production URL) |

**Do not** rely on `/goodpath-api` in production. Omit `NEXT_PUBLIC_API_URL` unless you explicitly enable legacy Hono (`GOODPATH_USE_HONO_API=1`).

Optional legacy Hono on Vercel (not recommended for prod):

| Variable | Notes |
|----------|--------|
| `GOODPATH_USE_HONO_API` | `1` — enables `/goodpath-api` (SQLite in `/tmp`) |
| `NEXT_PUBLIC_GOODPATH_USE_HONO_API` | `1` — web client uses Hono `fetch` instead of Convex hooks |

### Convex dashboard (production deployment)

Configure on the **production** Convex deployment (`npx convex deploy --prod`). Quest verification **actions** read these (not Vercel):

| Variable | Purpose |
|----------|---------|
| `GOODDOLLAR_ENV` | `development` \| `staging` \| `production` |
| `CELO_RPC_URL` | Celo RPC (default `https://forno.celo.org`) |
| `TIP_RECIPIENT` | Tip quest recipient |
| `MIN_TIP_G` | Min tip size (human G$) |
| `SUPPORT_RECIPIENT` / `SUPPORT_RECIPIENTS` | Support pool address(es) |
| `MIN_SUPPORT_G` | Min support transfer |
| `MIN_DEPLOY_G` | Savings stake minimum |
| `STREAM_RECIPIENT` | Superfluid stream recipient |
| `MIN_STREAM_G_PER_MONTH` | Min stream rate |
| `GOODPATH_RECEIPT_ADDRESS` | Optional receipt contract |
| `GOODPATH_RELAYER_PRIVATE_KEY` | Optional relayer for on-chain receipt writes |

## After deploy checklist

1. **Convex** — `npx convex deploy --prod` from repo root; copy production URL into Vercel `NEXT_PUBLIC_CONVEX_URL`; set Convex dashboard env vars above.
2. **Privy** — add production URL to allowed origins (e.g. `https://goodpath-app.vercel.app`).
3. **Domain** — attach hostname to the **`goodpath`** project (see above).
4. **Smoke** — `SMOKE_URL=https://your-app.vercel.app pnpm --filter @goodpath/web smoke` (health + `/`; profile data comes from Convex, not `/goodpath-api`).

## Local legacy API

```bash
GOODPATH_USE_HONO_API=1 pnpm dev
```

Uses Hono on port 3001 and React Query `fetch` to `http://localhost:3001`.
