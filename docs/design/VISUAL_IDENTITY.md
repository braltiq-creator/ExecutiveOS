# ExecutiveOS Visual Identity

## Design Philosophy

ExecutiveOS visual language is **institutional modernism** — the gravitas of a board report with the craft of a world-class product team. Light mode is primary (executive daytime); dark mode is secondary (early morning / travel).

**Primary typeface:** Geist Sans (product) — already deployed  
**Monospace:** Geist Mono — scores, IDs, timestamps, graph labels

---

## Primary Palette — Executive Ink

The brand anchor is not a loud accent — it is **Executive Ink**, a blue-black that signals authority without corporate cliché.

### Ink 900 — Primary Brand
| Format | Value |
|--------|-------|
| **HEX** | `#0F1419` |
| **RGB** | `15, 20, 25` |
| **HSL** | `214°, 25%, 8%` |
| **Usage** | Primary buttons, wordmark, key headlines, focus rings (light mode), priority strip backgrounds |

### Ink 800
| Format | Value |
|--------|-------|
| **HEX** | `#1A2332` |
| **RGB** | `26, 35, 50` |
| **HSL** | `214°, 32%, 15%` |
| **Usage** | Dark mode surfaces, hero gradients, navigation emphasis |

### Ink 700
| Format | Value |
|--------|-------|
| **HEX** | `#243044` |
| **RGB** | `36, 48, 68` |
| **HSL** | `214°, 31%, 20%` |
| **Usage** | Dark mode elevated cards, chart axes |

---

## Secondary Palette — Slate Intelligence

Neutral backbone for 90% of UI. Aligns with current zinc implementation; refined for brand consistency.

### Slate 50 — Canvas
| **HEX** | `#FAFAFA` | **RGB** | `250, 250, 250` | **HSL** | `0°, 0%, 98%` |
| **Usage** | Page background (alternate), inset areas |

### Slate 100 — Surface Subtle
| **HEX** | `#F4F4F5` | **RGB** | `244, 244, 245` | **HSL** | `240°, 5%, 96%` |
| **Usage** | Card hover, timeline row backgrounds |

### Slate 200 — Border Default
| **HEX** | `#E4E4E7` | **RGB** | `228, 228, 231` | **HSL** | `240°, 6%, 90%` |
| **Usage** | Card borders, dividers, input borders |

### Slate 400 — Muted Text
| **HEX** | `#A1A1AA` | **RGB** | `161, 161, 170` | **HSL** | `240°, 5%, 65%` |
| **Usage** | Placeholders, timestamps, meta labels |

### Slate 600 — Secondary Text
| **HEX** | `#52525B` | **RGB** | `82, 82, 91` | **HSL** | `240°, 4%, 34%` |
| **Usage** | Body secondary, descriptions |

### Slate 900 — Primary Text
| **HEX** | `#18181B` | **RGB** | `24, 24, 27` | **HSL** | `240°, 6%, 10%` |
| **Usage** | Headlines, primary body (light mode) |

---

## Accent Palette — Restrained Signal

Accents encode **meaning**, never decoration. Maximum one accent per viewport region.

### Meridian Blue — Primary Accent
| **HEX** | `#2563EB` | **RGB** | `37, 99, 235` | **HSL** | `221°, 83%, 53%` |
| **Usage** | Links, selected states, graph edge highlights, advisor accent (Strategy). WCAG on white: 4.6:1 ✓ |

### Meridian Blue Muted
| **HEX** | `#EFF6FF` | **RGB** | `239, 246, 255` | **HSL** | `214°, 100%, 97%` |
| **Usage** | Selected row backgrounds, info badges |

### Executive Bronze — Premium Accent (sparingly)
| **HEX** | `#92704A` | **RGB** | `146, 112, 74` | **HSL** | `32°, 33%, 43%` |
| **Usage** | Premium tier indicators, executive plan badge, marketing hero accent — never in alerts |

### Executive Bronze Light
| **HEX** | `#F7F3EE` | **RGB** | `247, 243, 238` | **HSL** | `34°, 36%, 95%` |
| **Usage** | Premium card backgrounds, investor deck accents |

