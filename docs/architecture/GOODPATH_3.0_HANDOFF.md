# GoodPath 3.0 — Architecture handoff

## Product shape

Balanced **league wrapper** + **deep G$ finance** on **Celo only**. Tab shell stays on `/` with `?tab=` — no new top-level tab routes.

## Layers

```
apps/web          → useWalletSession(), quest actions, Run* cards
services/api/
  app.ts          → HTTP routes
  domain/         → league scoring, profile payload, proof types, seeded cohorts
  repository/     → interfaces + sqlite/* implementations
  db/             → connection, numbered migrations
  verify/         → on-chain proof validation
  chain/          → g-moved indexer, optional receipt relayer
packages/shared/  → quests, league points multipliers, seeded cohort constants
packages/contracts/ → GoodPathReceipt UUPS (optional mainnet)
```

## Repository interfaces

| Interface | Responsibility |
|-----------|----------------|
| `ProfileRepository` | profiles, quest completions, streaks, impact stats |
| `ReferralRepository` | referrer links, weekly referral bonuses |
| `LeagueRepository` | seasons, division entries, proof_events |
| `ReceiptRepository` | receipt_events, share_invites |
| `SocialRepository` | rival_links, squad_memberships (stub) |

## Storage

- Default: **SQLite** (`DATABASE_PROVIDER=sqlite` or unset).
- Future: `DATABASE_PROVIDER=postgres` (throws until adapter ships).
- Migrations: `services/api/src/db/migrations.ts` (ids 1–3).

### Tables (3.0)

`profiles`, `quest_completions`, `seasons`, `season_scores`, `division_entries`, `rival_links`, `squad_memberships`, `receipt_events`, `proof_events`, `share_invites`

## League demo (one user)

- Seeded **division cohort** (`SEEDED_DIVISION_COHORT` in `@goodpath/shared`).
- Seeded **rival** per user (`rival_links.is_seeded = 1`).
- Labels always say **Benchmark ·** — never impersonate live users.

## G$ scoring

`leaguePointsForQuest()` in `packages/shared/src/league-points.ts`:

- Support on-chain tx: +4 vs visit ack
- Deploy stream: +6 over base deploy
- Referral path complete: +15 / friend / week

## API additions (3.0)

| Method | Path |
|--------|------|
| GET | `/api/profile/:address/receipt` |
| POST | `/api/profile/:address/share-invite` |
| GET/POST | `/api/profile/:address/rival` |
| GET | `/api/profile/:address/squads` |
| POST | `/api/profile/:address/squads/join` (stub) |

## Contract (optional)

`packages/contracts/src/GoodPathReceipt.sol` — events: `QuestRecorded`, `ReferralRecorded`, `RivalSet`, `SquadJoined`, `SeasonScoreRecorded`, `ReceiptIssued`.

Env:

- `GOODPATH_RECEIPT_ADDRESS`
- `GOODPATH_RELAYER_PRIVATE_KEY`
- `CELO_RPC_URL`

## Vercel / production

| Var | Notes |
|-----|-------|
| `GOODPATH_DATA_DIR` | Use `/tmp/goodpath-data` on Vercel (ephemeral) |
| `DATABASE_PROVIDER` | `sqlite` |
| `CORS_ORIGINS` | Include `https://goodpath-app.vercel.app` |
| `TIP_RECIPIENT`, `SUPPORT_RECIPIENT` | Pool addresses for verify |

API mounted at **`/goodpath-api`** on the web project.

## Commands

```bash
pnpm build
pnpm contracts:test
node scripts/demo-seed.mjs
```

See `scripts/judge-demo.md` for the live demo flow.
