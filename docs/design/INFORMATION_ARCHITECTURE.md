# ExecutiveOS Information Architecture

**Status:** Canonical (approved pending founder sign-off)  
**Version:** 1.0  
**Date:** 20 July 2026  
**Depends on:** [`FRONTEND_DECISION_RECORD.md`](./FRONTEND_DECISION_RECORD.md)  
**Supersedes:** Design Bible §6 nav limits, `UX_PRINCIPLES.md` IA tree, and current `AppShell` flat link list.

---

## 1. Purpose

Define how executives move through ExecutiveOS so that:

1. The **Executive Briefing** is the daily default.
2. **Strategic outcomes** organise attention.
3. **Outcome Health** remains visible without stealing focus.
4. Primary navigation stays **six items** — scannable under time pressure.

---

## 2. Product Mental Model

```
                    ┌─────────────────────────┐
                    │   Strategic Outcomes    │
                    │  (personalisation axis) │
                    └───────────┬─────────────┘
                                │
                ┌───────────────▼───────────────┐
                │     Executive Briefing        │
                │   (default landing · Today)   │
                └───────────────┬───────────────┘
        ┌───────────┬───────────┼───────────┬───────────┐
        ▼           ▼           ▼           ▼           ▼
   Decisions    Insights     Actions    Knowledge    Reports
```

| Concept | Definition |
|---------|------------|
| **Strategic outcomes** | What leadership is trying to achieve; primary personalisation and priority input |
| **Role** | Context for language, entitlements, and advisor emphasis — **not** priority ranking |
| **Outcome Health** | Persistent portfolio signal for outcome/initiative execution health |
| **Executive Briefing** | Time-aware, outcome-ranked brief — the OS “boot sequence” for the day |

---

## 3. Primary Navigation (Canonical)

Exactly six primary destinations. Labels are product UI language.

| Nav label | Purpose | Default route (target) | Maps from today’s codebase |
|-----------|---------|------------------------|----------------------------|
| **Today** | Executive Briefing — what requires judgment now | `/today` *(alias `/dashboard` during migration)* | `IntelligenceCenter` / `/dashboard` |
| **Decisions** | Judgment register — draft, review, decide, archive | `/decisions` | `/decisions` |
| **Insights** | Advisor & intelligence depth — explain before recommend | `/insights` *(alias `/advisors` during migration)* | `/advisors`, digest/insight cards |
| **Actions** | Commitments to execute — delegated work, follow-ups, initiative moves | `/actions` | Partially: initiatives actions, meeting actions; consolidate |
| **Knowledge** | Graph, memory, connected context | `/knowledge` *(alias `/graph` during migration)* | `/graph`, executive memory |
| **Reports** | Board-ready / periodic narrative exports and reviews | `/reports` | Mostly greenfield; board pack direction from roadmap |

### Rules

1. **Logo / wordmark → Today** (Executive Briefing), never marketing `/`.
2. **No seventh primary item.** Settings, org, billing, integrations, team, admin live under **Account / Organisation** (utility), not primary nav.
3. **Mobile:** same six labels in a bottom bar (or overflow “More” only if viewport cannot fit six — prefer scrollable tab bar over hiding Decision/Insights).
4. **Active state:** one primary selected; nested routes inherit parent primary highlight.
5. **Vocabulary:** prefer Today / Briefing over “Dashboard”; prefer Insights over “AI”; prefer Knowledge over “Graph” in nav (graph remains the visual metaphor inside Knowledge).

---

## 4. Shell Chrome

Persistent across authenticated product routes:

```
┌──────────────────────────────────────────────────────────────────┐
│ [Mark] ExecutiveOS    Today Decisions Insights Actions Knowledge Reports │
│                        · Outcome Health {score} · Attention {n}/{budget} │
│                                            [Account]                    │
└──────────────────────────────────────────────────────────────────┘
│                                                                      │
│                         { page content }                             │
│                                                                      │
└──────────────────────────────────────────────────────────────────┘
```

| Chrome element | Behaviour |
|----------------|-----------|
| **Outcome Health** | Always visible; click → Outcomes health drill-down (Initiatives/health filtered by strategic outcomes) |
| **Attention Budget** | Optional P0 companion; shows cognitive load of open priorities |
| **Account menu** | Profile, Organisation, Team, Billing, Integrations, Sign out; System admin if entitled |
| **Command / judgment palette** | `⌘K` navigation; `/` judgment commands (Phase 2) |

Chief of Staff conversational UI is **not** a primary nav item. Entry points: Today (“Ask…”), Insights, and command palette → route `/assistant` (or Insights sub-route) as a secondary surface.

---

## 5. Route Map

### 5.1 Primary & aliases

| Route | Primary | Notes |
|-------|---------|-------|
| `/today` | Today | Canonical Executive Briefing |
| `/dashboard` | Today | Temporary redirect/alias → `/today` |
| `/decisions` | Decisions | Register + detail |
| `/decisions/[id]` | Decisions | Decision detail / timeline |
| `/insights` | Insights | Advisor consultation hub |
| `/advisors` | Insights | Temporary alias → `/insights` |
| `/actions` | Actions | Unified action queue (new composition) |
| `/knowledge` | Knowledge | Graph + memory entry |
| `/graph` | Knowledge | Temporary alias → `/knowledge` |
| `/reports` | Reports | List + generate/export |
| `/assistant` | Insights (secondary) | Chief of Staff; highlight Insights or none |

