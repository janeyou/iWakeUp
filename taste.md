# AI Radar — Taste

> The design system and editorial voice for `radar.pmclaws.com`. Last updated 2026-05-04.

This file is the canonical source of truth for "what AI Radar looks and feels like." If you're touching UI, read this first. If you're adding a component, make sure it speaks this language.

## One-line voice

> **Dark, type-led, terse.** A focused after-hours feed for AI shipments, not a SaaS console.

A reader should feel like they opened a calm dashboard at night, not a marketing site. The palette is a deep cool-blue near-black with restrained purple as the single accent. Type does the heavy lifting: a bold sans display face for moments of weight, mono for time and metadata, sans for body. Color is reserved for *agent identity* and the lead accent.

## North-star moments

1. **Masthead.** A confident headline ("i wake up, there is another *AI update*."), an ISSUE / DATE / LIVE-INGEST line, and a three-stat strip (tools tracked, drops 24h, current streak). Near-black with a single pulsing purple dot. Italic accent phrase on the punchline.
2. **Lead drop.** One dominant card with the day's most important shipment: agent in brand color, a real headline at display weight, summary, and a compact embedded tweet when the source is X. Three secondary drops sit beside it as a vertical stack.
3. **Activity heatmap.** A 26-week × 7-day grid that reads as a single graphic, not a tiny widget. Streak + busiest-day callouts on the right.

## Default mode

**The site ships in dark.** `app/layout.tsx` sets `className="dark"` on `<html>`. There is no light-mode marketing page, no auto-switch on first paint. A theme toggle in the nav lets readers flip to light, but dark is the canonical look and the one used in screenshots, social cards, and design reviews.

## Tokens

All tokens live in `app/globals.css` and surface as Tailwind v4 `--color-*` via `@theme`. Dark is the default; `html:not(.dark)` is the light override.

### Surfaces

| Token | Dark (default) | Light (alt) |
|---|---|---|
| `--bg` | `oklch(0.13 0.01 250)` | `rgb(251, 251, 251)` |
| `--surface` | `oklch(0.17 0.01 250)` | `#ffffff` |
| `--surface-2` | `oklch(0.20 0.01 250)` | `#f7f7f6` |
| `--surface-hover` | `oklch(0.23 0.01 250)` | `#f0efed` |
| `--border` | `oklch(0.26 0.01 250)` | `#e7e5e1` |
| `--border-strong` | `oklch(0.35 0.01 250)` | `#d0cdc6` |
| `--text` | `oklch(0.97 0 0)` | `#1a1a1a` |
| `--text-muted` | `oklch(0.70 0.01 250)` | `#6b6b6b` |
| `--text-faint` | `oklch(0.50 0.01 250)` | `#9a9a98` |

The dark palette is intentionally **cool-blue near-black** with saturations under 0.02 — not pure black. The light alt is warm-neutral off-white. Do not introduce another grey scale.

### Accent

- `--accent` dark: `oklch(0.74 0.18 290)` (purple, locked).
- `--accent` light: `oklch(0.55 0.18 290)`.
- `--accent-soft`: 15% alpha of accent (dark), 10% (light).

The accent ONLY appears on:
- The pulsing dot beside the wordmark
- "Live" / kicker labels
- Active filter outlines + `is-active` cell rings
- Subscribe button hover, primary CTA chrome
- Lead drop CTA arrow
- The italic phrase in the masthead headline (e.g. *AI update*)

If you find yourself wrapping body copy in accent, stop.

The exploration palette of coral / teal / lime exists in the prototype Tweaks panel only. **Production locks accent to purple.** Do not ship coral as a "limited-edition" theme without taste-doc revision.

### Entry-type colors

For per-agent surfaces only (single heatmap, TypeBadge in TimelineEntry):

- `--release` purple `oklch(0.72 0.18 290)` (dark) / `oklch(0.55 0.18 290)` (light)
- `--news` amber `oklch(0.78 0.13 70)` / `oklch(0.55 0.13 70)`
- `--post` cyan `oklch(0.72 0.14 220)` / `oklch(0.55 0.14 220)`

Each has a `-soft` alpha variant for badge backgrounds.

### Agent brand colors

For cross-agent surfaces only (Lead drop tint, drop rows, timeline tile glow, global heatmap, agent chips):

