# AI Radar, Taste

> The design system and editorial voice for `radar.pmclaws.com`. Last updated 2026-05-03.

This file is the canonical source of truth for "what AI Radar looks and feels like." If you're touching UI, read this first. If you're adding a component, make sure it speaks this language.

This taste evolved out of `janeyoubradley.com`, the personal site whose `taste.md` describes a "quiet, Geist-set, type-led" aesthetic. AI Radar is a *cousin*, not a fork: it borrows the typography, restraint, and weight discipline, and adds one editorial moment (the masthead headline) plus a single accent color (purple) for the live signal.

## One-line voice

> **A daily index, not a dashboard.** Geist-set, light-weight, mostly black-on-paper. The reader should feel like they opened a small typed bulletin, not a SaaS console.

## Inheritance from janeyoubradley.com

We adopt these rules verbatim:

- **One typeface.** Geist for everything (display, body, UI). Geist Mono for time, dates, kickers, and meta only.
- **Light weights only.** Body 300, display 400. Never use 600+ except for the rare keyboard-shortcut chip. SaaS-bold is forbidden.
- **No em-dashes.** Anywhere. In copy, error messages, code comments. Use comma, period, colon, parens, or split sentences.
- **Italic is rare.** Reserved for exactly one moment per page (see "The italic moment" below). Never on body copy, never on section titles, never on UI.
- **Light is default.** Dark mode is a toggle, not a stance. Both themes use neutral palettes (saturation < 0.02 on whites and dark backgrounds).
- **No gradients on backgrounds.** A single ambient agent-tinted radial glow on the lead drop card is the only exception, and it's so subtle most readers won't consciously notice it.
- **No icon-only navigation.** Mono labels everywhere. Icons appear only on the theme toggle and subscribe button.
- **Type does the work.** Hierarchy comes from size, weight (within the 300/400 range), and space, not from color, borders, or shadow stacks.

## The italic moment

Each page may contain **one** italic phrase, and only one. On the home page that is the punchline of the masthead headline:

> i wake up, there is another *AI update*.

The single italic word is also accent-colored (purple). This is the signature beat. If you find yourself adding a second italic phrase on the same page, stop and ask whether one of them should be reset to roman.

The footer echoes the masthead with a smaller version of the same line, but on a different page render, so the home `<main>` shows the masthead italic, the footer below it gets one of its own. That's still one-per-region, not one-per-document; we accept the duplication because the footer is its own typographic frame.

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
- "Live" / kicker labels (mono micro-caps in `--accent`)
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

### Type vs agent: when to use which

| Surface | Color family |
|---|---|
| Per-agent heatmap, TypeBadge inside TimelineEntry | type colors |
| TodayPanel Lead, drop rows, AgentChips dot, global heatmap, timeline tile, agent profile hero | agent colors |
| Filter chips, kickers, "live" pills | accent only |

### Fonts

- `--font-sans` `Geist, ui-sans-serif, system-ui, sans-serif`, used for **everything** that isn't mono. Display sizes use the same family at weight 400 with tighter tracking; body uses weight 300.
- `--font-mono` `Geist Mono, ui-monospace, SFMono-Regular, monospace`, every uppercase tracking-wider label, all dates and times, all kickers, agent labels in TodayPanel.

There is no third typeface. Where the older taste called for "Instrument Serif italic" on display moments, we now use **Geist 400 with the italic reserved for the one accented phrase**. The change is deliberate: the serif felt like a magazine; AI Radar is a daily bulletin.

Load Geist via the official `geist` npm package or the Vercel-hosted CDN. Do not substitute Inter, IBM Plex Sans, or any "Geist-like" alternative. The metrics matter.

#### Weight discipline

| Use | Weight |
|---|---|
| Body copy, summaries, blurbs | 300 |
| Display (headlines, lead title, section titles, profile hero) | 400 |
| Mono labels, kickers, dates | 400 |
| The kbd chip and live pills | 500 (max) |
| Buttons, links | 400 |

Do not use 600 or 700 anywhere in the production app. If a moment feels under-weighted, scale up or add space; do not reach for a heavier weight.

### Radii + spacing

- `--r-sm` 6px (tags, swatches), `--r-md` 10px (drop rows, entries), `--r-lg` 12px (cards, heatmap), `--r-xl` 16px (hero modules, if any).
- Section padding: 64px vertical default; 36px when `data-density="compact"`.
- Card padding: 24px (`--pad-card`); 32px on the lead drop for visual weight.

The radii are deliberately conservative, janeyoubradley.com uses 8–12px; we go a hair larger because the live nature of the data benefits from a softer container, but never the 22px+ bubble look of consumer SaaS.

## Components: visual contract

### Top nav

