# G$ Path — Complete agent handoff

**Repo:** `/home/bills/code/goodpath`  
**Hackathon:** GoodBuilders / GoodDollar  
**Product:** Gamified GoodDollar onboarding → verify → claim UBI → tip → support → Path Receipt. Post-path: **deep G$ integration** (save, stream, real support txs).

**Owner goal:** Production-ready for judge selection. Path A must be bulletproof; Path B must prove protocol depth (not “claim + tip + SQLite only”).

**GoodPath 3.0:** See [`GOODPATH_3.0_HANDOFF.md`](GOODPATH_3.0_HANDOFF.md) for domain/repository layer, seeded league, migrations, rivals/squads stubs, contract package, and judge demo (`scripts/judge-demo.md`).

---

## 1. Judge narrative (use in submission + demo)

> **G$ Path** is not another claim button. We onboard with GoodDollar identity and gas-sponsored `topWallet`, then require **productive G$ movement** — tip, real GoodCollective support, and post-path deploy via official savings/stream SDKs — ranked on a velocity league with Celoscan proof. We use **GoodSDKs** (citizen, savings, engagement), not a fake off-chain badge.

---

## 2. Architecture

```
goodpath/
├── apps/web/          Next.js 15 (Turbopack), wagmi, Privy optional, GoodSDKs
├── services/api/      Hono + domain/ + repository/ + SQLite (migrations)
├── packages/contracts/ GoodPathReceipt UUPS (optional Celo deploy)
└── packages/shared/   Quest defs, league scoring, seeded cohorts
```

| Layer | Tech |
|-------|------|
| Chain | Celo (G$, IdentityV2, UBI) |
| Identity / claim | `@goodsdks/citizen-sdk` (IdentitySDK, ClaimSDK) |
| Wallet rails | MetaMask / WalletConnect OR Privy embedded Celo wallet |
| Gas | GoodDollar `POST {backend}/verify/topWallet` — see `apps/web/src/lib/gooddollar-gas.ts` |
| UI | Single-page **tab shell** on `/` with `?tab=home|quests|celebrate` (keep-alive panels) |

### Tab routing (important)

- **All main UI lives on `/`** inside `AppTabShell` — do not add new top-level routes for tabs.
- Legacy: `/quests` → redirect `/?tab=quests`, `/celebrate` → `/?tab=celebrate`.
- Tab switch uses **`history.replaceState`** + `AppTabProvider` context — **not** `router.push` (avoids slow remounts).
- In-app links: use `TabLink` from `apps/web/src/components/tab-link.tsx`.

---

## 3. Quest system (current — Path A)

Defined in `packages/shared/src/quests.ts`:

| Order | id | kind | Proof (server) |
|-------|-----|------|----------------|
| 1 | connect | auto | Auto on first profile GET |
| 2 | verify | identity | `getWhitelistedRoot` on Celo |
| 3 | claim | claim | UBI claim tx / event |
| 4 | tip | transfer | G$ `Transfer` to `TIP_RECIPIENT` ≥ `MIN_TIP_G` |
| 5 | support | external | G$ transfer to `SUPPORT_RECIPIENT` **or** visit ack fallback |
| 6 | deploy | deploy | Post-path: savings-sdk **stake** or Superfluid **createFlow** |

**Quest UI dispatcher:** `apps/web/src/components/quest/quest-action.tsx` (dynamic imports per action).

**Complete quest API:** `POST /api/profile/:address/quests/:questId/complete`  
Body: `{ txHash?: string, meta?: string }` — validated in `packages/shared/src/schemas.ts`.

**Server proof:** `services/api/src/verify.ts` → `validateQuestProof()`.

**DB + streaks:** `services/api/src/db.ts`.

---

## 4. What is already built (do not redo)

### Path A — core product
- [x] 5-quest path with server-side ordering (`packages/shared/src/prerequisites.ts`)
- [x] Face verification flow + QR for phone (`verify-action`, `fv-qr-panel`, `use-fv-verification.ts`)
- [x] Claim with GoodDollar ClaimSDK (`claim-action.tsx`, `use-good-sdks.ts`)
- [x] Auto gas: `use-ensure-gas.ts` + `requestGoodDollarGasTopUp` before claim/tip
- [x] Tip quest with on-chain verification
- [x] Privy email/Google + **manual `createWallet()` after OTP** (`use-privy-embedded-wallet.ts`, `privy-login-options.tsx`)
- [x] MetaMask path + wallet modal (“Recommended” MetaMask first)
- [x] Privy embedded provider for GoodSDKs (`use-privy-ethereum-provider.ts`)
- [x] Path Receipt + share line (`path-receipt.tsx`, `lib/path-receipt.ts`)
- [x] League card + personal bests (SQLite — not chain-indexed yet)
- [x] Demo mode (`use-demo-mode.ts`, `demo-profile.ts`)
- [x] Impact strip (`GET /api/stats`)
- [x] Tab shell + fast nav (`app-tab-shell.tsx`, `app-tab-provider.tsx`)
- [x] **`useWalletSession()`** — `disconnected` | `linking` | `ready` (`hooks/use-wallet-session.ts`)