- `--agent-claude` Anthropic coral, `oklch(0.78 0.11 45)` (dark) / `oklch(0.62 0.11 45)` (light)
- `--agent-cursor` paper white, `oklch(0.85 0.01 250)` (dark) / `oklch(0.30 0.01 250)` (light)
- `--agent-codex` OpenAI green, `oklch(0.72 0.13 165)` (dark) / `oklch(0.55 0.13 165)` (light)

When adding a new tracked agent, define `--agent-<slug>` and `--agent-<slug>-soft` (15% dark / 12% light alpha) in both `:root` and the light scope. There is no auto-generation.

### Type vs agent — when to use which

| Surface | Color family |
|---|---|
| Per-agent heatmap, TypeBadge inside TimelineEntry | type colors |
| TodayPanel Lead, drop rows, AgentChips dot, global heatmap, timeline tile, agent profile hero | agent colors |
| Filter chips, kickers, "live" pills | accent only (purple) |

### Fonts

- `--font-display` `"Space Grotesk", "Inter Display", ui-sans-serif, system-ui, sans-serif` — used at large sizes for masthead, day numerals, lead title, foot punchline. **Bold (700) by default.** When the headline includes an italic accent phrase (e.g. *AI update*), use `font-style: italic` on that span only — it bends Space Grotesk into a softer, hand-set feel against the bold upright. The italic accent is the only italic in the system.
- `--font-sans` `Inter` — body, UI labels, form controls.
- `--font-mono` `JetBrains Mono` — every uppercase tracking-wider label, all dates and times, all kickers, agent labels in TodayPanel.

The 3-font stack is non-negotiable. **Display is bold sans, not serif** — the editorial direction comes from rhythm, restraint, and italic accents, not from a serif typeface. Do not introduce a fourth typeface, do not swap the display family back to a serif without taste-doc revision.

Display weight rules:
- Masthead headline: 700, tracking `-0.025em`, line-height 0.98
- Section titles ("Today's AI Drop", "Timelines"): 700, tracking `-0.02em`
- Lead drop title: 600, tracking `-0.015em`
- Day numerals (in day group): 700, tracking `-0.02em`
- Footer punchline: 700, tracking `-0.025em`

### Radii + spacing

- `--r-sm` 6px (tags, swatches), `--r-md` 10px (drop rows, entries), `--r-lg` 16px (cards, heatmap), `--r-xl` 22px (hero modules, if any).
- Section padding: 56px vertical default; 36px when `data-density="compact"`.
- Card padding: 24px (`--pad-card`); 22px on tiles for visual rhythm.

## Components — visual contract

### Top nav

Sticky, semi-transparent backdrop-blur, 56px tall. Wordmark on the left in **bold sans** (700, tracking `-0.02em`). The "AI" portion is the accent purple, "RADAR" is `--text`. A pulsing accent dot sits to the right of the wordmark. Mono nav links. Theme toggle and a subscribe icon-button on the right. Active link gets `--surface-2` pill.

The mono-ticker and italic-serif wordmark variants exist in the Tweaks panel only — production locks to bold sans.

### Masthead (home)

```
ISSUE / TODAY / LIVE INGEST
i wake up,
there is another *AI update*.
[ tagline ]                       [ tools ] [ drops 24h ] [ streak ]
```

- Headline: bold sans display, italic accent on the punchline phrase.
- Sub-row: tagline left (sans, muted, 18–20px), 3-stat strip right (mono labels, display numerals).

### Lead drop

A two-column band: a single Lead card on the left (1.6fr), a vertical stack of 3 secondary drop rows + a "See all drops" CTA on the right (1fr). The Lead pulls a soft radial tint of the agent's brand color from the top edge.

```
[ AGENT NAME ] [ release/news/post ]            [ relative time ]
*Display-bold title that runs 1–2 lines*
muted summary line, max 56ch
[ optional embedded tweet card — compact, max-width 420px ]
                                               read source →
```

The embedded tweet is a **compact** card: `max-width: 420px`, `padding: 10px 12px`, body 13px clamped to 3 lines, 26px avatar. It sits *below* the summary and never dominates the lead.

### Drop row

Compact: agent dot · title (clamp-2) · agent · type · time PT. Hover lifts to `--surface-hover` and tightens the border.

### Timeline tile (home grid)

