# GoodPathReceipt (UUPS)

Upgradeable **attestation** contract for GoodPath 3.0 — records quest completions, referrals, rivals, squads, season scores, and receipt hashes on **Celo**. **No user fund custody.**

## Events

| Event | Purpose |
|-------|---------|
| `QuestRecorded` | Quest completion + optional proof tx hash |
| `ReferralRecorded` | Referrer ↔ referred link |
| `RivalSet` | User picked a rival |
| `SquadJoined` | Squad membership (v2 scoring) |
| `SeasonScoreRecorded` | Weekly league score snapshot |
| `ReceiptIssued` | Shareable run receipt hash |

## Commands

```bash
cd packages/contracts
forge build
forge test
```

## Deploy (gated)

Set `DEPLOYER_PRIVATE_KEY` and optional `GOODPATH_CONTRACT_OWNER`, then:

```bash
forge script script/DeployGoodPathReceipt.s.sol \
  --rpc-url $CELO_RPC_URL \
  --broadcast
```

Wire the proxy address into API env:

- `GOODPATH_RECEIPT_ADDRESS`
- `GOODPATH_RELAYER_PRIVATE_KEY` (owner or dedicated relayer key)

## Upgrade

Owner calls `upgradeToAndCall` on the proxy (UUPS). Keep the storage gap in `GoodPathReceipt.sol` when adding state.
