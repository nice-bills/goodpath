# GoodPath production checklist (Convex + Vercel)

## Do after local works

Complete [LOCAL_DEV.md](./LOCAL_DEV.md) first:

1. `npx convex dev` linked; `NEXT_PUBLIC_CONVEX_URL` in `apps/web/.env.local`
2. Convex **dev** dashboard env vars set (quest verification)
3. `pnpm dev` — connect wallet, complete at least one quest, league/points update
4. `pnpm build`, `pnpm lint:convex`, `pnpm contracts:test` all pass

**Only then** follow the sections below. Do **not** run `npx convex deploy --prod` or `vercel deploy --prod` until local E2E is green.

---

Use this after the local checklist above and code is merged. App state (profiles, quests, league) is **Convex**. The Next.js app on Vercel only needs **`NEXT_PUBLIC_CONVEX_URL`** plus wallet env vars. **`/goodpath-api`** is legacy Hono/SQLite — leave disabled in production.

Related: [LOCAL_DEV.md](./LOCAL_DEV.md) · [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) · [Convex migration](./architecture/CONVEX_MIGRATION.md)

---

## 1. Link Convex (one-time per machine)

From repo root:

```bash
cd /path/to/goodpath
npx convex dev
```

- Sign in and **create** or **select** the GoodPath Convex project.
- CLI writes repo-root `.env.local` with `CONVEX_DEPLOYMENT=dev:…`.
- Copy the printed **`NEXT_PUBLIC_CONVEX_URL`** into `apps/web/.env.local` for local dev.

You can stop `convex dev` after linking; keep the deployment URL for step 2.

---

## 2. Deploy Convex production

```bash
cd /path/to/goodpath
npx convex deploy --prod
```

