# Build Context — G$ Path

| Field | Value |
|-------|-------|
| MVP complete | Yes |
| API build | Pass |
| Web build | Pass |
| Chain | Celo + GoodSDKs |
| Quality pass | Thermo-nuclear fixes applied (2026-05-25) |

## Architecture

- `packages/shared` — quests, prerequisites, progress, zod schemas
- `services/api` — Hono, SQLite (transactions), viem on-chain verification
- `apps/web` — Next.js, QuestKind dispatcher, wagmi injected

## Run

```bash
pnpm install
pnpm --filter @goodpath/api dev
pnpm --filter @goodpath/web dev
```

## Env (API)

- `CORS_ORIGINS` — comma-separated web origins
- `GOODDOLLAR_ENV` — development | staging | production
- `TIP_RECIPIENT` — tip quest recipient
- `CELO_RPC_URL` — optional RPC override

## Env (Web)

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_GOODDOLLAR_ENV`
- `NEXT_PUBLIC_TIP_RECIPIENT` — must not be zero address for demo
