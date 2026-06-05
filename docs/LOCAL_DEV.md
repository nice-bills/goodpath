# GoodPath — local development

**Single source of truth** for running GoodPath on your machine. Complete this guide end-to-end before any Vercel or Convex **production** deploy. Production steps live in [VERCEL_PRODUCTION_CHECKLIST.md](./VERCEL_PRODUCTION_CHECKLIST.md).

App state (profiles, quests, league, referrals) uses **Convex** by default. The legacy Hono API (`services/api`) runs only when `GOODPATH_USE_HONO_API=1`.

---

## Prerequisites

| Tool | Version |
|------|---------|
| [Node.js](https://nodejs.org/) | 20+ recommended |
| [pnpm](https://pnpm.io/) | 9.x (`packageManager` in root `package.json`) |
| [Foundry](https://book.getfoundry.sh/) | Optional — only for `pnpm contracts:test` |

From repo root:

```bash
pnpm install
```

---

## 1. Convex backend

### Option A — Local Convex (fastest, no account)

Runs an anonymous backend on your machine:

```bash
pnpm dev   # starts web + `npx convex dev` (TMPDIR → `.convex-tmp/` to avoid EXDEV)
```

Set in `apps/web/.env.local`:

```bash
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210
```

Quest verification on anonymous local uses **sensible defaults** in `convex/verify/*` (`GOODDOLLAR_ENV=development`, `MIN_TIP_G=0.01`, etc.). For custom recipients or support/deploy quests, either run `npx convex login` and use `npx convex env set --deployment local …`, or use a cloud dev deployment (§1B).

Seed division benchmarks once:

```bash
npx convex run seed:divisionRunners
```

### Option B — Cloud dev deployment (team / persistent data)

```bash
npx convex login
npx convex dev
```

1. Create or link a project.
2. CLI writes repo root `.env.local` with `CONVEX_DEPLOYMENT=dev:…`.
3. Copy **`NEXT_PUBLIC_CONVEX_URL`** (e.g. `https://….convex.cloud`) into `apps/web/.env.local`.
4. Set env vars in the [Convex dashboard](https://dashboard.convex.dev) (§3).

> **Build without a running backend:** Committed stubs under `convex/_generated/` allow `pnpm build`. After changing Convex functions, run `npx convex dev` or `npx convex codegen` so types stay in sync.

---

## 2. Web environment (`apps/web/.env.local`)

Create `apps/web/.env.local` (not committed):

```bash
# Required — from `npx convex dev` output or Convex dashboard → Settings
NEXT_PUBLIC_CONVEX_URL=https://<your-dev-deployment>.convex.cloud

# Wallet / GoodDollar (see apps/web/.env.example)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
NEXT_PUBLIC_PRIVY_APP_ID=...
NEXT_PUBLIC_GOODDOLLAR_ENV=development
NEXT_PUBLIC_TIP_RECIPIENT=0x...
```

Copy the rest from [`apps/web/.env.example`](../apps/web/.env.example) as needed (support/deploy/stream recipients, demo mode, receipt address).

**Privy:** Add `http://localhost:3000` to allowed origins in the [Privy dashboard](https://dashboard.privy.io).

---

## 3. Convex env (quest verification)

**Local (after `npx convex login`):** `npx convex env set --deployment local NAME value`.

**Cloud dev:** [dashboard.convex.dev](https://dashboard.convex.dev) → your project → **Settings → Environment Variables** on the development deployment.

| Variable | Required | Purpose |
|----------|----------|---------|
| `GOODDOLLAR_ENV` | Yes | `development` \| `staging` \| `production` |
| `CELO_RPC_URL` | Yes | Celo RPC (default `https://forno.celo.org`) |
| `TIP_RECIPIENT` | Yes | Tip quest recipient `0x…` |
| `MIN_TIP_G` | Yes | Min tip in human G$ (e.g. `0.01`) |
| `SUPPORT_RECIPIENT` or `SUPPORT_RECIPIENTS` | Yes* | Support pool address(es) |
| `MIN_SUPPORT_G` | Yes* | Min support transfer |
| `MIN_DEPLOY_G` | Yes* | Savings / deploy quest minimum |
| `STREAM_RECIPIENT` | If using deploy/stream quest | Superfluid stream recipient |
| `MIN_STREAM_G_PER_MONTH` | If using stream quest | Min stream rate |
| `GOODPATH_RECEIPT_ADDRESS` | Optional | On-chain GoodPathReceipt proxy |
| `GOODPATH_RELAYER_PRIVATE_KEY` | Optional | Relayer for receipt writes (64 hex chars, no `0x` prefix in env) |

\*Required for the corresponding on-chain quests you test locally.

Values should match your `NEXT_PUBLIC_*` quest settings in `apps/web/.env.local` where applicable.

---

## 4. Run the stack

```bash
pnpm dev
```

Starts:

- **Next.js** at [http://localhost:3000](http://localhost:3000)
- **`npx convex dev`** (watch, push functions, regenerate types)

If something is already on port 3000, the script exits unless you set `GOODPATH_DEV_FORCE=1`.

### Optional: seed division benchmarks

With Convex dev running:

```bash
npx convex run seed:divisionRunners
```

Populates seeded league runners (internal mutation — not callable from the browser).

### Optional: legacy Hono API

```bash
GOODPATH_USE_HONO_API=1 pnpm dev
```

Starts `services/api` on `:3001` instead of Convex. Also set in `apps/web/.env.local`:

```bash
GOODPATH_USE_HONO_API=1
NEXT_PUBLIC_GOODPATH_USE_HONO_API=1
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Phone / QR / face verification on a real device

- **LAN:** `pnpm dev:lan` — sets `NEXT_PUBLIC_APP_URL` to your machine’s LAN IP.
- **Tunnel:** `pnpm dev:tunnel` — public URL for callbacks.

Never use `localhost` in `NEXT_PUBLIC_APP_URL` when testing on a phone.

### Demo / judge mode (no wallet)

```bash
NEXT_PUBLIC_DEMO_MODE=true pnpm dev
```

Uses a local demo profile; Convex is not required for the tab shell.

---

## 5. Verify locally

1. Open [http://localhost:3000](http://localhost:3000).
2. **Connect wallet** (Privy or wagmi).
3. Confirm profile loads (quests, streak, league) — browser devtools should show Convex WebSocket traffic, not `fetch` to `/goodpath-api`.
4. Complete a quest (e.g. connect → verify → claim → tip) with a real tx where required.
5. Check **league / division** card updates points; optional rival card after seed.
6. Convex dashboard → **Logs** — inspect `verify.validate` if completion fails.

### Build & lint (before opening a PR)

```bash
pnpm build              # monorepo (shared, api, web)
pnpm lint:convex        # Convex ESLint
pnpm contracts:test     # Foundry (packages/contracts)
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Console: `NEXT_PUBLIC_CONVEX_URL is unset` | Add URL to `apps/web/.env.local`; restart `pnpm dev`. |
| Profile never loads / Convex errors | Confirm `npx convex dev` is running; check deployment URL matches `.env.local`. |
| Quest complete fails (“verification failed”) | Set Convex dashboard env vars (§3); ensure `GOODDOLLAR_ENV` matches chain; check **Logs** for `internal.verify.validate`. |
| `npx convex codegen` fails | Run `npx convex dev` once to create repo root `.env.local` with `CONVEX_DEPLOYMENT`. |
| Type error on `profiles.get` args | Run `npx convex dev` to refresh `convex/_generated/api.d.ts`, or align committed stub with `weekStart` / `periodId`. |
| `/goodpath-api` returns 410 | Expected — Convex is default. Use `GOODPATH_USE_HONO_API=1` only for legacy debugging. |
| Port 3000 in use | `pnpm dev:kill` or `GOODPATH_DEV_FORCE=1 pnpm dev`. |
| `EXDEV: cross-device link not permitted` on `npx convex dev` | Repo and `/tmp` on different disks. `pnpm dev` sets `CONVEX_TMPDIR` / `TMPDIR` to `.convex-tmp/` automatically; or run manually: `mkdir -p .convex-tmp && CONVEX_TMPDIR=$PWD/.convex-tmp TMPDIR=$PWD/.convex-tmp npx convex dev`. |
| `lz-string` / `@goodsdks/citizen-sdk` analyze error | Fixed in-repo — verify uses inlined Celo ABIs in `convex/verify/gooddollar.ts`. Re-run `npx convex dev`. |

---

## Related docs

- [CONVEX_MIGRATION.md](./architecture/CONVEX_MIGRATION.md) — schema, API mapping, plugin workflow
- [VERCEL_PRODUCTION_CHECKLIST.md](./VERCEL_PRODUCTION_CHECKLIST.md) — **after** local E2E works
- [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) — Vercel project layout and domains
