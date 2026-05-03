# AI Radar — Taste

> The design system and editorial voice for `radar.pmclaws.com`. Last updated 2026-05-03.

This file is the canonical source of truth for "what AI Radar looks and feels like." If you're touching UI, read this first. If you're adding a component, make sure it speaks this language.

## One-line voice

> **Editorial, not a dashboard.** Type-led, terse, restrained. A daily paper for AI shipments, not a product surface.

A reader should feel like they opened a small, focused newspaper, not a SaaS console. Use display serif for moments of weight; mono for time, dates, and meta; sans for body. Use color sparingly — only for *agent identity* and the lead accent.

## North-star moments

1. **Masthead.** A confident headline ("i wake up, there is another *AI update*."), an ISSUE / DATE / LIVE-INGEST line, and a three-stat strip (tools tracked, drops 24h, current streak). Black-and-white with a single pulsing accent dot.
2. **Lead drop.** One dominant card with the day's most important shipment: agent in brand color, a real headline at display weight, summary, and an embedded tweet when the source is X. Three secondary drops sit beside it as a vertical stack.
3. **Activity heatmap.** A 26-week × 7-day grid that reads as a single graphic, not as a tiny widget. Streak + busiest-day callouts on the right.

## Tokens

All tokens live in `app/globals.css` and surface as Tailwind v4 `--color-*` via `@theme`. Light is default; `html.dark` flips. Theme persists via `next-themes`.

### Surfaces

| Token | Light | Dark |
|---|---|---|
| `--bg` | `rgb(251, 251, 251)` | `oklch(0.13 0.01 250)` |
| `--surface` | `#ffffff` | `oklch(0.17 0.01 250)` |
| `--surface-2` | `#f7f7f6` | `oklch(0.20 0.01 250)` |
| `--surface-hover` | `#f0efed` | `oklch(0.23 0.01 250)` |
| `--border` | `#e7e5e1` | `oklch(0.26 0.01 250)` |
| `--border-strong` | `#d0cdc6` | `oklch(0.35 0.01 250)` |
| `--text` | `#1a1a1a` | `oklch(0.97 0 0)` |
| `--text-muted` | `#6b6b6b` | `oklch(0.70 0.01 250)` |
| `--text-faint` | `#9a9a98` | `oklch(0.50 0.01 250)` |

The light surface is intentionally **warm-neutral** (slightly toward off-white paper) and the dark is cool-blue, but both keep saturations under 0.02 on whites. Do not introduce another grey scale.

### Accent

- `--accent` light: `oklch(0.55 0.18 290)` (purple).
- `--accent` dark: `oklch(0.74 0.18 290)`.
- `--accent-soft`: 10–15% alpha of accent.

The accent ONLY appears on:
- The pulsing dot beside the wordmark
- "Live" / kicker labels
- Active filter outlines + `is-active` cell rings
- Subscribe button hover, primary CTA chrome
- Lead drop CTA arrow
- The italic phrase in the masthead headline (e.g. *AI update*)

If you find yourself wrapping body copy in accent, stop.

### Entry-type colors

For per-agent surfaces only (single heatmap, TypeBadge in TimelineEntry):

- `--release` purple `oklch(0.55 0.18 290)` / dark `oklch(0.72 0.18 290)`
- `--news` amber `oklch(0.55 0.13 70)` / dark `oklch(0.78 0.13 70)`
- `--post` cyan `oklch(0.55 0.14 220)` / dark `oklch(0.72 0.14 220)`

Each has a `-soft` alpha variant for badge backgrounds.

### Agent brand colors

For cross-agent surfaces only (Lead drop tint, drop rows, timeline tile glow, global heatmap, agent chips):

- `--agent-claude` Anthropic coral, `oklch(0.62 0.11 45)` / dark `oklch(0.78 0.11 45)`
- `--agent-cursor` charcoal, `oklch(0.30 0.01 250)` / dark `oklch(0.85 0.01 250)`
- `--agent-codex` OpenAI green, `oklch(0.55 0.13 165)` / dark `oklch(0.72 0.13 165)`

When adding a new tracked agent, define `--agent-<slug>` and `--agent-<slug>-soft` (12% light / 15% dark alpha) in both `:root` and `html.dark`. There is no auto-generation.