### DevOps / DX
- [x] `pnpm dev` starts web :3000 + API :3001, kills stale ports, clears `.next`
- [x] `pnpm dev:lan`, `pnpm dev:tunnel`, `pnpm dev:demo`
- [x] Health: API `/health`, web checks both in `scripts/start-dev.mjs`

---

## 5. Path A — remaining (production ready)

**Definition of done:** Judge completes full path on **production** GoodDollar config without developer coaching.

| # | Task | Files / notes |
|---|------|----------------|
| A1 | **One recorded E2E** on staging or production env | Save Celoscan links; script in README |
| A2 | **Deploy** web + API | Set all env below; Privy dashboard origins |
| A3 | **`pnpm build`** green | Fixed `showWalletUIs` removed from `privy-config.ts` (invalid type) |
| A4 | **`pnpm smoke`** on deploy URL | `apps/web/scripts/smoke.mjs` |
| A5 | Update **SUBMISSION.md** + README | Celebrate = `/?tab=celebrate`; mention gas + Privy |
| A6 | **topWallet failure UX** | If gas poll fails, show CELO faucet link (`CELO_FAUCET_URL` in `gooddollar-gas.ts`) |
| A7 | Optional: `support-action` use `useWalletSession().address` not raw `useAccount()` | `support-action.tsx` still uses wagmi-only address |

### Production env