3-up grid (2-up under 1000px, 1-up under 640px). Each tile:
- Display-bold agent name + LIVE pill in agent color
- Blurb (sans, muted)
- 30-day mini sparkline using agent color, 4 intensities
- Latest entry title (clamp-2)
- Foot row: drops/7d count + "View profile →"

A radial agent-tinted glow bleeds in from the top-right corner. Subtle, not a gradient party.

### Coming-soon strip

Dashed-border container directly under the tiles grid. Each queued tool is a chip with `queued` mono micro-label. Greyscale, low chroma. Reminds visitors there is more coming without making it feel sparse.

### Activity heatmap

26 weeks × 7 days. Cell size 13px by default (range 10–20, exposed via Tweaks for layout work). Wrapped in a card. Two callouts to the right of the title:
- **Current streak** — `<n>` days
- **Busiest day** — `<count>` on `<Mon DD>`

A custom DOM tooltip, not the native title attribute, follows the cell. Click → filter the feed to that date. Active date gets an accent ring on the cell.

Mode `single` (per-agent profile) uses entry-type colors and a less / 5-step / more legend.
Mode `global` (`/drops`) uses agent colors with the dominant-agent-per-day strategy and an agent legend underneath.

### Day group (`/drops`)

Each day is a `<details>` block. Today is open. Summary grid is 130px / 1fr / auto:

```
Sun                12 updates
May 03            • Claude • Cursor • Codex            ▾
```

- Weekday in mono micro-cap, date as display numeral + month (bold sans, 700).
- Body inset to 154px (matching the date column width) for a typographic ledger look.

### Entry (in day group)

3px agent-colored rail + 1fr body + time PT. TypeBadge first, then optional agent label, then source-type label. Title is sans 15px, hover → accent. Summary muted.

### Stay-in-the-loop band

Two columns inside a soft `--surface-2` band with top + bottom hairlines.
- Left: kicker → display headline → muted intro → SubscribeForm.
- Right: kicker → display headline → muted intro → SuggestForm.

Forms use 8px radius inputs, accent focus ring, high-contrast primary buttons (`--text` background, `--bg` text — not accent). Success states return an inline accent-soft band with a "Subscribe another →" / "Suggest another →" reset link.

### Footer

Echoes the masthead with a smaller display-bold punchline ("i wake up, there is *another one*."), then a hairline + mono credit row + nav links. Credit copy:

> Built by Jane You (with Claude Code & Design) · maintained by RaeyaBot · daily ingest 5am PT

## Density and rhythm

- Default density is `cozy`. `compact` shrinks section padding 56→36px.
- Vertical rhythm relies on consistent 24px / 56px stops — avoid magic numbers.
- Tiles have `transform: translateY(-1px)` on hover. Drop rows do not. Use motion *only* on top-level click targets.

## Motion

- The accent dot pulses at 2.4s ease-out, infinite. Same animation on the LIVE pills.
- Heatmap cell hover: 1.4× scale, 1.5px outline, 80ms.
- Day group chevron rotates 180° on open, 200ms.
- No page transitions, no fade-ins, no scroll-tied reveals. The reader is here for content, not a show.

## What we do NOT do

- No emoji as decoration.
- No em-dashes anywhere — copy, error messages, code comments. Use comma, period, colon, parens, or split sentences.
- No gradients on backgrounds. The single radial glow on lead/tiles is *agent-tinted*, low alpha, and ambient — not decorative.
- No icon-only navigation. Mono labels everywhere; icons are reserved for theme toggle and subscribe.
- No skeuomorphic shadow stacks. Only borders + subtle hover state changes.
- No marketing copy. Every line should sound like a librarian, not a launch page.
- No third font.
- No accent color on body copy. Accent is for moments, not paragraphs.
- No serif display. The bold sans is the voice; italic accents inside it carry the editorial weight.
- No light-mode-first marketing. Production renders dark by default.

## Locked production defaults

The static prototype exposes knobs through an in-page Tweaks panel for design exploration. **Production locks to:**

| Knob | Value |
|---|---|
| `theme` | `dark` (toggle still works for readers) |
| `accent` | `purple` |
| `displayFont` | `bold-sans` (Space Grotesk 700) |
| `wordmarkStyle` | `bold-sans` |
| `density` | `cozy` |
| `heatmapCell` | `13px` |

## When in doubt

Ask: "Would a small newspaper editor approve of this, in a quiet, late-night room?" If the answer is no, redesign.
