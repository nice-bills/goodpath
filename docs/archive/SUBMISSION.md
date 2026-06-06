# GoodBuilders submission — G$ Path

## Judge line (30s)

> **G$ Path** is not another claim button. We onboard with GoodDollar identity and gas-sponsored `topWallet`, then require **productive G$ movement** — tip, on-chain GoodCollective support, and post-path **Save or Stream** via `@goodsdks/savings-sdk` + Superfluid — ranked on a velocity league with **Celoscan proof**. Official GoodSDKs, not a fake off-chain badge.

## One-liner

Gamified GoodDollar onboarding — verify, claim UBI, tip, support with real G$, then stake or stream idle G$ — with a shareable Path Receipt.

## What we built

- **5-quest core path** (100%) + **post-path Deploy** (Save | Stream)
- Server-side proof: identity, claim/tip/support/deploy (stake + Superfluid `createFlow`)
- **Privy** + MetaMask; `useWalletSession()` everywhere
- **Auto gas** via GoodDollar `topWallet`
- Tab shell `/?tab=home|quests|celebrate`
- League with deploy points + **chain proofs** (tip/support/deploy tx hashes)

## Integration depth

| Quest | Proof |
|-------|--------|
| Connect | Auto on profile load |
| Verify | `getWhitelistedRoot` on Celo |
| Claim | UBI `UBIClaimed` / tx to UBI contract |
| Tip | G$ `Transfer` to `TIP_RECIPIENT` |
| Support | G$ transfer to pool **or** visit ack |
| Deploy | Savings `stake()` **or** Superfluid `createFlow` on G$ |

## Packages

- `@goodsdks/citizen-sdk` — identity + claim
- `@goodsdks/savings-sdk` — post-path Save
- Superfluid `CFAv1Forwarder` on Celo — post-path Stream ([GoodDollar streaming guide](https://docs.gooddollar.org/for-developers/developer-guides/use-gusd-streaming))

## Run before demo

```bash
pnpm install && pnpm dev
```

Production: `NEXT_PUBLIC_GOODDOLLAR_ENV=production`, `TIP_RECIPIENT`, `SUPPORT_RECIPIENT`, Privy origins.

```bash
pnpm build
SMOKE_URL=https://your-app pnpm --filter @goodpath/web smoke
```

## 90s demo script

1. Connect (MetaMask or Privy)
2. Quests → Verify (FV)
3. Claim → Tip → Support (G$ tx preferred)
4. Done tab → Path Receipt
5. Deploy → Save (stake) or Stream (G$/mo)
6. Home → league + Celoscan proof line

## Docs

- [`PATH_A_B_CLOSEOUT.md`](PATH_A_B_CLOSEOUT.md) — what’s done vs what you must run on mainnet  
- [`../DEPLOY.md`](../DEPLOY.md) · [`E2E_PRODUCTION.md`](E2E_PRODUCTION.md) · [`AGENT_HANDOFF.md`](AGENT_HANDOFF.md)
