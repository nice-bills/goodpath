# G$ Path — production deploy checklist

## Path A definition of done

- [ ] `pnpm build` passes
- [ ] Web + API deployed with matching env
- [ ] Privy dashboard: Google + Email + Wallet; **all deploy origins** listed
- [ ] One full E2E on `GOODDOLLAR_ENV=production` (or staging) — see [`E2E_PRODUCTION.md`](E2E_PRODUCTION.md)
- [ ] `SMOKE_URL=https://your-web.example.com pnpm --filter @goodpath/web smoke`

## Web environment

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Yes | Reown / WalletConnect |
| `NEXT_PUBLIC_PRIVY_APP_ID` | For social demo | Allowed origins must include deploy URL |
| `NEXT_PUBLIC_GOODDOLLAR_ENV` | Yes | `production` or `staging` for judge run |
| `NEXT_PUBLIC_API_URL` | Yes | Deployed API base URL |
| `NEXT_PUBLIC_TIP_RECIPIENT` | Yes | Real team wallet |
| `NEXT_PUBLIC_SUPPORT_RECIPIENT` | Recommended | GoodCollective pool or team wallet (falls back to tip) |
| `NEXT_PUBLIC_MIN_TIP_G` | Optional | Default `0.01` |
| `NEXT_PUBLIC_MIN_SUPPORT_G` | Optional | Default `0.01` |
| `NEXT_PUBLIC_MIN_DEPLOY_G` | Optional | Default `0.01`; deploy quest uses savings-sdk on **Celo mainnet** |
| `NEXT_PUBLIC_APP_URL` | Phone FV | Tunnel/LAN URL for QR callbacks |

## API environment

| Variable | Required | Notes |
|----------|----------|--------|
| `PORT` | Yes | e.g. `3001` |
| `GOODPATH_DATA_DIR` | Yes | Persistent volume for SQLite |
| `CORS_ORIGINS` | Yes | Comma-separated web origin(s) |
| `GOODDOLLAR_ENV` | Yes | Match web |
| `CELO_RPC_URL` | Recommended | Reliable Forno or provider |
| `TIP_RECIPIENT` | Yes | Must match web |
| `SUPPORT_RECIPIENT` | Recommended | Comma-separated pool addresses; falls back to `TIP_RECIPIENT` |
| `MIN_TIP_G` / `MIN_SUPPORT_G` / `MIN_DEPLOY_G` | Optional | Human-readable G$ amounts |

## Deploy quest note

`@goodsdks/savings-sdk` stakes on **Celo mainnet** (`0x799a23…` staking contract). For production demos, set `NEXT_PUBLIC_GOODDOLLAR_ENV=production` and ensure judges have mainnet G$ + CELO (gas sponsorship still applies via `topWallet`).

## Smoke test

```bash
SMOKE_URL=https://your-web.example.com pnpm --filter @goodpath/web smoke
```

Checks `GET /api/health` and `/` return 200.

## Privy

1. Enable Google, Email, embedded wallet on Celo.
2. Add production URL + preview URLs to allowed origins.
3. `createOnLogin: "off"` in app — wallet created via `createWallet()` after OTP (by design).

## What not to do

- Do not add separate tab routes — use `/?tab=quests` and `/?tab=celebrate`
- Do not ship custom registry as the product narrative
