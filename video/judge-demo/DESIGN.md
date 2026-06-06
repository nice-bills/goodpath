# GoodPath — DESIGN.md (video)

Editorial utilitarian scoreboard. Warm canvas, ink borders, green accent. Built from live app tokens (`../../design.md`).

## Overview

16:9 judge reel sells **live board energy**: Explore without wallet, benchmark rivals, claim countdown, G$ quest path, flex receipt. Layout alternates **full-frame type** and **phone mock** showing Explore → Run → Flex. No web chrome (browser tabs, OS UI).

## Colors

| Role | HEX | Usage |
|------|-----|--------|
| canvas | `#f7f6f3` | Full-frame background |
| surface | `#ffffff` | Cards, phone screen |
| ink | `#111111` | Headlines, primary CTA fill |
| rule | `#e3e2de` | Card borders |
| accent | `#007a55` | Logo shell, active tab, points |
| accent-soft | `#e6f4ef` | Highlight rows, badges |
| accent-text | `#005c41` | Green numerals |
| muted | `#5c5c58` | Subcopy |
| pop | `#f2c94c` | Urgency / return pulse |
| pop-ink | `#3d3200` | Text on pop |

## Typography

| Role | Family | Weight | Size (1080p) |
|------|--------|--------|----------------|
| hero | Instrument Serif | 400 | 96–120px |
| section | Instrument Serif | 400 | 56–72px |
| body | Plus Jakarta Sans | 600–700 | 28–36px |
| label | Plus Jakarta Sans | 800 | 20–24px, uppercase tracking |
| mono | IBM Plex Mono | 700 | 24–32px tabular |

## Components

- **Logo:** green rounded square + trail blaze (`#007a55` / `#f7f6f3`)
- **Phone mock:** 390×844 logical, 24px outer radius, 3px ink border, shadow `4px 4px 0 rgba(17,17,17,0.12)`
- **Leader row:** rank | name + division | points (green mono)
- **Live card:** avatar initials, handle, verb, relative time
- **Countdown strip:** clock + `Next claim window in Xh Ym`
- **Bench tag:** 8px uppercase pill, muted fill

## Imagery

- No stock photos. UI is the hero.
- Optional subtle film grain overlay at 4% opacity on hooks only.

## Do

- Show **Echo · Flux · Aria** as benchmark names with **Bench** tag
- Keep copy short; one idea per beat
- Let numbers breathe (130 pts, 18h 20m)

## Don't

- Dark mode
- Gradients on logo or CTAs
- Fake “10k users online”
- Em dashes
- Passport scrapbook stickers
