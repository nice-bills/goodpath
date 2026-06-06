# GoodPath 3.0 — Judge demo (delulu mode)

**Goal:** Board feels alive before anyone connects. Benchmarks are labeled **Bench**, not fake humans.

## One-time setup (30 sec)

```bash
# Terminal 1 — judge landing opens Explore by default
pnpm dev:judge

# Terminal 2 — populate board, live moves, flexes, public runs
pnpm demo:judge-seed
```

Open **http://localhost:3000** (lands on Explore).

Production: share `https://your-app.vercel.app/?tab=explore` after running `pnpm demo:judge-seed` against that Convex deployment.

## Act 0 — Explore without wallet (60 sec)

1. **Claim countdown** at top (`Next claim window in …`).
2. **Live moves** — horizontal feed: Echo, Flux, Aria claiming/tipping/deploying (Bench tags).
3. **Recent flexes** — path crushes + on-chain moves.
4. **Public runs** — weekly goals from benchmarks.
5. **Division leaderboard** — 21 rows, Echo #1 at 130 pts.

Talking point: *"Real wallets only in production; benchmarks keep the board hot for week one."*

## Act 1 — Connect & join the fight (3 min)

1. **Run** tab → Connect (Privy email/Google or MetaMask).
2. Home shows your rank vs **Echo** (seeded rival).
3. Complete **Claim** — you appear on live feed + leaderboard.
4. Optional return-pulse: leave tab, run seed again (benchmarks move), reload → *"You got passed"* banner.

## Act 2 — Deep G$ utility (8 min)

| Step | Action | Proof |
|------|--------|-------|
| Verify | Face verification | On-chain whitelist |
| Claim | Daily UBI | Claim tx |
| Tip | G$ to jar | Transfer tx |
| Support | G$ to GoodCollective pool | Transfer (+4 league bonus) |
| Deploy | Save or Stream | +12 or +18 league pts |

## Act 3 — Flex (2 min)

1. **Flex** tab — Path Receipt with proof mix + league summary.
2. **Explore** — your wallet on board next to benchmarks.

## Reset / refresh demo heat

```bash
pnpm demo:judge-seed
```

Idempotent — clears prior judge benchmark moves and re-seeds.

## Judge video (local MP4, no prod)

```bash
cd video/judge-demo && npm run dev      # preview in browser
cd video/judge-demo && npm run render   # 65s MP4 (needs FFmpeg)
```

Docs: `video/judge-demo/README.md`, `SCRIPT.md`, `STORYBOARD.md`.

From repo root: `pnpm video:judge:preview` · `pnpm video:judge:render`

## Env flags

| Flag | Effect |
|------|--------|
| `NEXT_PUBLIC_JUDGE_DEMO=1` | Default tab = Explore (`pnpm dev:judge`) |
| `NEXT_PUBLIC_DEMO_MODE=1` | Static profile for receipt screenshots only |
