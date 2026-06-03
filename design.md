# Design — G$ Path

Locked design system for this app. Hallmark-managed; pages read this before visual changes.

## Genre

modern-minimal (utilitarian fintech onboarding — warm paper, single green accent)

## Macrostructure family

- **App shell (home, quests, celebrate):** Workbench — side rail + primary work surface + full-width utility strip
- **Marketing / pre-connect:** Split studio — copy column + product card column

## Theme (brand-locked — do not rotate)

| Token | Value | Use |
|-------|--------|-----|
| `--color-paper` | `#f7f6f3` | Canvas |
| `--color-paper-2` | `#ffffff` | Cards |
| `--color-ink` | `#111111` | Text, primary CTA |
| `--color-ink-2` | `#62706a` | Muted body |
| `--color-rule` | `#e3e2de` | Borders |
| `--color-accent` | `#007a55` | Progress, active step, success |
| `--color-accent-soft` | `#edf7f2` | Active surfaces |
| `--color-focus` | `#007a55` | Focus rings |

## Typography

- **Display:** Instrument Serif — page titles only (pre-connect hero)
- **Body:** Plus Jakarta Sans — UI, labels, buttons
- **Mono:** IBM Plex Mono — stats, receipt counts, addresses
- Display headings: `font-style: normal` always (no italic display)

## Spacing

4pt scale via `--space-*` in `apps/web/src/app/globals.css`. Use tokens, not raw px in new code.

## Motion

- Easing: `cubic-bezier(0.32, 0.72, 0, 1)` (`--ease-out`)
- Reveals: subtle fade-up only on passport card
- `prefers-reduced-motion`: disable transforms

## Microinteractions

- Hover: border darken + 1px lift max (no scrapbook offset shadows)
- Focus: 2px `--color-focus` outline, offset 2px
- No celebratory toasts beyond existing wallet gate

## CTA voice

- Primary: solid `--color-ink` fill, `--radius-sm` (8px), white/cream text
- Secondary: 1px `--color-rule` border, paper fill
- One primary CTA per viewport region

## Banned

- 3px “scrapbook” frames, tape pseudo-elements, rotated stamp grids on dashboard
- Gradient mesh backgrounds, purple AI slop, Inter as body
- Duplicate product title in nav + page header on desktop app views
