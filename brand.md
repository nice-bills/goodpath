# GoodPath brand

Editorial utilitarian minimalism (minimalist-ui + layers-surface). No gradients.

## Type
- Sans: Plus Jakarta Sans
- Display: Instrument Serif (headlines + wordmark)
- Mono: IBM Plex Mono (numbers)

## Color
- Canvas: `#f7f6f3`
- Ink: `#111111`
- Accent: `#007a55` (solid fills only)
- Borders: `#e3e2de`

## Logo — Trail Mark (D)

Hiking trail blaze: stacked chevrons + dashed vertical stem ending in a dot. Metaphor: weekly run progress. Tagline: **Mark your progress.**

Assets live in `apps/web/public/brand/`:
- `mark.svg` — icon only (green shell + blaze)
- `wordmark.svg` — GoodPath typography
- `lockup.svg` — mark + wordmark horizontal

React: `LogoMark` and `LogoLockup` in `apps/web/src/components/brand/logo-mark.tsx`.

### Clear space
Minimum clear space around the mark equals **½ the mark width** on all sides (use the green shell edge as the bounding box).

### Minimum size
- **Mark only:** 16px (favicon); do not ship below 16px.
- **Lockup:** 120px wide minimum for nav; below that, use mark-only.

### Do
- Use solid fills only — accent `#007a55` shell, blaze strokes `#f7f6f3`.
- Pair mark with italic Instrument Serif wordmark **GoodPath** (not "G$ Path").
- Use `LogoMark` / `LogoLockup` components or `/brand/*.svg` assets.

### Don't
- No letter G, GP ligature, or dollar-sign motifs in the mark.
- No gradients, glows, or drop shadows on the logo.
- Don't recolor the blaze or shell outside brand palette.
- Don't stretch, rotate, or outline the mark.

## Components
- Cards: 1px border, 12px radius, white fill
- Primary CTA: solid `#111111`, 8px radius
- No mesh glows, no gradient buttons, no glass nav