### 5.2 Utility (not primary)

| Route | Placement |
|-------|-----------|
| `/organization`, `/team` | Account → Organisation |
| `/settings/organization`, `/settings/billing`, `/settings/integrations` | Account → Settings |
| `/calendar` | Linked from Today (rhythm) and Actions; **not** primary nav — calendar is input to Briefing |
| `/initiatives` | Linked from Outcome Health, Actions, Knowledge; outcome execution detail |
| `/meetings` | Linked from Today timeline & Actions |
| `/onboarding`, `/get-started` | Pre-product / activation |
| `/admin/system` | Entitled admins only |
| `/sign-in`, `/auth/callback` | Auth |

### 5.3 Migration principle

Prefer **aliases and redirects** over big-bang URL breaks for beta users. Primary labels change in the shell first; canonical paths (`/today`, `/insights`, `/knowledge`, `/actions`, `/reports`) land as routes become real.

---

## 6. Executive Briefing (Today) — Content Architecture

**Personalisation:** strategic outcomes first. Role does not reorder priority.

### Information priority

| Priority | Content | Principle |
|----------|---------|-----------|
| P0 | Outcome-linked items requiring judgment today | Outcome Before Interface |
| P1 | Lead brief (single headline + why + recommended next step) | Explain Before Recommend |
| P2 | Supporting signals (≤3–5) | Signal Over Noise |
| P3 | Next calendar commitments (context, not the hero) | Context Before Data |
| P4 | Outcome Health summary (also in chrome) | Persistent health |
| P5 | Deferred depth: advisors, graph peek, full card grid | Progressive Disclosure of Intelligence |

### Explicit non-goals for Today

- Chat-first empty state
- Equal-weight widget dashboard
- Role-based home that hides another executive’s outcome risks
- Charts above the decision question

Legacy layout reference: `INTELLIGENCE_CENTER_UX.md` — use only where compatible with Briefing OS + outcomes; otherwise ignore.

---

## 7. Secondary Surfaces by Primary

### Decisions

- Register (table/list), filters by status and linked outcome
- Detail: question → context → explanation → recommendation → Approve / Defer / Delegate
- Decision Stamp on commit (signature)

### Insights

- Advisor team entry; collaborative consultation
- Chief of Staff as orchestrated conversation (secondary)
- Insight archive tied to outcomes
- Always: explanation before recommendation

### Actions

- Unified queue: open commitments, delegated items, initiative moves, meeting follow-ups
- Each action links to parent Decision / Outcome / Meeting where known
- Empty state prompts outcome-linked first action — not feature tour

### Knowledge

- Knowledge graph explorer (architectural visual language from workshops)
- Executive Memory capture / browse
- Entity → Context Ring (later phase)
- Default: subgraph around active outcomes, not full mesh

### Reports

- Board / weekly / portfolio narratives
- Export aesthetic (Ledger / institutional)
- Beta: minimal viable “generate brief PDF / share pack”; expand per product roadmap

---

## 8. Cross-Cutting Objects

| Object | Lives primarily in | Surfaces elsewhere |
|--------|--------------------|--------------------|
| Strategic outcome / objective | Today personalisation + Outcome Health | Decisions, Actions, Knowledge, Reports |
| Decision | Decisions | Today, Reports |
| Initiative | Actions + Outcome Health | Today, Knowledge |
| Meeting / calendar event | Today, Actions | Knowledge |
| Advisor insight | Insights | Today (summaries only) |
| Memory node | Knowledge | Insights, Reports |
| Integration sync state | Account → Integrations | Today meta (“Sync … ago”) |

---

## 9. Onboarding → First Briefing

Activation still builds the Executive Digital Twin (see Concierge Onboarding), with this IA constraint:

1. Capture **strategic outcomes** before feature tourism.
2. First successful landing after onboarding = **Today / Executive Briefing** with ≥1 outcome-linked signal.
3. Role fields are collected for context; they must not drive the first priority sort.

---

## 10. Accessibility & Motion (IA implications)

- Primary nav: keyboard reachable in order; skip link to main content retained.
- Outcome Health: not colour-only (score + label + optional trend).
- Route changes: fade ≤200ms (Motion is Communication); respect `prefers-reduced-motion`.
- Touch targets ≥44px on mobile primary bar.

---

## 11. Open Implementation Questions (non-blocking for approval)

| Question | Proposed default |
|----------|------------------|
| Redirect `/dashboard` → `/today` immediately? | Yes, 308/redirect in Phase 1 |
| Calendar primary later? | No — remains utility feeding Today |
| Actions v1 data source | Merge initiative follow-ups + meeting actions + explicit todos if present |
| Reports v1 | Single “Executive brief export” stub behind nav for IA completeness |

---

## 12. Approval

| Artefact | Status |
|----------|--------|
| Information Architecture v1.0 | Awaiting founder approval |
| Implementation of AppShell + routes | **Blocked** |

---

*Related: [`FRONTEND_DECISION_RECORD.md`](./FRONTEND_DECISION_RECORD.md) · [`studio/06-intelligence-center-concepts.md`](./studio/06-intelligence-center-concepts.md) · Product [`ROADMAP.md`](../business/ROADMAP.md)*
