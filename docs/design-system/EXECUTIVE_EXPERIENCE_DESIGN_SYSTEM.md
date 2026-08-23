# Executive Experience Design System (EXDS)

**Phase:** 54  
**Status:** Presentation layer — permanent  
**Principle:** Confidence Through Clarity  
**Path:** `src/design-system/executive-experience/`

---

## 1. Purpose

EXDS elevates every existing ExecutiveOS workspace to the same premium executive standard established by the marketing website, Command Centre, and executive keynote — **without redesigning the product**.

Executives should feel they are **operating the business**, not operating software.

Every screen answers three questions within 30 seconds:

1. **What changed?**
2. **Why did it change?**
3. **What judgement is required?**

Visual references: Bloomberg Terminal · Apple Keynote · McKinsey executive briefings — not traditional SaaS dashboards.

---

## 2. Architecture boundary

| Unchanged | EXDS may touch |
| --- | --- |
| Core / providers | Presentation components |
| Routing / navigation architecture | Sidebar **chrome** (compose around existing `PrimaryNav`) |
| Workspaces / business logic | Cards, timelines, heat maps, narratives |
| Council architecture | Council **presentation** only |
| Intelligence Packs / Domain Advisors (logic) | Advisor **cards** (visual) |
| Judgement Framework / Reality Lab / Executive Loop | Micro visualisations of their outputs |

**Rule:** No new business logic. No new routes. Drill-through links only to existing workspaces.

### Relationship to other layers

```
Design System 1.0     → primitives (type, space, elevation)
EXDS (Phase 54)       → executive presentation components
EXS (experience/exs)  → Mission Control / Today reference patterns
Feature workspaces    → compose EXDS; never invent parallel UI
```

---

## 3. Colour language (semantic)

Colours are **meaning**, not decoration.

| Colour | Token | Meaning |
| --- | --- | --- |
| Blue | `--exds-intelligence` | Executive Intelligence |
| Green | `--exds-improving` | Improving · positive · healthy |
| Amber | `--exds-watching` | Watching · uncertainty · monitor |
| Red | `--exds-attention` | Executive attention · negative · risk |
| Grey | `--exds-historical` | Historical · reference · completed |
| Purple | `--exds-strategy` | Strategy · future planning |

Helpers: `toneFromHealth()`, `toneFromTrend()`, `EXDS_TONE_VAR`, `EXDS_TONE_LABEL` from `@/design-system/executive-experience`.

---

## 4. Component catalogue

### Shell & orientation

| Component | Role |
| --- | --- |
| `ExecutiveSidebar` | Dark executive nav chrome: larger brand, “Executive Intelligence Platform” subtitle, org health, cadence, profile, Council status, workspace indicator. Pass existing `PrimaryNav` as `navigation`. |
| `ExecutiveNarrative` | Opening sentence for every workspace — judgement first, never numbers alone. |
| `DigitalTwinStrip` | Living enterprise model: Organisation · Operations · Commercial · People · Capital · Customers · Technology · Risk. |

### Decision surfaces

| Component | Role |
| --- | --- |
| `ExecutiveKpiCard` | Icon · title · value · trend · sparkline · confidence · timestamp · Open → |
| `BusinessImpactCard` | Revenue · Working capital · Customer · Risk · People · Operations · Confidence · Expected outcome · Predicted vs Actual |
| `CouncilExperience` | Collaborative Council ring + detail pane (position, confidence, reasoning, evidence, challenges, agreement, learning) |
| `DomainAdvisorCard` | Status · observation · recommendation · confidence · indicators · escalation · Council relationship |

### Structure & causality

| Component | Role |
| --- | --- |
| `ExecutiveHeatMap` | Dealer demand, factory utilisation, regional opportunity, risk, customer health, inventory ageing, workload — cells link to existing routes |
| `RelationshipGraph` | Vertical/horizontal enterprise chains (e.g. Customer → Demand → Factory → Inventory → Working Capital → Outcome) |
| `ExecutiveTimeline` | Observation → Analysis → Council → Recommendation → Decision → Outcome → Learning |

### Micro visualisations

| Component | Role |
| --- | --- |
| `MiniSparkline` | Compact series |
| `ConfidenceBand` | 0–100 confidence |
| `TrendBar` | Short vertical series |
| `CapacityBar` | Used / total capacity |
| `HealthRing` | Circular health |
| `ForecastRange` | Low–mid–high with optional actual |
| `DistributionBar` | Proportional segments |
| `MovementIndicator` | Semantic trend arrow |

No heavy BI charts. State must read in seconds.

---

## 5. Motion & typography

**Motion:** Subtle fades, micro transitions, soft counters. Never decorative. Honour `prefers-reduced-motion` (tokens collapse durations).

