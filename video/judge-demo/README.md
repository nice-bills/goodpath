# GoodPath judge reel (HyperFrames, local only)

65-second MP4 for hackathon judges. No production Convex or Vercel required to **render** this file.

## Quick start

```bash
# Optional: hot app data for live demo after the video
pnpm dev:judge          # terminal 1
pnpm demo:judge-seed    # terminal 2

# Preview the composition (browser)
cd video/judge-demo && npm run dev

# Lint + render MP4 (needs FFmpeg)
cd video/judge-demo && npm run check && npm run render
```

Output: `video/judge-demo/renders/judge-demo_<timestamp>.mp4` (gitignored; re-render anytime).

## Docs in this folder

| File | Purpose |
|------|---------|
| `DESIGN.md` | Brand tokens from live UI |
| `frame.md` | 16:9 video constraints (HyperFrames) |
| `SCRIPT.md` | Narration / on-screen copy |
| `STORYBOARD.md` | Beat timing and motion |
| `index.html` | Composition source |

## Pipeline

1. Paste `DESIGN.md` into [hyperframes.dev/design](https://www.hyperframes.dev/design) to regenerate `frame.md` when brand shifts.
2. Edit `index.html` + GSAP timeline for visuals.
3. `npm run render` locally.

## Requirements

- Node.js 22+
- FFmpeg (`ffmpeg -version`)