---

## Semantic Colors

### Success — Portfolio Healthy
| **HEX** | `#059669` | **RGB** | `5, 150, 105` | **HSL** | `160°, 94%, 30%` |
| **Surface** | `#ECFDF5` | Usage: on-track initiatives, positive trends |

### Warning — Attention Required
| **HEX** | `#D97706` | **RGB** | `217, 119, 6` | **HSL** | `32°, 95%, 44%` |
| **Surface** | `#FFFBEB` | Usage: at-risk initiatives, approaching limits |

### Critical — Immediate Attention
| **HEX** | `#DC2626` | **RGB** | `220, 38, 38` | **HSL** | `0°, 73%, 51%` |
| **Surface** | `#FEF2F2` | Usage: off-track, conflicts, blocking risks — max 1–2 per screen |

**Rule:** Critical red never fills large areas. Use border + small badge + headline only.

---

## Advisor Accent Colors (Domain Identity)

Each advisor retains a muted identity dot — never full-card backgrounds.

| Advisor | HEX | Usage |
|---------|-----|-------|
| Chief of Staff | `#52525B` | Neutral orchestrator |
| Strategy | `#4F46E5` | Indigo |
| Board | `#7C3AED` | Violet |
| Financial | `#059669` | Emerald |
| Sales | `#0284C7` | Sky |
| Operations | `#D97706` | Amber |
| People | `#E11D48` | Rose |
| Risk | `#EA580C` | Orange |
| Execution | `#0891B2` | Cyan |
| Communications | `#C026D3` | Fuchsia |

---

## Background & Surface System

### Light Mode

| Token | HEX | Usage |
|-------|-----|-------|
| `bg-canvas` | `#FFFFFF` | Main page background |
| `bg-surface` | `#FFFFFF` | Cards (with border) |
| `bg-surface-raised` | `#FFFFFF` + shadow | Modals, popovers |
| `bg-surface-inset` | `#FAFAFA` | Timeline rows, secondary panels |
| `bg-intelligence-hero` | `#0F1419` | Priority strip, morning hero only |

### Dark Mode

| Token | HEX | Usage |
|-------|-----|-------|
| `bg-canvas` | `#09090B` | Main background |
| `bg-surface` | `#18181B` | Cards |
| `bg-surface-raised` | `#27272A` | Elevated cards |
| `bg-surface-inset` | `#0F1419` | Inset panels |
| `bg-intelligence-hero` | `#1A2332` | Hero (no pure black) |

---

## Typography Hierarchy

Based on Geist Sans. ExecutiveOS favors **weight and spacing over size escalation**.

| Token | Size | Weight | Tracking | Line Height | Usage |
|-------|------|--------|----------|-------------|-------|
| `display` | 40px / 2.5rem | 600 | -0.02em | 1.1 | Marketing hero only |
| `h1` | 32–36px | 600 | -0.02em | 1.15 | Page titles, greeting |
| `h2` | 20–24px | 600 | -0.01em | 1.25 | Section headers |
| `h3` | 16–18px | 600 | -0.01em | 1.3 | Card titles |
| `body` | 15px | 400 | 0 | 1.6 | Primary content |
| `body-sm` | 13–14px | 400 | 0 | 1.55 | Descriptions |
| `caption` | 12px | 500 | 0.01em | 1.4 | Meta, timestamps |
| `overline` | 11px | 500 | 0.18em | 1.3 | Section labels (uppercase) |
| `mono` | 13px | 400 | 0 | 1.5 | Scores, graph IDs (Geist Mono) |

**Rules:**
- Never more than 3 type sizes per screen section
- Overline always uppercase with wide tracking — the "briefing label"
- Priority scores use `mono` at 24–32px weight 600

---

## Spacing System