**Typography:** Continue Design System 1.0 scales. Increase hierarchy and whitespace. Editorial rhythm — less chrome, more judgement.

**Accessibility:** Focus rings (`exds-focus-ring`), keyboard-safe interactive elements, semantic roles on meters/timelines, responsive layouts.

---

## 6. Visual examples (composition patterns)

### Workspace opening

```tsx
import {
  ExecutiveNarrative,
  DigitalTwinStrip,
  ExecutiveKpiCard,
} from "@/design-system/executive-experience";

<>
  <ExecutiveNarrative
    judgement="Plant 2 has become the primary constraint preventing demand fulfilment in Western Australia."
    supporting="Capacity remains available elsewhere. Queensland dealer pull exceeds forecast."
  />
  <DigitalTwinStrip
    nodes={[
      { domain: "operations", label: "Operations", health: "attention", href: "/today" },
      { domain: "commercial", label: "Commercial", health: "watch", href: "/decisions" },
      // …
    ]}
  />
  <ExecutiveKpiCard
    title="Factory health"
    value="74"
    href="/today"
    trend="down"
    trendLabel="−6"
    sparkline={[82, 80, 79, 77, 74]}
    confidence={88}
    timestamp="06:12"
  />
</>
```

### Sidebar (nav architecture preserved)

```tsx
import { ExecutiveSidebar } from "@/design-system/executive-experience";
import { PrimaryNav } from "@/components/layout/PrimaryNav";

<ExecutiveSidebar
  navigation={<PrimaryNav variant="sidebar" />}
  organisationName="Hitachi CM Australia"
  organisationHealth={82}
  organisationHealthLevel="watch"
  cadenceLabel="Morning brief"
  activeProfile="Manufacturing"
  councilStatus="Consensus forming"
  currentWorkspace="Today"
/>
```

### Council + Advisor (presentation only)

```tsx
<CouncilExperience
  framing="Three seats converge on production increase; CFO preserves capital caution."
  seats={[/* map from existing council view models */]}
/>

<DomainAdvisorCard
  advisor={{
    id: "demand",
    name: "Demand Planning Advisor",
    domain: "Demand",
    status: "active",
    observation: "Queensland demand exceeds forecast for three consecutive weeks.",
    recommendation: "Reallocate ZX350 inventory west → Queensland.",
    confidence: 91,
    councilRelationship: "Advises COO · CRO",
  }}
/>
```

---

## 7. Migration guide

Adopt EXDS **incrementally**. Do not rewrite workspaces in one pass.

### Phase A — Tokens (done)

- Import `executive-experience/tokens.css` via `globals.css`
- Prefer `--exds-*` semantic tones over ad-hoc Tailwind colour utilities

### Phase B — Workspace openings

1. Add `ExecutiveNarrative` as the first element of each major workspace
2. Replace generic page titles that lead with metrics
3. Optionally mount `DigitalTwinStrip` under the narrative

### Phase C — KPI & impact

| Today | Replace / wrap with |
| --- | --- |
| Static metric tiles / `ExsKpiCard` (where richer cards are needed) | `ExecutiveKpiCard` |
| Ad-hoc impact lists | `BusinessImpactCard` |
| Simple sparklines | `MiniSparkline` + `MovementIndicator` |

`ExsKpiCard` remains valid for Mission Control density; use `ExecutiveKpiCard` when elevating Strategy, Decisions, and executive briefings.

### Phase D — Council & Advisors

| Today | Elevate with |
| --- | --- |
| Stacked council list cards | `CouncilExperience` (map existing perspective data) |
| Pack-specific advisor chrome | `DomainAdvisorCard` (one visual language across packs) |

Do **not** change Council seat model, consensus logic, or advisor engines.

### Phase E — Structure

| Today | Elevate with |
| --- | --- |
| Activity feeds | `ExecutiveTimeline` |
| Flat tables of regions/dealers | `ExecutiveHeatMap` with `href` into existing routes |
| Ad-hoc arrows between concepts | `RelationshipGraph` |

### Phase F — Shell chrome (optional)

Replace AppShell `<aside>` chrome with `ExecutiveSidebar`, still rendering `<PrimaryNav />` as `navigation`. **Do not change** `PRIMARY_NAV`, routes, or mobile bottom nav contract without a separate decision.

---

## 8. Import paths

```ts
// Preferred — package barrel
import {
  ExecutiveKpiCard,
  ExecutiveNarrative,
  CouncilExperience,
} from "@/design-system/executive-experience";

// Also available via design-system root
import { BusinessImpactCard, MiniSparkline } from "@/design-system";
```

---

## 9. Success criteria

An executive opening ExecutiveOS should immediately feel they are inside a **premium executive operating environment**, visually aligned with the website, keynote, and Command Centre — while every capability already built continues to work unchanged.

---

*Confidence Through Clarity.*
