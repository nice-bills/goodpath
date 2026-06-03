# G$ Path

Gamified **GoodDollar onboarding** for the GoodBuilders hackathon — verify identity, claim daily UBI, tip with G$, support GoodCollective, build a streak. Ends with a shareable **Path Receipt**.

## Pitch (one line)

> New user goes from zero → verified → claiming → transacting → supporting the ecosystem in under five minutes.

## Stack

| Package | Role |
|---------|------|
| `apps/web` | Next.js app (Celo + GoodSDKs + Path Receipt) |
| `services/api` | Quest progress, streaks, impact stats (Hono + SQLite) |
| `packages/shared` | Quest definitions + schemas |

## Quick start

```bash
cd goodpath
pnpm install
pnpm dev          # web :3000 + API :3001 (kills stale ports, clears .next)
```

Open http://localhost:3000

### Phone / judging from another device

```bash
pnpm dev:lan      # http://<your-lan-ip>:3000 — same WiFi
pnpm dev:tunnel   # https://….trycloudflare.com
pnpm dev:demo     # enables demo mode toggle (no chain needed for receipt preview)
```

## Env (`apps/web/.env.local`)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Reown / WalletConnect |
| `NEXT_PUBLIC_PRIVY_APP_ID` | Social login (Google/email) + embedded wallet on Celo |
| `NEXT_PUBLIC_GOODDOLLAR_ENV` | `development` \| `staging` \| `production` |
| `NEXT_PUBLIC_API_URL` | Default `http://localhost:3001`; `/goodpath-api` when tunneling |
| `NEXT_PUBLIC_TIP_RECIPIENT` | Address receiving tip quest transfers |
| `NEXT_PUBLIC_SUPPORT_RECIPIENT` | GoodCollective pool or team wallet (support quest) |
| `NEXT_PUBLIC_MIN_DEPLOY_G` | Min G$ for post-path stake (default `0.01`) |
| `NEXT_PUBLIC_DEMO_MODE` | `true` — demo path + receipt without chain |
| `NEXT_PUBLIC_APP_URL` | Set by `dev:lan` / tunnel for phone QR callbacks |

Copy from `apps/web/.env.example`.

### Slice A — gasless social claim (wow demo)

1. Create a [Privy](https://dashboard.privy.io) app → enable **Google** + **Email** + **Wallet** → add `http://localhost:3000` (and your tunnel URL) to allowed origins.
2. Set `NEXT_PUBLIC_PRIVY_APP_ID` in `apps/web/.env.local`.
3. `pnpm dev` → **Connect** → Continue with Google or email (embedded Celo wallet) **or** MetaMask.
4. **Email login:** after the OTP, the app calls Privy `createWallet()` (required — [Privy does not auto-create wallets for custom `loginWithCode` flows](https://docs.privy.io/basics/react/advanced/automatic-wallet-creation)). First time can take **30–90s**; button shows “Setting up wallet…”.
5. Complete verify → **Claim**: the app calls GoodDollar `topWallet` automatically if CELO is low, polls ~45s, then runs `claim()`.
6. Finish tip + support → **Path Receipt** on `/?tab=celebrate`.
7. (Path B) **Deploy** — stake G$ via `@goodsdks/savings-sdk` (Celo mainnet).

Without `NEXT_PUBLIC_PRIVY_APP_ID`, MetaMask / WalletConnect still work; claim/tip still auto-request GoodDollar gas.

## Quests

1. **Connect** — auto on profile load  
2. **Verify** — GoodDollar face verification (QR for phone)  
3. **Claim** — daily UBI on Celo (~0.002 CELO gas needed)  
4. **Tip** — G$ transfer to `TIP_RECIPIENT`  
5. **Support** — on-chain G$ to pool **or** GoodCollective visit ack  
6. **Deploy** (post-path) — **Save** (`@goodsdks/savings-sdk` stake) or **Stream** (Superfluid G$/mo) on Celo mainnet  

Each quest has **Why this matters** copy. Order enforced server-side. Path **100%** = first five quests.

## Features (submission)

- **Path Receipt** — shareable completion card with tx links (`/?tab=celebrate`)  
- **Deep G$** — support tx verification + savings-sdk stake (Celoscan proof)  
- **Impact strip** — wallets on path, completions, tips (`GET /api/stats`)  
- **Demo mode** — `pnpm dev:demo` or `NEXT_PUBLIC_DEMO_MODE=true`  
- **Today's habit** — post-path daily claim loop on home  
- **Friendly failures** — CELO gas hints, FV QR, network guidance  

## Demo script (90s)

1. Home — read funnel subtitle + ecosystem pulse  
2. Connect wallet on Celo (or **Try demo mode** for judges)  
3. Quests → Verify (laptop sign + phone QR if needed)  
4. Claim (approve CELO gas if prompted)  
5. Tip → Support GoodCollective  
6. **Done** (`/?tab=celebrate`) → Path Receipt → Copy share line  
7. **Deploy** — Save (stake) or Stream (G$/mo) — Path B depth  
8. Home → league + Celoscan proof line  

## Demo mode (judges)

```bash
pnpm dev:demo
```

Tap **Try demo mode** on home — full path + receipt with sample data. Labelled honestly; no fake on-chain state.

## Build

```bash
pnpm build
```

## Production

- **Path A + B closeout:** [`docs/PATH_A_B_CLOSEOUT.md`](docs/PATH_A_B_CLOSEOUT.md)  
- Deploy: [`docs/DEPLOY.md`](docs/DEPLOY.md)  
- E2E template: [`docs/E2E_PRODUCTION.md`](docs/E2E_PRODUCTION.md)  
- Submission copy: [`docs/SUBMISSION.md`](docs/SUBMISSION.md)

## Agent handoff

**Full context for another agent:** [`docs/AGENT_HANDOFF.md`](docs/AGENT_HANDOFF.md)  
**Visual roadmap:** [`docs/artifacts/production-and-path-b.html`](docs/artifacts/production-and-path-b.html) (open in browser)

## Links

- [GoodBuilders Buildathon](https://gooddollar.notion.site/GoodBuilders-7-Day-Buildathon-366f258232f08174998ed65a323e004d)
- [GoodSDKs](https://github.com/GoodDollar/GoodSdks)
