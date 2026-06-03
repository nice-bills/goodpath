# Path A + B closeout (before GoodPath 2.0)

**Code status (2026-06-03):** Path B features B1–B6 are implemented. Path A product shell is implemented. What remains is **production proof** (deploy + recorded E2E), not new quest logic.

---

## Path A — ship-ready product

| # | Item | Status | Owner |
|---|------|--------|--------|
| A1 | Tab shell `/?tab=home\|quests\|celebrate` | Done | — |
| A2 | `useWalletSession` + wallet gating + single connect CTA | Done | — |
| A3 | Privy Google/email + `createWallet()` after OTP | Done | — |
| A4 | GoodDollar auto gas (`topWallet`) on claim | Done | — |
| A5 | Hydration-safe wallet bootstrap (`useMounted`) | Done | — |
| A6 | `pnpm build` passes | Done | run locally after big changes |
| A7 | Web + API deployed, env matched | **You** | [`DEPLOY.md`](DEPLOY.md) |
| A8 | Privy allowed origins include deploy URL | **You** | Privy dashboard |
| A9 | One full E2E on `GOODDOLLAR_ENV=production` (recorded) | **You** | [`E2E_PRODUCTION.md`](E2E_PRODUCTION.md) |
| A10 | `SMOKE_URL=… pnpm --filter @goodpath/web smoke` on deploy | **You** | after A7 |

**Path A = done when A7–A10 are checked off** (plus A6 on each release).

---

## Path B — protocol depth (code)

| # | Item | Status |
|---|------|--------|
| B1 | Support: on-chain G$ verify + visit ack fallback | Done |
| B2 | Post-path **Deploy** quest (Save \| Stream) | Done |
| B3 | `@goodsdks/savings-sdk` stake + API verify | Done |
| B4 | Superfluid G$ stream (CFA forwarder on Celo) | Done |
| B5 | Referral `?ref=` on Path Receipt | Done |
| B6 | `chainProofs` + Celoscan links on league/receipt | Done |
| B5+ | `@goodsdks/engagement-sdk` | **Deferred** (optional; not required for A/B sign-off) |

**Path B code = done.** Path B **demo proof** = include at least one **Deploy** tx in E2E (step 7 below).

---

## Your runbook (single session, ~45–90 min)

### 1. Configure production

Copy and fill:

- `apps/web/.env.production.local` (or host env) from [`apps/web/.env.example`](../apps/web/.env.example)
- API env from [`services/api/.env.example`](../services/api/.env.example)

Required:

```bash
NEXT_PUBLIC_GOODDOLLAR_ENV=production
NEXT_PUBLIC_API_URL=https://YOUR_API
NEXT_PUBLIC_TIP_RECIPIENT=0x…
NEXT_PUBLIC_SUPPORT_RECIPIENT=0x…   # GoodCollective pool or team wallet
GOODDOLLAR_ENV=production
CORS_ORIGINS=https://YOUR_WEB
TIP_RECIPIENT=0x…                    # must match web
SUPPORT_RECIPIENT=0x…
```

Optional for Stream tab: `NEXT_PUBLIC_STREAM_RECIPIENT`, `NEXT_PUBLIC_MIN_STREAM_G_PER_MONTH` (API: `STREAM_RECIPIENT`, `MIN_STREAM_G_PER_MONTH`).

### 2. Deploy

Follow [`DEPLOY.md`](DEPLOY.md). Persist `GOODPATH_DATA_DIR` for SQLite.

### 3. Smoke

```bash
SMOKE_URL=https://YOUR_WEB pnpm --filter @goodpath/web smoke
```

### 4. Record E2E

Use [`E2E_PRODUCTION.md`](E2E_PRODUCTION.md). **Path B sign-off:** complete step 7 (Deploy — Save **or** Stream) and paste Celoscan URLs into that file.

### 5. Submission

Paste judge line + tx links into [`SUBMISSION.md`](SUBMISSION.md). Record 90s video per script there.

---

## After A + B

Only then start **GoodPath 2.0** ([`artifacts/goodbuilders-winning-direction.html`](artifacts/goodbuilders-winning-direction.html)): league-first narrative, `GoodPathReceipt` UUPS contract, seeded divisions.

Do **not** block A/B on 2.0 scope.
