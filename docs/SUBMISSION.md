# GoodBuilders submission — G$ Path

## One-liner

Gamified onboarding for GoodDollar — verify on-chain, claim UBI, tip in G$, support the community, build a daily streak.

## What we built

- 5-quest path with **server-side proof** (identity read, claim/tip tx verification)
- Quest **ordering** enforced (verify → claim → tip → support)
- **SQLite transactions** for streak + completion integrity
- Mobile-first UI with `QuestKind` dispatcher (single action component per quest type)
- Env-based **CORS** for deploy

## Integration depth

| Quest | Proof |
|-------|--------|
| Connect | Auto on first profile load (server) |
| Verify | `getWhitelistedRoot` on Celo |
| Claim | UBI `UBIClaimed` event or tx to UBI contract |
| Tip | G$ `Transfer` to configured recipient |
| Support | Explicit ack after opening GoodCollective |

## Run before demo

```bash
pnpm install
pnpm --filter @goodpath/api dev
pnpm --filter @goodpath/web dev
```

Set `TIP_RECIPIENT` / `NEXT_PUBLIC_TIP_RECIPIENT` to a real wallet (not `0x00…01`).

## 90s demo script

1. Connect on Celo → path shows connect complete  
2. Quests → Verify → complete FV → refresh → server confirms whitelist  
3. Claim G$ → show tx on Celoscan  
4. Tip 0.01 G$ → server verifies transfer  
5. Open GoodCollective → “I visited — complete quest”  
6. Celebrate — 100% path + streak  
