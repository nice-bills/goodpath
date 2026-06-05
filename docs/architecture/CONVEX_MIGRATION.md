# Convex migration (GoodPath app state)

> **Local first:** Finish [LOCAL_DEV.md](../LOCAL_DEV.md) (Convex dev deployment, dashboard env, `pnpm dev`, wallet E2E) before [VERCEL_PRODUCTION_CHECKLIST.md](../VERCEL_PRODUCTION_CHECKLIST.md) or `npx convex deploy --prod`. Do not point production Vercel at Convex until local verification passes.

GoodPath app state (profiles, quests, league, referrals, rivals, squads, proof/receipt metadata) lives in **Convex**. The Next.js app reads/writes via `useQuery` / `useMutation` instead of `fetch` to `/goodpath-api`.

On-chain quest execution stays in the browser (Privy / wagmi / GoodSDKs). Quest **verification** (viem + GoodDollar env) runs in Convex **Node actions** under `convex/verify/`.

## Convex Cursor plugin workflow

The [Convex Cursor plugin](https://www.convex.dev) adds rules, skills, and (when enabled) an MCP server for deployment inspection.

| Step | Command / action |
|------|------------------|
| Link project (first time) | `npx convex dev` — log in, create or select a team/project |
| Local watch + codegen | `npx convex dev` (also started by `pnpm dev`) |
| Regenerate types only | `npx convex codegen` (requires `CONVEX_DEPLOYMENT` in repo-root `.env.local`) |
| Lint Convex functions | `pnpm lint:convex` (`@convex-dev/eslint-plugin`) |
| Seed division benchmarks | `npx convex run seed:divisionRunners` (internal mutation; CLI path unchanged) |
| Production backend | `npx convex deploy` (production deployment; promote in dashboard if needed) |
| Dashboard env | [dashboard.convex.dev](https://dashboard.convex.dev) → project → **Settings → Environment Variables** |

**Enable Convex MCP (optional):** Cursor → Settings → MCP → enable the **convex** server from the plugin, then authenticate. Use it to inspect deployment health, schema, and function list without leaving the IDE.

**Plugin skills to use when editing backend:** `schema-builder`, `function-creator`, `migration-helper`, `auth-setup`, and run a pass with `convex-reviewer` after larger changes.

## Link a Convex project (checklist)

1. From repo root: `npx convex dev`
2. Sign in with GitHub/email when prompted.
3. Choose **Create a new project** or **Link existing**.
4. CLI writes **repo root** `.env.local`:
   - `CONVEX_DEPLOYMENT=dev:…`
   - Prints `NEXT_PUBLIC_CONVEX_URL=https://….convex.cloud`
5. Copy `NEXT_PUBLIC_CONVEX_URL` into `apps/web/.env.local` (see below).
6. In the Convex dashboard, set server env vars for the **dev** deployment (table below).
7. Run `pnpm dev` — Next.js + Convex watch should both stay up.

If `npx convex codegen` fails with *No CONVEX_DEPLOYMENT set*, you have not linked yet; committed `convex/_generated/` stubs still allow `pnpm build` in `apps/web`.

## Local development

### 1. Web env

`apps/web/.env.local`:

```bash
NEXT_PUBLIC_CONVEX_URL=https://<your-deployment>.convex.cloud
```

Keep existing wallet / GoodDollar `NEXT_PUBLIC_*` vars (see `apps/web/.env.example`).

### 2. Convex dashboard env (Settings → Environment Variables)

Set for **dev** and **prod** deployments:

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

### 3. Run

```bash
pnpm dev
```

Starts **Next.js** (`:3000`) and **`npx convex dev`** (watch + codegen).

Legacy Hono API only if needed:

```bash
GOODPATH_USE_HONO_API=1 pnpm dev
```

### 4. Seed division benchmarks (optional)

With Convex dev running:

```bash
npx convex run seed:divisionRunners
```

(`seed.divisionRunners` is an **internal** mutation — not callable from the browser.)

## Production: Convex + Vercel (after local E2E)

**Do not run these until** [LOCAL_DEV.md](../LOCAL_DEV.md) verification succeeds (`pnpm build`, connect wallet, complete a quest, league updates).

1. **Convex prod deployment**
   - `npx convex deploy --prod` from repo root, or deploy/promote in the dashboard.
   - Note the **production** deployment URL (`https://….convex.cloud`).

2. **Vercel (web app)**
   - Project → **Settings → Environment Variables**
   - `NEXT_PUBLIC_CONVEX_URL` = production Convex URL (Production + Preview as needed).
   - Keep existing `NEXT_PUBLIC_*` wallet / GoodDollar vars.

3. **Convex dashboard (prod deployment)**
   - Same server env table as dev (RPC, recipients, relayer keys).
   - Secrets live on **Convex**, not only Vercel — actions read `process.env` on Convex.

4. **Do not** set `GOODPATH_USE_HONO_API=1` on Vercel unless you intentionally keep the Hono fallback.

## Demo league with one user

1. Connect wallet on `http://localhost:3000` (tab shell `/?tab=` unchanged).
2. Complete quests — weekly points and division leaderboard use **seeded benchmark runners** from `@goodpath/shared` plus your row labeled **You**.
3. Rival card shows a **seeded** benchmark rival until you set a real rival.
4. Use `NEXT_PUBLIC_DEMO_MODE=true` for screenshot mode (local demo profile, no Convex required).

## What moved from `services/api`

| Hono route | Convex |
|------------|--------|
| `GET /api/profile/:address` | `profiles.get` query |
| `POST .../quests/:id/complete` | `quests.complete` mutation + `verify.validate` action |
| `POST .../referral` | `profiles.setReferrer` |
| `POST .../share-invite` | `profiles.createShareInvite` |
| `GET .../rival`, `POST .../rival` | `social.getRival`, `social.setRival` |
| `GET/POST squads` | `social.listSquads`, `social.joinSquad` |
| `GET /api/stats` | `stats.impact` |

`services/api` remains for reference and optional `GOODPATH_USE_HONO_API=1`.

## Schema indexes (wallet-keyed data)

| Table | Index | Use |
|-------|--------|-----|
| `profiles` | `by_address` | Profile row by wallet |
| `profiles` | `by_referredBy` | Referral counts per referrer |
| `questCompletions` | `by_address`, `by_address_quest`, `by_quest` | Per-user quests; global stats by quest |
| `rivalLinks` | `by_user` | Rival for wallet |
| `divisionEntries` | `by_season`, `by_season_address` | League board |

## Auth model (current)

Public mutations accept an `address` argument from the client. **There is no cryptographic proof of wallet ownership yet.** Next step: Convex Auth + Privy (see plugin `auth-setup` skill) and custom mutations that read `ctx.auth.getUserIdentity()`.

## Regenerate types

After changing `convex/` functions:

```bash
npx convex dev          # preferred while developing
# or
npx convex codegen      # needs CONVEX_DEPLOYMENT in .env.local
```

Committed stubs under `convex/_generated/` allow `pnpm --filter @goodpath/web build` without a linked deployment.

Production deploy checklist: [VERCEL_PRODUCTION_CHECKLIST.md](../VERCEL_PRODUCTION_CHECKLIST.md).

## Build verification

```bash
pnpm --filter @goodpath/web build
pnpm lint:convex        # after pnpm install at repo root
```
