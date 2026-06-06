# GoodPath docs

Start here. Most `.md` files in the repo are **agent skills** (`.agents/skills/`) or **vendored libs** — not these.

## Read these

| Doc | When |
|-----|------|
| [`../README.md`](../README.md) | Install, `pnpm dev`, env vars |
| [`../design.md`](../design.md) | Brand, colors, logo, UI rules |
| [`LOCAL_DEV.md`](LOCAL_DEV.md) | Convex, local backend, judge seed |
| [`../scripts/judge-demo.md`](../scripts/judge-demo.md) | Live demo script for judges |
| [`../video/judge-demo/README.md`](../video/judge-demo/README.md) | Local MP4 render (HyperFrames) |

## Deploy (when you're ready)

| Doc | When |
|-----|------|
| [`DEPLOY.md`](DEPLOY.md) | General deploy |
| [`VERCEL_DEPLOY.md`](VERCEL_DEPLOY.md) | Vercel-specific |
| [`VERCEL_PRODUCTION_CHECKLIST.md`](VERCEL_PRODUCTION_CHECKLIST.md) | Pre-flight checklist |
| [`architecture/CONVEX_MIGRATION.md`](architecture/CONVEX_MIGRATION.md) | Convex vs legacy API |

## Archive

Hackathon handoffs and older specs — useful for context, not day-to-day:

- [`archive/`](archive/) — submission, 2.0 spec, agent handoffs, E2E templates

## HTML artifacts

Open in browser (plans, roadmaps):

- [`artifacts/production-and-path-b.html`](artifacts/production-and-path-b.html)
- [`artifacts/goodbuilders-winning-direction.html`](artifacts/goodbuilders-winning-direction.html)
- [`artifacts/g-path-deep-strategy.html`](artifacts/g-path-deep-strategy.html)

## Ignore unless tuning AI

- `.agents/skills/` — Cursor agent design/dev skills (~100+ markdown files)
- `video/judge-demo/AGENTS.md` — HyperFrames agent hints
- `packages/contracts/lib/**` — OpenZeppelin / Forge upstream READMEs
