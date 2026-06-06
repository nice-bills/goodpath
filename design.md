# GoodPath — design

Single source for brand + live UI. Code tokens: `apps/web/src/app/globals.css`.  
Video / judge reel: `video/judge-demo/DESIGN.md` + `frame.md`.

Editorial utilitarian minimalism. Scoreboard energy on a warm canvas. No gradients on logo or primary CTAs.

## Voice

Real league data, benchmark rivals labeled **Bench**. Not scrapbook passport, not corporate SaaS.

## Color

| Token | Value | Use |
|-------|--------|-----|
| Canvas | `#f7f6f3` | Page background |
| Surface | `#ffffff` | Cards, nav |
| Ink | `#111111` | Borders, primary CTA |
| Rule | `#e3e2de` | Soft borders |
| Accent | `#007a55` | GoodDollar green, logo shell, active nav |
| Accent soft | `#e6f4ef` | Highlights, your row |
| Accent text | `#005c41` | Green numerals |
| Muted | `#5c5c58` | Secondary copy |
| Pop | `#f2c94c` | Urgency stickers, return pulse |
| Pop ink | `#3d3200` | Text on pop |

Solid fills only for brand accent. No mesh glows, no gradient buttons.

## Typography

| Role | Family | Use |
|------|--------|-----|
| Display | Instrument Serif | Headlines, wordmark, rank drama |
| Body | Plus Jakarta Sans | UI, labels, buttons |
| Mono | IBM Plex Mono | Stats, countdown, handles (tabular) |

Pair display with body; use mono for numbers and handles.

## Logo — Trail Mark

Hiking trail blaze: stacked chevrons + dashed vertical stem ending in a dot. Metaphor: weekly run progress. Tagline: **Mark your progress.**

**Assets:** `apps/web/public/brand/`
- `mark.svg` — icon only (green shell + blaze)
- `wordmark.svg` — GoodPath typography
- `lockup.svg` — mark + wordmark horizontal

**React:** `LogoMark` and `LogoLockup` in `apps/web/src/components/brand/logo-mark.tsx`.

### Clear space

Minimum clear space around the mark equals **½ the mark width** on all sides (green shell edge = bounding box).

### Minimum size

- **Mark only:** 16px (favicon); do not ship below 16px.
- **Lockup:** 120px wide minimum for nav; below that, use mark-only.

### Logo do

- Solid fills — accent `#007a55` shell, blaze strokes `#f7f6f3`.
- Italic Instrument Serif wordmark **GoodPath** (not "G$ Path").
- Use `LogoMark` / `LogoLockup` or `/brand/*.svg`.

### Logo don't

- No letter G, GP ligature, or dollar-sign motifs.
- No gradients, glows, or drop shadows on the logo.
- Don't recolor blaze or shell outside this palette.
- Don't stretch, rotate, or outline the mark.

## Components

**Base (brand)**
- Cards: 1px border, 12px radius, white fill
- Primary CTA: solid `#111111`, 8px radius
- No glass nav

**App (vibe / explore)**
- Cards: 1.5px ink border, 12–16px radius, light offset shadow on hero CTAs
- Bottom nav: 5 tabs — Run, Explore, Claim, Path, Flex
- Explore: live moves, flex rail, public runs, division leaderboard (scrollable)
- Push loops: claim countdown strip, return-pulse banner (pop yellow)

## Motion

- Easing: `cubic-bezier(0.32, 0.72, 0, 1)` (`--ease-out` in CSS)
- Stagger lists 80–120ms; no bounce spam

## Do not

- Fake human names in feeds (benchmarks OK with **Bench** tag)
- Em dashes in product copy
- Gradients on logo or primary buttons
- Scrapbook passport stickers unless explicitly reverted
