# GoodPathReceipt (Celo)

Upgradeable **UUPS** ledger for GoodPath 2.0. Records quest/referral/squad/season events on Celo — **does not custody G$**.

## Status

| Step | Status |
|------|--------|
| Solidity + unit tests | ✅ Run locally |
| Mainnet deploy | **Deferred** — enable when ready for judge contract link |

## Local

```bash
pnpm contracts:test    # from repo root
pnpm contracts:build
```

## Deploy later (not required for app dev)

```bash
cd packages/contracts
export DEPLOYER_PRIVATE_KEY=0x…
export GOODPATH_RECEIPT_OWNER=0x…   # API relayer or multisig
forge script script/Deploy.s.sol --rpc-url celo --broadcast --verify
```

Then set `GOODPATH_RECEIPT_ADDRESS` + `GOODPATH_RELAYER_PRIVATE_KEY` on the API and `NEXT_PUBLIC_GOODPATH_RECEIPT_ADDRESS` on the web.

Until then, the app uses **SQLite league + Celoscan tx proofs** only; `recordQuestOnChain` is a no-op without env.