- Confirm the **production** deployment in [dashboard.convex.dev](https://dashboard.convex.dev).
- Copy the production URL: `https://<name>.convex.cloud` (Settings → deployment URL).

### Convex dashboard env (production deployment)

**Settings → Environment Variables** on the **prod** deployment:

| Variable | Required | Notes |
|----------|----------|--------|
| `GOODDOLLAR_ENV` | Yes | `production` or `staging` |
| `CELO_RPC_URL` | Recommended | e.g. `https://forno.celo.org` |
| `TIP_RECIPIENT` | Yes | `0x…` for tip quest |
| `MIN_TIP_G` | Yes | Human G$, e.g. `0.01` |
| `SUPPORT_RECIPIENT` or `SUPPORT_RECIPIENTS` | Yes | Pool / team wallet(s) |
| `MIN_SUPPORT_G` | Yes | e.g. `0.01` |
| `MIN_DEPLOY_G` | If deploy quest used | Savings minimum |
| `STREAM_RECIPIENT` | If stream quest used | Superfluid recipient |
| `MIN_STREAM_G_PER_MONTH` | If stream quest used | Min stream rate |
| `GOODPATH_RECEIPT_ADDRESS` | Optional | On-chain receipt contract |
| `GOODPATH_RELAYER_PRIVATE_KEY` | Optional | Relayer for receipt writes |

Quest verification runs in Convex **actions** — these secrets live on Convex, not only Vercel.

---

## 3. Vercel project setup

1. **Project name:** `goodpath` (or your choice).
2. **Root Directory:** `apps/web` (monorepo; `vercel.json` runs install/build from repo root).
3. **Do not** set `GOODPATH_USE_HONO_API` or `NEXT_PUBLIC_GOODPATH_USE_HONO_API` unless you intentionally run legacy SQLite API.

### Vercel environment variables (Production)

| Variable | Required | Example / notes |
|----------|----------|-----------------|
| **`NEXT_PUBLIC_CONVEX_URL`** | **Yes** | `https://<prod>.convex.cloud` from step 2 |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Yes | [Reown Cloud](https://cloud.reown.com) |
| `NEXT_PUBLIC_PRIVY_APP_ID` | Yes | [Privy dashboard](https://dashboard.privy.io) |
| `NEXT_PUBLIC_GOODDOLLAR_ENV` | Yes | `production` or `staging` |
| `NEXT_PUBLIC_TIP_RECIPIENT` | Yes | `0x…` |
| `NEXT_PUBLIC_SUPPORT_RECIPIENT` | Recommended | Pool wallet (can match tip) |
| `NEXT_PUBLIC_MIN_TIP_G` | Optional | Default `0.01` |
| `NEXT_PUBLIC_GOODPATH_RECEIPT_ADDRESS` | Optional | Celo receipt proxy |
| `CORS_ORIGINS` | If API used | Your app URL; omit if Hono disabled |

**Omit** `NEXT_PUBLIC_API_URL` and Hono flags for standard Convex production.

Copy the same `NEXT_PUBLIC_CONVEX_URL` to **Preview** if preview deployments should hit prod Convex (or use a separate Convex preview deployment).

---

## 4. Domain: `goodpath-app` → `goodpath` project

`goodpath-app.vercel.app` may still point at an older **`web`** project.

1. Vercel → **`goodpath`** project → **Settings → Domains**.
2. Add `goodpath-app.vercel.app` (and custom domain if any).
3. Remove that hostname from the legacy **`web`** project if it is still attached.

CLI (logged in, linked to `goodpath`, cwd `apps/web`):

```bash
cd /path/to/goodpath/apps/web
npx vercel@latest domains add goodpath-app.vercel.app
```

---

## 5. Privy allowed origins

[Privy dashboard](https://dashboard.privy.io) → your app → **Allowed origins**:

- `https://goodpath-app.vercel.app`
- Any custom production domain
- `http://localhost:3000` (local dev)

Save before testing login on production.

---

## 6. Redeploy Vercel

After env vars change, trigger a **production** deploy:

```bash
cd /path/to/goodpath
npx vercel@latest deploy --yes --prod
```

Or push to the connected Git branch with Production env vars set.

---

## 7. Optional: seed division benchmarks

With **production** Convex selected (`npx convex deploy --prod` already done):

```bash
cd /path/to/goodpath
npx convex run seed:divisionRunners --prod
```

Seeds league board benchmark rows (internal mutation). Safe to re-run for demos; idempotent per season logic in `convex/seed.ts`.

---

## 8. Smoke test

```bash
cd /path/to/goodpath
SMOKE_URL=https://goodpath-app.vercel.app pnpm --filter @goodpath/web smoke
```

- Expect **200** on `/` and health checks.
- Connect wallet → profile/quests load via Convex (not `/goodpath-api`).
- If Convex URL is wrong, browser console shows failed Convex websocket/fetch.

---

## Troubleshooting

| Symptom | Check |
|---------|--------|
| Profile never loads | `NEXT_PUBLIC_CONVEX_URL` on Vercel matches prod deployment; redeploy after change |
| Quest verify fails | Convex **prod** env: RPC, recipients, `GOODDOLLAR_ENV` |
| Privy login blocked | Allowed origins include exact production URL (https, no trailing slash) |
| `/goodpath-api` 410 | Expected — use Convex; do not enable Hono on Vercel |
| Local `codegen` fails | Run `npx convex dev` once; set `CONVEX_DEPLOYMENT` in repo-root `.env.local` |

---

## USER_ACTION_CHECKLIST

Copy this block for the user. Run from repo root unless noted.

1. **Link Convex (once)**  
   `npx convex dev`  
   Copy `NEXT_PUBLIC_CONVEX_URL` → `apps/web/.env.local`

2. **Deploy Convex production**  
   `npx convex deploy --prod`  
   Copy prod URL → Vercel env `NEXT_PUBLIC_CONVEX_URL` (Production)

3. **Convex prod secrets**  
   Dashboard → prod deployment → Settings → Environment Variables  
   Set: `GOODDOLLAR_ENV`, `CELO_RPC_URL`, `TIP_RECIPIENT`, `MIN_TIP_G`, `SUPPORT_RECIPIENT`(s), `MIN_SUPPORT_G`, (+ stream/deploy vars if used)

4. **Vercel env (project `goodpath`, root `apps/web`)**  
   Required: `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`, `NEXT_PUBLIC_PRIVY_APP_ID`, `NEXT_PUBLIC_GOODDOLLAR_ENV`, `NEXT_PUBLIC_TIP_RECIPIENT`  
   Do **not** set `GOODPATH_USE_HONO_API` / `NEXT_PUBLIC_GOODPATH_USE_HONO_API`

5. **Domain**  
   Vercel → `goodpath` → Domains → attach `goodpath-app.vercel.app`; remove from old `web` project  
   Or: `cd apps/web && npx vercel@latest domains add goodpath-app.vercel.app`

6. **Privy**  
   Dashboard → Allowed origins → add `https://goodpath-app.vercel.app` (+ custom domain, `http://localhost:3000`)

7. **Redeploy**  
   `npx vercel@latest deploy --yes --prod`

8. **Optional seed**  
   `npx convex run seed:divisionRunners --prod`

9. **Smoke**  
   `SMOKE_URL=https://goodpath-app.vercel.app pnpm --filter @goodpath/web smoke`