**Web** (`apps/web/.env.local` or host env):

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
NEXT_PUBLIC_PRIVY_APP_ID=...          # required for social demo
NEXT_PUBLIC_GOODDOLLAR_ENV=production # or staging for test
NEXT_PUBLIC_API_URL=https://your-api.example.com
NEXT_PUBLIC_TIP_RECIPIENT=0x...       # real team wallet
NEXT_PUBLIC_MIN_TIP_G=0.01
# Tunnel/LAN only:
# NEXT_PUBLIC_APP_URL=https://...
# USE_API_PROXY=true + API_PROXY_TARGET for single-origin tunnel
```

**API** (`services/api/.env`):

```bash
PORT=3001
GOODPATH_DATA_DIR=./data
CORS_ORIGINS=https://your-web.example.com
GOODDOLLAR_ENV=production
CELO_RPC_URL=https://forno.celo.org
TIP_RECIPIENT=0x...    # must match web
MIN_TIP_G=0.01
```

**Privy dashboard:** Enable Google + Email + Wallet; add all deploy origins; Celo chain.

---

## 6. Path B — deep G$ integration (build in this order)

**Do not** lead with a custom registry contract. Judges want **GoodDollar protocol** usage.

### B1 — Real GoodCollective / G$ support (P0 — highest ROI)

**Problem:** Support quest is visit-ack only — weakest integration story.

**Do:**
1. Add optional on-chain path: user sends G$ to GoodCollective pool / known address (research GoodCollective Celo contract or documented donate flow).
2. Extend `validateQuestProof` for `support` in `services/api/src/verify.ts` — accept `txHash` like tip (verify G$ transfer).
3. Update `support-action.tsx`: primary CTA = send G$; fallback = visit + ack.
4. Keep `SUPPORT_ACK_META` as fallback if tx fails.

### B2 — Post-path “Deploy G$” quest (P0)

**Problem:** After path, product feels dead except daily claim.

**Do:**
1. Extend `QuestId` in `packages/shared/src/quests.ts`: e.g. `deploy` (order 6, unlocked only when `pathCompletedAt` set).
2. New `QuestKind`: e.g. `"deploy"` or reuse `"external"` with subtypes.
3. UI: new tab section or quest sticker on Quests — **“Put your G$ to work”** — user picks **Save** or **Stream**.
4. API: verify completion via tx hash or protocol-specific proof.

### B3 — Savings SDK (P1)

**Package:** `@goodsdks/savings-sdk` (npm `1.0.0`) — [GoodSDKs monorepo](https://github.com/GoodDollar/GoodSdks).

**Do:**
1. `pnpm --filter @goodpath/web add @goodsdks/savings-sdk`
2. New `deploy-save-action.tsx` — deposit min G$ via SDK or savings-widget
3. Server verifies deposit tx / event (mirror `verifyTipTx` pattern in `verify.ts`)
4. Wire into B2 “Save” path

### B4 — Superfluid G$ stream (P2 — stage wow)

**Do:**
1. Research Celo G$ SuperToken address for target `GOODDOLLAR_ENV`
2. Add `@superfluid-finance/sdk-core` (or documented alternative)
3. `deploy-stream-action.tsx` — create flow to league jar / tip jar
4. Show flow rate on Path Receipt

### B5 — Engagement SDK (P2)

**Package:** `@goodsdks/engagement-sdk` (npm `1.0.4`).

**Do:** Referral / onboarding reward on receipt share line.

### B6 — Chain-backed league (P2)

**Do:** Index outbound G$ txs (tip + support + save + stream); cache in SQLite; show “provable on Celoscan” in `league-card.tsx`.

---

## 7. How to add a new quest (checklist)

1. **`packages/shared/src/quests.ts`** — add `QuestId`, definition, `QuestKind` if new
2. **`packages/shared/src/schemas.ts`** — extend `questIdSchema` if needed
3. **`services/api/src/verify.ts`** — proof logic in `validateQuestProof`
4. **`services/api/src/db.ts`** — usually no change if id is in QUESTS
5. **`apps/web/src/components/quest/actions/*-action.tsx`** — new action component
6. **`apps/web/src/components/quest/quest-action.tsx`** — wire switch case
7. **Prerequisites** — automatic via `order` in QUESTS

---

## 8. Critical gotchas (read before coding)

### Privy embedded wallet
- `embeddedWallets.createOnLogin` **does NOT run** for whitelabel `loginWithCode` / OAuth.
- **Must call `createWallet()`** after OTP, then `setActiveWallet()` — see `ensureEmbeddedWalletLinked()` in `use-privy-embedded-wallet.ts`.
- First wallet creation: **30–90 seconds** — UI must show linking state (`useWalletSession` / `phase === "slow"`).
- `privy-config.ts`: `createOnLogin: "off"` — intentional.

### Wallet address resolution
- Use **`useWalletSession()`** everywhere — not raw `useAccount()` alone for “connected?”
- GoodSDKs wallet client: `use-good-sdks.ts` → `usePrivyEthereumProvider` + wagmi fallback
- Single `PrivyWagmiSync` with `autoRestore: true` in `privy-providers.tsx` only

### Gas
- `MIN_CELO_FOR_TX = 0.01` in `gooddollar-gas.ts`
- Backends: production `https://goodserver.gooddollar.org`, staging QA, development heroku
- `use-ensure-gas.ts` polls before claim/tip

### Dev server
- “Internal Server Error” on :3000 often = corrupted `.next` → `pnpm dev:kill && pnpm dev`
- API must be on :3001 for profile loads

### Face verification on phone
- Set `NEXT_PUBLIC_APP_URL` to LAN or tunnel URL — **not localhost** for QR callbacks
- `lib/fv-callback.ts`, `lib/app-origin.ts`

### Tab performance
- Do not move tabs back to separate Next.js pages
- Do not use `router.push` for tab switches — use `AppTabProvider.setTab`

---

## 9. Key file map

| Area | Path |
|------|------|
| Tab shell | `apps/web/src/components/app-tab-shell.tsx` |
| Tab state | `apps/web/src/components/app-tab-provider.tsx` |
| Wallet session | `apps/web/src/hooks/use-wallet-session.ts` |
| Privy wallet setup | `apps/web/src/hooks/use-privy-embedded-wallet.ts` |
| Privy config | `apps/web/src/lib/privy-config.ts` |
| GoodSDKs | `apps/web/src/hooks/use-good-sdks.ts` |
| Gas | `apps/web/src/lib/gooddollar-gas.ts`, `hooks/use-ensure-gas.ts` |
| Claim / tip / verify / support | `apps/web/src/components/quest/actions/` |
| Profile API client | `apps/web/src/lib/api.ts` |
| API entry | `services/api/src/index.ts` |
| On-chain verify | `services/api/src/verify.ts` |
| Quest definitions | `packages/shared/src/quests.ts` |
| Strategy (visual) | `docs/artifacts/g-path-deep-strategy.html` |
| Roadmap | `docs/artifacts/production-and-path-b.html` |
| Path B order | `.superstack/path-b-plan.md` |
| Submission | `docs/SUBMISSION.md` |

---

## 10. Commands

```bash
cd /home/bills/code/goodpath
pnpm install
pnpm dev              # web :3000 + API :3001
pnpm dev:kill && pnpm dev   # fix corrupt .next
pnpm dev:demo         # demo mode toggle
pnpm dev:lan          # phone on WiFi
pnpm dev:tunnel       # cloudflare tunnel + API proxy
pnpm build            # production build all packages
pnpm --filter @goodpath/web smoke
pnpm --filter @goodpath/web privy:check
```

---

## 11. API reference

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Health check |
| GET | `/api/quests` | Quest definitions |
| GET | `/api/stats` | Impact strip stats |
| GET | `/api/profile/:address` | Full profile + quests + league |
| POST | `/api/profile/:address/quests/:questId/complete` | Complete quest `{ txHash?, meta? }` |

---

## 12. 90s demo script (judges)

1. Home — connect (MetaMask **recommended** for live demo; email if pre-warmed)
2. Quests → Verify (QR if laptop)
3. Claim — show gas sponsorship copy + tx
4. Tip 0.01 G$
5. Support — **after B1:** real G$ tx; **before B1:** visit ack
6. Done tab (`/?tab=celebrate`) — Path Receipt → copy share line
7. Home — Today’s habit

---

## 13. Acceptance criteria

### Path A complete
- [x] `pnpm build` passes
- [ ] Deployed with `GOODDOLLAR_ENV=production` (or staging) + Privy origins
- [ ] Full path completed once with screen recording + Celoscan links

**Master checklist:** [`docs/PATH_A_B_CLOSEOUT.md`](PATH_A_B_CLOSEOUT.md)
- [ ] No “connect wallet” flash while wallet chip shows address
- [ ] SUBMISSION.md accurate

### Path B minimum viable (selection story)
- [x] B1: Support quest verifies real G$ tx (ack fallback)
- [x] B2 + B3: Post-path deploy quest with savings-sdk save path
- [x] B4: Superfluid stream tab on deploy quest
- [x] B5: Referral link on Path Receipt (`?ref=`)
- [x] B6: `chainProofs` on profile + league Celoscan copy
- [x] README / submission updated for deploy env vars (see `docs/SUBMISSION.md`)
- [ ] Production E2E includes Deploy tx (Save or Stream) — see `docs/E2E_PRODUCTION.md` step 7

---

## 14. Explicit non-goals (do not scope creep)

- Custom registry / epoch contract as the **product** (glue only, later)
- ERC-4337 paymaster (not GoodDollar-native for v1)
- Supporter Aave staking narrative (wrong for UBI claimers)
- New top-level routes for Home/Quests/Done tabs
- Force-push to main without user request

---

## 15. Git / commits

- **Only commit when user asks**
- Repo may not be git-initialized in all environments — check first

---

## 16. Prompt to paste for the next agent

```
You are continuing G$ Path at /home/bills/code/goodpath for GoodBuilders selection.

READ FIRST: docs/AGENT_HANDOFF.md (this file), .superstack/path-b-plan.md, docs/artifacts/production-and-path-b.html

ORDER OF WORK:
1. Finish Path A production: deploy checklist, one E2E on production/staging GoodDollar env, smoke test, fix support-action to use useWalletSession, update SUBMISSION.md.
2. Path B in order: B1 real GoodCollective G$ support tx verification, B2 post-path Deploy quest, B3 @goodsdks/savings-sdk, then B4 Superfluid if time.

CONSTRAINTS: Keep tab shell on / with ?tab=. Use useWalletSession() for wallet state. Privy requires createWallet() after email OTP. Do not add registry-first architecture.

JUDGE LINE: Onboard with GoodDollar identity + gas-sponsored claim → require productive G$ movement (tip, real support, save/stream) → velocity league with Celoscan proof.
```

---

## 17. Related docs in repo

| File | Purpose |
|------|---------|
| `README.md` | Quick start, Slice A steps |
| `docs/SUBMISSION.md` | Hackathon submission blurb |
| `docs/artifacts/g-path-deep-strategy.html` | Full strategy, diagrams, option grid |
| `docs/artifacts/production-and-path-b.html` | Phased roadmap + env table |
| `.superstack/build-context.md` | Build status snapshot |
| `.superstack/path-b-plan.md` | Locked Path B order |

---

*Last updated: 2026-05-25 — after tab shell, useWalletSession, and Path B planning.*
