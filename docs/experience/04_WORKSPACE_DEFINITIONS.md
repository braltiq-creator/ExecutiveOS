# 4. Workspace Definitions

**Phase 36 · Experience Alignment**  

For every surface: purpose, questions, KPIs, cards, tables, actions, drill-downs, nav relationships.

---

## 4.1 Today — Executive Command Centre

| Field | Definition |
|-------|------------|
| Route | `/today` |
| Level | L1 |
| Primary purpose | Organisational awareness in ≤30 seconds |
| Icon | Calendar |
| Density | `mission` — fixed page; feed scrolls |

### Executive questions answered

- How healthy is the organisation?  
- What changed overnight?  
- What requires attention?  
- What is at risk / performing well?  
- Where should I go next?  

### Structure

| Zone | Contents |
|------|----------|
| Header | Greeting, name, clock, Organisation Health, last updated |
| KPI bar | Nine KPIs (see [KPI contracts](./08_KPI_DESTINATION_CONTRACTS.md)) |
| Executive Pulse | Headline + ≤4 signals + Overall Confidence |
| Executive Priorities | Max 5 cards: headline, summary, impact, Open → |
| Activity Feed | Chronological events; Open → to source |

### KPIs displayed

Organisation Health · Executive Value · Strategic Outcomes · Priority Decisions · Critical Risks · Customer Health · System Health · People Health · Commercial Health  

### Cards

- EXS KPI cards (bar)  
- EXS Priority cards (left panel)  
- Activity rows (right panel)  

### Tables

None on L1.

### Actions

Scan → click KPI / Priority / Activity → leave for workspace. No editing on Today.

### Drill-downs

All outbound; see KPI + Priority + Feed contracts.

### Navigation relationships

Parent of all workspaces. BrandMark target. Journey start and end.

---

## 4.2 Strategy

| Field | Definition |
|-------|------------|
| Route | `/strategy` (+ `/intent` family) |
| Level | L2 |
| Primary purpose | Direction, outcome health, commercial/strategic posture |
| Icon | Target |

### Executive questions

- Are strategic outcomes on track?  
- What is drifting?  
- What should we reframe or reinforce?  

### KPIs displayed (workspace strip)

| KPI | Notes |
|-----|-------|
| Organisation Health | Same icon/language as Today |
| Strategic Outcomes | on_track / total |
| Commercial Health | Focus posture |

### Cards

Outcome health cards · Initiative linkage · Intent / focus summary · Opportunity cards (short)

### Tables

Outcome portfolio table (name, health, movement, owner) — optional if card grid suffices

### Actions

Update health signals (where product allows) · Open outcome L3 · Open related decision · Return to Today

### Drill-downs

→ `/outcomes/[id]` or strategy detail · → Decisions if judgment required · → Today via BrandMark

### Navigation relationships

Entered from: Organisation Health, Strategic Outcomes, Commercial Health KPIs; commercial priorities; Pulse commercial signals.

---

## 4.3 Decisions

| Field | Definition |
|-------|------------|
| Route | `/decisions` (+ `/decisions/[id]` L3) |
| Level | L2 / L3 |
| Primary purpose | Judgment waiting — decide, defer, or escalate risk |
| Icon | Brain |

### Executive questions

- What must I decide now?  
- What is the cost of delay?  
- Which risks need judgment?  

### KPIs displayed

| KPI | Notes |
|-----|-------|
| Priority Decisions | Waiting count |
| Critical Risks | Elevated risk count |

### Cards

Decision queue cards · Risk cards · Advisor recommendation (workspace, not Today)

### Tables

Decision register (title, owner, timing, impact, status)

### Actions

Open decision workspace · Record / advance decision · Link to outcome · Return to Today

### Drill-downs

L2 list → L3 `/decisions/[id]` (evidence, context, actions)

### Navigation relationships

Entered from: Priority Decisions, Critical Risks KPIs; decision Priorities; Feed decision items.

---

## 4.4 Knowledge

| Field | Definition |
|-------|------------|
| Route | `/knowledge` (+ `/graph` family) |
| Level | L2 / L3 |
| Primary purpose | Context, memory, customer signal, connected evidence |
| Icon | Book Open |

### Executive questions

- What do we know that changes judgment?  
- What is the customer signal?  
- What memory should inform today’s decision?  

### KPIs displayed

| KPI | Notes |
|-----|-------|
| Customer Health | Primary entry from Today |

### Cards

Insight cards · Memory / lesson cards · Relationship previews (short)

### Tables

Optional evidence index (source, recency, confidence)

### Actions

Open graph / entity · Attach context to decision (future) · Return to Today

### Drill-downs

→ Graph exploration L3 · → related Decision/Strategy via links

### Navigation relationships

Entered from: Customer Health KPI; overnight Knowledge Feed items; Priority context cards.

---

## 4.5 Reports

| Field | Definition |
|-------|------------|
| Route | `/reports` (+ `/value` utility sibling) |
| Level | L2 |
| Primary purpose | Value realised, board-ready narrative, exports |
| Icon | File Text (Reports) · Gem (Executive Value) |

### Executive questions

- What value is ExecutiveOS creating?  
- What should leadership / board hear?  
- What do we export?  

### KPIs displayed

| KPI | Notes |
|-----|-------|
| Executive Value | Primary entry from Today → Reports (value section) |

### Cards

Value summary · ROI narrative · Export / pack cards

### Tables

Value estimate lines (dimension, amount, confidence, period)

### Actions

Open value analysis · Generate / download report · Return to Today

### Drill-downs

→ `/value` for deeper EVS · export flows

### Navigation relationships

Entered from: Executive Value KPI; Feed revenue/value items.

---

## 4.6 Administration

| Field | Definition |
|-------|------------|
| Route | `/administration` (+ `/settings/*`, `/team`, `/organization`, admin ops) |
| Level | L2 hub → L3 utilities |
| Primary purpose | System health, people access, integrations, billing, preferences |
| Icon | Settings · Server (System Health) · Users (People) |

### Executive questions

- Is the platform healthy?  
- Who has access?  
- What is connected?  
- Are we configured correctly?  

### KPIs displayed

| KPI | Notes |
|-----|-------|
| System Health | Platform / ops posture |
| People Health | Capacity / team access path |

### Cards

Admin destination cards (Organisation, Integrations, Billing, Team, Adaptive, …)

### Tables

Team roster · Integration status table (L3)

### Actions

Open settings · Manage seats · Connect integration · Return to Today

### Drill-downs

Hub → each settings/admin L3 page

### Navigation relationships

Entered from: System Health, People Health KPIs; Account menu utilities.

---

## 4.7 Utility workspaces (inherit EXS; not primary)

| Route | Purpose | Primary parent |
|-------|---------|----------------|
| `/value` | Deep Executive Value | Reports |
| `/insights` | Advisor depth | Decisions / Knowledge |
| `/actions` | Commitments | Decisions / Strategy |
| `/intent` | Strategic intent | Strategy |
| `/outcomes/[id]` | Outcome deep dive | Strategy |
| `/calendar` | Agenda context | Today Feed / Priorities |
| `/admin/*` | Ops / trust / pilots | Administration |

Each must define: header icon, EXS cards, breadcrumb to parent, BrandMark → Today.

---

**Next:** [Navigation Contracts](./05_NAVIGATION_CONTRACTS.md)
