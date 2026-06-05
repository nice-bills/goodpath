# GoodPath 3.0 — Judge demo script (one real user)

**Live:** https://goodpath-app.vercel.app  
**API:** same origin `/goodpath-api` (Vercel rewrite)

## Setup (2 min)

1. Open the app on Celo mainnet (or local `pnpm dev`).
2. Connect via **email/Google (Privy)** or MetaMask — wait for “Creating Celo wallet…” if linking is slow.
3. Optional: append `?ref=0xYourReferrer` before connect to test referrals.

## Act 1 — League with zero other users (3 min)

1. **Home** tab shows **Bronze/Silver/Gold division**, rank in a cohort of **benchmark runners** (labeled, not fake humans).
2. Note **Next move** (verify → claim → tip → support → deploy).
3. **Solo challenge** card compares your pts to the **seeded median**.

## Act 2 — Deep G$ utility (8 min)

| Step | Action | Proof |
|------|--------|-------|
| Verify | Face verification | On-chain whitelist |
| Claim | Daily UBI | Claim tx |
| Tip | G$ to jar | Transfer tx |
| Support | G$ to GoodCollective pool | Transfer (+4 league bonus vs visit ack) |
| Deploy | **Save** (savings-sdk) or **Stream** (Superfluid) | +12 or +18 league pts |

## Act 3 — Receipt & social (2 min)

1. **Celebrate** tab — Path Receipt with proof mix + league summary.
2. Referral capture on load; share invite via API `POST …/share-invite` (optional).

## Talking points

- **Celo-only** productive G$ loop, not claim-only.
- **SQLite now**, repository abstraction for Postgres later (`DATABASE_PROVIDER`).
- **GoodPathReceipt** UUPS on Celo optional via relayer env — no custody.
- Vercel serverless uses **`/tmp/goodpath-data`** — ephemeral unless `GOODPATH_DATA_DIR` is on persistent volume.

## Reset demo data

```bash
node scripts/demo-seed.mjs 0xYourAddress
```
