# Executive Experience System (EXS) v1.0

Presentation standards for ExecutiveOS. **Today (Mission Control)** is the reference implementation. Future modules inherit these primitives.

## Principles

- Calm, confident, precise — infrastructure, not theatre
- Colour communicates meaning only (never decoration)
- One icon language across KPIs, nav, headers, and cards
- Every card scannable in under five seconds
- Every click drills into deeper intelligence

## Brand

- Wordmark: **ExecutiveOS**
- Identity line: **Confidence Through Clarity**
- Component: `BrandMark`

## Icons

Shared registry: `@/experience/icons`  
Same Lucide icon for a concept everywhere (KPI ↔ nav ↔ page title).

## Cards

| Primitive | Use |
|-----------|-----|
| `ExsKpiCard` | Metric scan (icon, label, value, trend, confidence) |
| `ExsPriorityCard` | Attention item (headline, summary, impact, Open →) |
| `.exs-card` | Base surface + hover/focus |

## Colour

| Token | Meaning |
|-------|---------|
| Green | Positive trend |
| Red | Negative / critical |
| Amber | Attention |
| Blue | Navigation |
| Grey | Neutral |

Never colour entire KPI cards.

## Motion

- Reveal stagger on load
- Soft KPI value flash on change
- Page dive (`ExsPageTransition`) on module change
- Respect `prefers-reduced-motion`

## Copy

Chief of Staff voice: brief, actionable, non-technical.
