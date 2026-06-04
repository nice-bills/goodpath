# Design — G$ Path

**Product voice: scrapbook passport** — ruled notebook paper, thick ink borders, offset shadows, tilted color stickers with tape, dashed path hub. Not flat minimal SaaS.

Hallmark skill files may exist under `.agents/skills/hallmark/`; do **not** apply modern-minimal overrides to this app unless explicitly requested.

## Macrostructure

- **App shell (home, quests, celebrate):** Workbench — side rail + passport work surface + upcoming quest stickers
- **Pre-connect:** Split studio — copy column + full `passport-hero` with 5 locked stamps

## Theme (warm scrapbook)

| Token | Value | Use |
|-------|--------|-----|
| Paper | `#fffaf0` | Passport interior, cards |
| Ink | `#35210d` | Borders, primary CTA, progress pill |
| Rule | `#ead9ad` | Notebook lines, soft borders |
| Accent | `#00a979` | GoodDollar green, done states |
| Sticker fills | `#caf6dd`, `#ffd1e2`, `#ffe66d`, `#dbeafe` | Stamp rotation + tape `::before` |

## Typography

- **Display:** Instrument Serif — passport titles, league rank, footer headlines
- **Body:** Plus Jakarta Sans — UI, labels
- **Mono:** IBM Plex Mono — stats, receipt counts

## Passport components

- **Outer:** `.passport-hero` — 3px border, 30px radius, offset shadow
- **Inner:** `.passport-paper` — dashed border, horizontal rules
- **Stickers:** `.passport-grid` + `.passport-stamp-{1-5}` — tilt, color, tape
- **Progress:** `.passport-progress` brown pill with % complete
- **Quests:** `.quest-sticker` — same sticker language on quest grid

## Motion

- Easing: `cubic-bezier(0.32, 0.72, 0, 1)` (`--ease-out`)
- Page enter: light fade + y on passport hero only

## Do not

- Flat `#f7f6f3` canvas-only cards with 1px `#e3e2de` borders
- Replace sticker grid with progress rails or dot tracks
- Hide the home page title on desktop for “cleanliness”
- Set `min-height` on `.passport-paper` in dashboard aside (records card)