Sticky, semi-transparent backdrop-blur, 56px tall. Wordmark on the left (italic Geist by default; ticker mono and medium sans are alt styles exposed in the prototype's Tweaks panel only). Mono nav links. Theme toggle and a subscribe icon-button on the right. Active link gets `--surface-2` pill.

### Masthead (home)

```
ISSUE / TODAY / LIVE INGEST
i wake up,
there is another *AI update*.
[ tagline ]                       [ tools ] [ drops 24h ] [ streak ]
```

- Headline: Geist 400, `clamp(36px, 5.2vw, 64px)`, `letter-spacing: -0.03em`. The single italic phrase is also accent-colored.
- Sub-row: tagline left (Geist 300, muted), 3-stat strip right (mono labels, Geist 300 numerals at 30px).

### Lead drop

A two-column band: a single Lead card on the left (1.6fr), a vertical stack of 3 secondary drop rows + a "See all drops" CTA on the right (1fr). The Lead pulls a soft radial tint of the agent's brand color from the top edge.

```
[ AGENT NAME ] [ release/news/post ]            [ relative time ]
Display title that runs 1–2 lines, Geist 400
muted summary line, max 56ch, Geist 300
[ optional embedded tweet card ]
                                               read source →
```

The lead title is **not** italic and **not** bold. Hierarchy comes from size (28px) and the surrounding space.

### Drop row

Compact: agent dot · title (clamp-2) · agent · type · time PT. Hover lifts to `--surface-hover` and tightens the border.

### Timeline tile (home grid)

3-up grid (2-up under 1000px, 1-up under 640px). Each tile:
- Geist 400 agent name (20px) + LIVE pill in agent color
- Blurb (Geist 300, muted)
- 30-day mini sparkline using agent color, 4 intensities
- Latest entry title (clamp-2)
- Foot row: drops/7d count + "View profile →"

A radial agent-tinted glow bleeds in from the top-right corner. Subtle, not a gradient party.

### Coming-soon strip

Dashed-border container directly under the tiles grid. Each queued tool is a chip with `queued` mono micro-label. Greyscale, low chroma. Reminds visitors there is more coming without making it feel sparse.

### Activity heatmap

26 weeks × 7 days. Cell size 13px by default (range 10–20, exposed via Tweaks for layout work). Wrapped in a card. Two callouts to the right of the title:
- **Current streak**, `<n>` days
- **Busiest day**, `<count>` on `<Mon DD>`

A custom DOM tooltip, not the native title attribute, follows the cell. Click → filter the feed to that date. Active date gets an accent ring on the cell.

Mode `single` (per-agent profile) uses entry-type colors and a less / 5-step / more legend.
Mode `global` (`/drops`) uses agent colors with the dominant-agent-per-day strategy and an agent legend underneath.

### Day group (`/drops`)

Each day is a `<details>` block. Today is open. Summary grid is 130px / 1fr / auto:

```
Sun                12 updates
May 03            • Claude • Cursor • Codex            ▾
```

- Weekday in mono micro-cap, date as Geist 300 numeral + month.
- Body inset to 154px (matching the date column width) for a typographic ledger look.

### Entry (in day group)

3px agent-colored rail + 1fr body + time PT. TypeBadge first, then optional agent label, then source-type label. Title is Geist 400 at 15px, hover → text gets darker (no accent on body copy). Summary muted.

### Stay-in-the-loop band

Two columns inside a soft `--surface-2` band with top + bottom hairlines.
- Left: kicker → Geist 400 headline → muted intro → SubscribeForm.
- Right: kicker → Geist 400 headline → muted intro → SuggestForm.

Forms use 8px radius inputs, accent focus ring, dark primary buttons (`--text` background, `--bg` text, high-contrast, not accent). Success states return an inline accent-soft band with a "Subscribe another →" / "Suggest another →" reset link.

### Footer

Echoes the masthead with a smaller Geist 400 punchline ("i wake up, there is *another one*."), then a hairline + mono credit row + nav links. Credit copy:

> Built by Jane You (with Claude Code & Design) · maintained by RaeyaBot · daily ingest 5am PT

Note the middle dots, not em-dashes.

## Density and rhythm

- Default density is `cozy`. `compact` shrinks section padding 64→36px.
- Vertical rhythm relies on consistent 24px / 64px stops, avoid magic numbers.
- Tiles have `transform: translateY(-1px)` on hover. Drop rows do not. Use motion *only* on top-level click targets.

## Motion

- The accent dot pulses at 2.4s ease-out, infinite. Same animation on the LIVE pills.
- Heatmap cell hover: 1.4× scale, 1.5px outline, 80ms.
- Day group chevron rotates 180° on open, 200ms.
- No page transitions, no fade-ins, no scroll-tied reveals. The reader is here for content, not a show.

## What we do NOT do

- No emoji as decoration.
- No em-dashes anywhere, copy, error messages, code comments. Use comma, period, colon, parens, or split sentences.
- No gradients on backgrounds. The single radial glow on lead/tiles is *agent-tinted*, low alpha, and ambient, not decorative.
- No icon-only navigation. Mono labels everywhere; icons are reserved for theme toggle and subscribe.
- No skeuomorphic shadow stacks. Only borders + subtle hover state changes.
- No marketing copy. Every line should sound like a librarian, not a launch page.
- No third font.
- No font weight 600 or above. (Single 500 exception for the kbd chip.)
- No accent color on body copy. Accent is for moments, not paragraphs.
- No italic outside the one accented phrase per region.

## Tweakable surface (in the prototype only)

The static prototype exposes these knobs through the in-page Tweaks panel:
`theme`, `accent` (purple|coral|teal|lime), `displayFont` (sans|sans), `wordmarkStyle` (ticker|italic|bold), `density` (cozy|compact), `heatmapCell` (10–20px). These are *for design exploration*, production ships the locked defaults: `theme=system`, `accent=purple`, `displayFont=sans`, `wordmarkStyle=italic`, `density=cozy`, `heatmapCell=13`.

The legacy `displayFont=serif` mode is retained in the prototype as a historical reference (it shows what the Instrument Serif version felt like) but should not be used as a starting point for new design work.

## When in doubt

Ask: "Does this look like janeyoubradley.com would link to it without explanation?" If the answer is no, redesign. The site should look like it lives in the same family as Jane's personal site, with a single accent (purple) and one editorial moment (the masthead) marking it as the bulletin variant.