### Type vs agent — when to use which

| Surface | Color family |
|---|---|
| Per-agent heatmap, TypeBadge inside TimelineEntry | type colors |
| TodayPanel Lead, drop rows, AgentChips dot, global heatmap, timeline tile, agent profile hero | agent colors |
| Filter chips, kickers, "live" pills | accent only |

### Fonts

- `--font-display` `"Instrument Serif", "Iowan Old Style", Palatino, Georgia, serif` — used at large sizes for masthead, day numerals, lead title, foot punchline. Italic by default.
- `--font-sans` `Inter` — body, UI labels, form controls.
- `--font-mono` `JetBrains Mono` — every uppercase tracking-wider label, all dates and times, all kickers, agent labels in TodayPanel.

The 3-font stack is non-negotiable. Do not introduce a fourth typeface. If you need emphasis, lean on display weight or italics, not a new family.

### Radii + spacing

- `--r-sm` 6px (tags, swatches), `--r-md` 10px (drop rows, entries), `--r-lg` 16px (cards, heatmap), `--r-xl` 22px (hero modules, if any).
- Section padding: 56px vertical default; 36px when `data-density="compact"`.
- Card padding: 24px (`--pad-card`); 22px on tiles for visual rhythm.

## Components — visual contract

### Top nav

Sticky, semi-transparent backdrop-blur, 56px tall. Wordmark on the left (mono ticker by default; italic serif and bold sans are alt styles). Mono nav links. Theme toggle and a subscribe icon-button on the right. Active link gets `--surface-2` pill.

### Masthead (home)

```
ISSUE / TODAY / LIVE INGEST
i wake up,
there is another *AI update*.
[ tagline ]                       [ tools ] [ drops 24h ] [ streak ]
```

- Headline: display serif, italic accent on the punchline phrase.
- Sub-row: tagline left (display italic, muted), 3-stat strip right (mono labels, display numerals).

### Lead drop

A two-column band: a single Lead card on the left (1.6fr), a vertical stack of 3 secondary drop rows + a "See all drops" CTA on the right (1fr). The Lead pulls a soft radial tint of the agent's brand color from the top edge.

```
[ AGENT NAME ] [ release/news/post ]            [ relative time ]
*Display-italic title that runs 1–2 lines*
muted summary line, max 56ch
[ optional embedded tweet card ]
                                               read source →
```

### Drop row

Compact: agent dot · title (clamp-2) · agent · type · time PT. Hover lifts to `--surface-hover` and tightens the border.

### Timeline tile (home grid)

3-up grid (2-up under 1000px, 1-up under 640px). Each tile:
- Display-italic agent name + LIVE pill in agent color
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

- Weekday in mono micro-cap, date as display numeral + month.
- Body inset to 154px (matching the date column width) for a typographic ledger look.

### Entry (in day group)

3px agent-colored rail + 1fr body + time PT. TypeBadge first, then optional agent label, then source-type label. Title is sans 15px, hover → accent. Summary muted.

### Stay-in-the-loop band

Two columns inside a soft `--surface-2` band with top + bottom hairlines.
- Left: kicker → display headline → muted intro → SubscribeForm.
- Right: kicker → display headline → muted intro → SuggestForm.

Forms use 8px radius inputs, accent focus ring, dark primary buttons (`--text` background, `--bg` text — high-contrast, not accent). Success states return an inline accent-soft band with a "Subscribe another →" / "Suggest another →" reset link.

### Footer

Echoes the masthead with a smaller display-italic punchline ("i wake up, there is *another one*."), then a hairline + mono credit row + nav links. Credit copy:

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

## Tweakable surface (in the prototype only)

The static prototype exposes these knobs through the in-page Tweaks panel:
`theme`, `accent` (purple|coral|teal|lime), `displayFont` (serif|sans), `wordmarkStyle` (ticker|italic|bold), `density` (cozy|compact), `heatmapCell` (10–20px). These are *for design exploration* — production ships the locked defaults: `theme=system`, `accent=purple`, `displayFont=serif`, `wordmarkStyle=italic`, `density=cozy`, `heatmapCell=13`.

## When in doubt

Ask: "Would a small newspaper editor approve of this?" If the answer is no, redesign.
