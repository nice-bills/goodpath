# GoodPath — frame.md

Video translation of `DESIGN.md` for HyperFrames 1920×1080 @ 30fps.

## Frame

- **Canvas:** 1920×1080, 30fps, duration **65s**
- **Safe title:** 120px top, 100px bottom, 96px sides
- **Phone mock zone:** right 42% of frame, vertically centered
- **Copy zone:** left 52%, left-aligned

## Scale (invert web → camera)

| Web | Frame |
|-----|--------|
| 14px body | 32px min on screen |
| 1.75rem hero | 96px+ |
| 8px bench tag | 18px pill |
| 12px radius | 20–24px on cards |

## Beat timing

| Beat | Start | Dwell | Content |
|------|-------|-------|---------|
| hook | 0s | 10s | Logo + “The run is heating up” |
| explore | 10s | 16s | Phone: Explore + leaderboard |
| live | 26s | 12s | Live moves cards + stats |
| path | 38s | 14s | Quest path + on-chain proof |
| cta | 52s | 13s | Flex + Celo + URL |

Transitions: 0.6s crossfade between beats. No whip pans.

## Motion

- Easing: `power2.out` (GSAP) ≈ `cubic-bezier(0.32, 0.72, 0, 1)`
- List stagger: 0.08s
- Countdown digits: tabular mono, no slot-machine roll
- Leaderboard: rows slide up 24px + fade, max 5 visible rows animating

## Audio

- Silent render (no VO in v1). Leave headroom for later narration track.

## Render

```bash
cd video/judge-demo && npm run check && npm run render
```

Local only. No Lambda / production Convex required for this MP4.
