# Path B plan (locked order)

**Judge line:** Onboard with GoodDollar (identity + gas-sponsored claim) → **move G$** (tip, real support, save/stream) → ranked on velocity league with Celoscan proof.

## Path A done = 

- [x] Tab shell, auto gas, Privy createWallet flow
- [x] `useWalletSession` (disconnected | linking | ready)
- [ ] One clean E2E on `GOODDOLLAR_ENV=production` (recorded)
- [ ] Deployed web + API with CORS + Privy origins

## Path B (build in order)

1. **B1** — Support quest: verify on-chain G$ transfer (not ack-only); ack fallback ✅
2. **B2** — Post-path quest `deploy`: choose save OR stream ✅
3. **B3** — `@goodsdks/savings-sdk` deposit flow + API verify ✅
4. **B4** — Superfluid G$ stream via CFA forwarder ✅
5. **B5** — Referral deep link on Path Receipt (`?ref=`) ✅ (engagement-sdk optional later)
6. **B6** — `chainProofs` on profile + league Celoscan copy ✅

## Packages to add

- `@goodsdks/savings-sdk`
- `@goodsdks/engagement-sdk`
- Superfluid: `@superfluid-finance/sdk-core` (research Celo G$ SuperToken address)

## Do not

- Lead with custom registry as the product
- Ship Path B before Path A E2E passes on target env

Full roadmap: `docs/artifacts/production-and-path-b.html`
