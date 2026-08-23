# 3. Information Architecture

**Phase 36 · Experience Alignment**  

---

## 3.1 Organising principle

Information is organised by **executive attention**, not by system modules or data tables.

```
Attention (Today)
    ↓ drill
Understanding (Workspace)
    ↓ drill
Investigation (Deep surface)
    ↓ return
Attention (Today)
```

---

## 3.2 Content ownership

| Content type | Owns | Must not appear as primary on |
|--------------|------|-------------------------------|
| Org health / overnight change / priorities / activity | Today | Workspaces as “second Today” |
| Strategic outcomes, initiatives, intent | Strategy | Today as full outcome lists |
| Decision queue, risks tied to judgment, workspace detail | Decisions | Today as decision editor |
| Memory, graph, customer context, evidence links | Knowledge | Today as evidence browser |
| Value, ROI, board packs, exports | Reports | Today as report builder |
| Integrations, billing, team, system health ops | Administration | Today as settings |

---

## 3.3 Level definitions

### L1 — Today (Mission Control)

| Attribute | Standard |
|-----------|----------|
| Time budget | ≤30 seconds |
| Scroll | Page fixed; Activity Feed only scrolls |
| Zones | Header · KPI bar · Executive Pulse · Priorities · Activity Feed |
| Max priorities | 5 |
| Detail | Headline + one line + impact only |
| CTA | One click → workspace |

### L2 — Workspace

| Attribute | Standard |
|-----------|----------|
| Time budget | ~5 minutes |
| Purpose | Answer the workspace’s executive questions |
| Density | Snapshot-capable (prefer one viewport where possible) |
| Structure | Page header (icon + title) · summary strip · primary cards/tables · actions |
| CTA | Open L3 or act; always offer path back to Today |

### L3 — Deep surface

| Attribute | Standard |
|-----------|----------|
| Time budget | ~30 minutes |
| Purpose | Evidence, history, relationships, editing |
| Entry | From L2 only (or deep link with breadcrumb) |
| Exit | Up to L2 parent, or BrandMark → Today |

Examples: `/decisions/[id]`, `/outcomes/[id]`, admin sub-pages, graph exploration.

---

## 3.4 Object model (experience view)

Executives think in these objects — surfaces must map cleanly:

| Object | Primary home | Appears on Today as |
|--------|--------------|---------------------|
| Organisation health | Strategy (aggregate) | KPI + Pulse |
| Strategic outcome | Strategy | KPI count / Priority impact |
| Decision | Decisions | KPI + Feed + Priority |
| Risk | Decisions (judgment) / Strategy (outcome) | KPI + Priority |
| Customer / commercial signal | Knowledge / Strategy | KPI + Pulse |
| Executive value | Reports (`/value` utility sibling) | KPI |
| System health | Administration | KPI |
| People / capacity | Administration → Team | KPI |
| Activity event | Source workspace | Feed item |

---

## 3.5 Naming glossary (UI language)

| Prefer | Avoid |
|--------|-------|
| Today / Command Centre | Dashboard / Home feed |
| Executive Priorities | Snapshot / Inbox |
| Executive Pulse | Status banner / Alert strip |
| Activity Feed | Timeline / Changelog |
| Open → | View details / Learn more |
| Organisation Health | Org score (unless in KPI value) |
| Strategic Outcomes | OKRs / Goals (unless customer language requires) |

---

## 3.6 Relationship to older IA docs

[`docs/design/INFORMATION_ARCHITECTURE.md`](../design/INFORMATION_ARCHITECTURE.md) described a six-item nav with Insights/Actions. **Canonical primary nav for shipping Experience Alignment is:**

Today · Strategy · Decisions · Knowledge · Reports · Administration  

Insights and Actions remain **utility** destinations until a future phase reopens primary nav (requires explicit product decision).

---

**Next:** [Workspace Definitions](./04_WORKSPACE_DEFINITIONS.md)