8px base grid. ExecutiveOS uses **generous vertical rhythm**.

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight inline gaps |
| `space-2` | 8px | Icon-text, badge padding |
| `space-3` | 12px | Compact card padding |
| `space-4` | 16px | Standard gap |
| `space-5` | 20px | Card padding (default) |
| `space-6` | 24px | Section internal |
| `space-8` | 32px | Between sections |
| `space-10` | 40px | Major section breaks |
| `space-12` | 48px | Page section padding |
| `space-16` | 64px | Hero vertical padding |

**Page max-width:** 1152px (`6xl`) for intelligence views; 1024px (`5xl`) for conversational views.

---

## Elevation System

Shadows are **barely visible** — elevation communicated primarily through border + background shift.

| Level | Shadow | Usage |
|-------|--------|-------|
| `elevation-0` | none | Flat inset rows |
| `elevation-1` | `0 1px 2px rgba(15,20,25,0.04)` | Default cards |
| `elevation-2` | `0 4px 12px rgba(15,20,25,0.06)` | Hover cards |
| `elevation-3` | `0 8px 24px rgba(15,20,25,0.08)` | Modals, command palette |
| `elevation-4` | `0 16px 48px rgba(15,20,25,0.12)` | Drawers (rare) |

Dark mode: reduce opacity 50%; prefer border `Slate 700` over shadow.

---

## Corner Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 6px | Badges, small buttons |
| `radius-md` | 8px | Buttons, inputs |
| `radius-lg` | 12px | Cards (default) |
| `radius-xl` | 16px | Modals, hero panels |
| `radius-full` | 9999px | Avatars, pills |

**Rule:** Never mix radius-lg and radius-xl on adjacent nested elements.

---

## Icon Style

- **Library:** Lucide (when implemented) — 1.5px stroke, rounded caps
- **Size:** 16px inline, 20px navigation, 24px empty states
- **Color:** Inherit text color; never multicolor icons in product UI
- **Avoid:** Filled emoji-style icons, AI sparkle glyphs, robot metaphors

---

## Illustration Style

- **Approach:** Abstract geometric — lines, nodes, meridian arcs
- **Palette:** Ink + Slate only; single Meridian Blue accent max
- **Usage:** Empty states, onboarding, marketing — never in data-dense views
- **Avoid:** Isometric SaaS illustrations, characters, clip art

---

## Photography Style

- **Subject:** Real executives in natural light — not stock handshake photos
- **Treatment:** Desaturated 15%, slight cool tone, high clarity
- **Composition:** Negative space for text overlay; never busy backgrounds
- **Usage:** Marketing site, case studies, investor deck — not in-product

---

## Glassmorphism Guidance

**Default: Do not use.** ExecutiveOS is not a consumer glass aesthetic.

**Exception (sparingly):**
- Command palette overlay backdrop: `rgba(15,20,25,0.4)` + `backdrop-blur(8px)`
- Marketing hero floating elements only

Never glass-card data surfaces. Readability > effect.

---

## Gradients

| Name | Definition | Usage |
|------|------------|-------|
| `gradient-hero` | `#0F1419` → `#1A2332` (135deg) | Intelligence priority strip |
| `gradient-canvas` | `#FFFFFF` → `#FAFAFA` (180deg) | Marketing page subtle depth |
| `gradient-premium` | `#F7F3EE` → `#FFFFFF` | Executive plan marketing |

**Rule:** No rainbow, no purple-blue AI gradients, no animated gradients in product.

---

## Accessibility — Contrast Ratios (WCAG AA)

| Pairing | Ratio | Pass |
|---------|-------|------|
| Slate 900 on White | 17.4:1 | AAA ✓ |
| Slate 600 on White | 7.0:1 | AAA ✓ |
| Slate 400 on White | 3.0:1 | Large text only |
| White on Ink 900 | 17.9:1 | AAA ✓ |
| Meridian Blue on White | 4.6:1 | AA ✓ |
| Critical on White | 4.8:1 | AA ✓ |
| Success on White | 4.5:1 | AA ✓ |

**Focus indicator:** 2px Ink 900 ring, 2px offset — visible on all interactive elements.

---

*Related: `COMPONENT_GUIDELINES.md`, `MOTION_SYSTEM.md`, `EXECUTIVEOS_DESIGN_BIBLE.md`*
