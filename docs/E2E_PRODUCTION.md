# Production / staging E2E — record once

Run this on **staging** or **production** GoodDollar config before judging. Save Celoscan links in the table below.

## Preconditions

- [ ] `NEXT_PUBLIC_GOODDOLLAR_ENV=production` (or `staging`)
- [ ] `TIP_RECIPIENT` and `SUPPORT_RECIPIENT` set to real addresses
- [ ] Privy origins include your deploy URL (if using social login)
- [ ] Fresh wallet or test wallet with ability to complete face verification

## Steps

| # | Step | Pass | Celoscan / notes |
|---|------|------|------------------|
| 1 | Open app → Connect (MetaMask or Privy email) | | |
| 2 | `/?tab=quests` → Verify identity (FV) | | Whitelist read on server |
| 3 | Claim daily G$ (gas sponsored if needed) | | `tx: 0x…` |
| 4 | Tip ≥ `MIN_TIP_G` G$ | | `tx: 0x…` |
| 5 | Support — send G$ on-chain **or** visit ack | | `tx: 0x…` or ack |
| 6 | `/?tab=celebrate` — Path Receipt 100% (core path) | | Screenshot |
| 7 | **Path B** — Deploy → **Save** (savings-sdk stake) **or** **Stream** (Superfluid) | | `tx: 0x…` |
| 8 | Home — league rank + **chain proof** line (tip/support/deploy hashes) | | Celoscan links visible |

## Recording

- Screen record 90s flow (connect → celebrate).
- Paste tx hashes into submission or README.
- Note wallet type used (MetaMask vs Privy embedded).

## Example Celoscan URLs

```
https://celoscan.io/tx/0xYOUR_CLAIM_HASH
https://celoscan.io/tx/0xYOUR_TIP_HASH
https://celoscan.io/tx/0xYOUR_SUPPORT_HASH
https://celoscan.io/tx/0xYOUR_STAKE_HASH
https://celoscan.io/tx/0xYOUR_STREAM_HASH
```

## Path A vs Path B sign-off

- **Path A complete:** rows 1–6 + smoke on deploy URL.
- **Path B complete:** row 7 (real Deploy tx on Celo mainnet) + row 8 (proofs on profile/receipt).

## Smoke after deploy

```bash
SMOKE_URL=https://YOUR_WEB_HOST pnpm --filter @goodpath/web smoke
```
