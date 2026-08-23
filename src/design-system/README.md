# ExecutiveOS Design System 1.0 + EXDS (Phase 54)

Semantic tokens and reusable primitives. Feature components must not invent colour, spacing, or typography.

## Import

```ts
import {
  ExecutiveSection,
  ExecutiveMetric,
  ExecutiveButton,
  ExecutiveKpiCard,
  ExecutiveNarrative,
  ds,
} from "@/design-system";

// Or import EXDS directly
import {
  CouncilExperience,
  DigitalTwinStrip,
} from "@/design-system/executive-experience";
```

## Layers

| Layer | Path | Role |
| --- | --- | --- |
| Design System 1.0 | `src/design-system/` | Primitives, type, elevation, spacing |
| **EXDS** | `src/design-system/executive-experience/` | Premium presentation components for workspaces |
| EXS | `src/experience/exs/` | Mission Control / Today reference standards |

See [`docs/design-system/EXECUTIVE_EXPERIENCE_DESIGN_SYSTEM.md`](../../docs/design-system/EXECUTIVE_EXPERIENCE_DESIGN_SYSTEM.md) for the Phase 54 catalogue and migration guide.

## Tokens

Defined in `tokens.css` (semantic CSS variables) and `tokens.ts` (`ds` helpers):

- **Colour** — primary, secondary, canvas, surface, text, divider, momentum, attention, AI, navigation, focus
- **EXDS colour language** — intelligence · improving · watching · attention · historical · strategy
- **Elevation** — canvas, surface, floating, focus, modal
- **Typography** — Display XL/L, Heading, Subheading, Body, Supporting, Caption, Metric, Label
- **Spacing** — XS → 3XL
- **Motion** — hover, focus, navigation, cards, numbers (respects `prefers-reduced-motion`)
- **Icons** — size, stroke, padding via `--eos-icon-*`

## Components

**Primitives:** `ExecutiveSurface` · `ExecutivePanel` · `ExecutiveTile` · `ExecutiveMetric` · `ExecutiveIndicator` · `ExecutiveSection` · `ExecutiveStatus` · `ExecutiveTrend` · `ExecutiveButton` · `ExecutiveBadge` · `ExecutiveHeading` · `ExecutiveSubheading` · `ExecutiveDivider` · `ExecutiveNavigationItem` · `ExecutiveCard` · `ExecutiveSummary` · `ExecutiveSparkline`

**EXDS:** `ExecutiveSidebar` · `ExecutiveKpiCard` · `BusinessImpactCard` · `ExecutiveNarrative` · `DigitalTwinStrip` · `ExecutiveHeatMap` · `RelationshipGraph` · `ExecutiveTimeline` · `CouncilExperience` · `DomainAdvisorCard` · micro visualisations

## Rule

Everything visual comes from the design system. New screens inherit identity by composing these primitives. EXDS elevates presentation only — Core, providers, routing, Council architecture, and Intelligence Packs remain unchanged.
