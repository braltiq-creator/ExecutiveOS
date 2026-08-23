# Sprint 4A — Executive Intent Engine Design Package

**Status:** Approved and implemented (Sprint 4B)  
**Date:** 2026-07-20  
**Phase:** Sprint 4A design → Sprint 4B implementation  
**Note:** Sprint 4B field set uses `narrative`, `horizon`, `reviewDate`, `reviewCadence`, `priority`, and `nonFocusOutcomeIds` (id-only) as ratified in ADR-006.  
**Constraints:** Constitution v1 · ADRs 001–005 · no implementation · no Supabase · no AI · no analytics  
**Engine name:** Executive Intent Engine  
**Product language:** Intent · Strategic focus · Mandate (not “goals”, “OKRs”, or “targets tracker”)  

**Related:** [`SPRINT_4_EXECUTION_ENGINE_DESIGN.md`](./SPRINT_4_EXECUTION_ENGINE_DESIGN.md) (Execution; its prior ADR-006 sketch renumbers to **ADR-007** if Intent claims ADR-006)

---

## 1. Executive summary

The **Executive Intent Engine** establishes the executive’s **current strategic focus** — the framing context that explains *why* outcomes, decisions, and execution matter **now**.

| Concept | Role |
|---------|------|
| **Intent** | Current strategic focus / mandate for a horizon (context) |
| **Outcome** | What leadership is trying to achieve (personalisation & measurement axis) |
| **Decision** | Judgment that commits direction under that focus |
| **Action** | Commitment that executes judgment toward outcomes |

**Critical distinction:** Intent is **not** goal tracking. It does not compete with Outcomes as a %complete scorecard, KPI tree, or OKR app. It answers:

1. What am I trying to advance in this period?  
2. What is explicitly **not** the focus?  
3. What constraints shape judgment?  
4. Which outcomes are **in focus** vs watching?

**Design intent (locked for this package):**

1. Canonical Intent lives on **`OutcomePortfolio`** (single current `intent`, optional `intentHistory`).  
2. Outcomes remain the **personalisation axis** (Constitution Art. II.10 / ADR-001); Intent **weights and frames** — it does not replace outcome ranking with role or vanity goals.  
3. Intent **references** outcomes (`focusOutcomeIds`); it does not embed duplicate outcome business state.  
4. **`IntentProvider`** derives focus views only; OutcomeProvider remains the writable SoT.  
5. Provider order (with Intent; Execution when approved):  
   `Outcome → Intent → Decision → Execution → Intelligence → ExecutiveBriefing`  
6. **No seventh primary nav item** — Intent surfaces via Briefing + utility/deep route.  
7. Mock-first. No persistence, AI, or analytics.

**On approval:** ADR-006 (this package) · Domain Model amendment · Constitution updates in §13 · Execution design ADR renumbered to 007.

---

## 2. Domain model

### 2.1 Mental model

```
┌─────────────────────────────────────────┐
│         Executive Intent                │
│   (strategic focus · horizon · bounds)  │
└───────────────────┬─────────────────────┘
                    │ frames / weights
                    ▼
┌─────────────────────────────────────────┐
│         Strategic Outcomes              │
│     (personalisation + health axis)     │
└───────────────────┬─────────────────────┘
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   Decisions    Insights    Actions
        │                       │
        └───────────┬───────────┘
                    ▼
            Outcome movement
```

**Loop:**

1. Intent sets the period’s focus, non-focus, and constraints.  
2. Outcomes in focus receive priority attention in Briefing and queues.  
3. Decisions and Actions are interpreted against Intent (“does this serve the mandate?”).  
4. Intent does **not** auto-score; health stays on Outcomes.

### 2.2 Aggregate ownership

```
OutcomePortfolio
  ├── intent: ExecutiveIntent            ← Intent Engine (canonical current)
  ├── intentHistory?: ExecutiveIntent[]  ← prior periods (optional mock)
  ├── outcomes: Outcome[]
  ├── decisions: Decision[]
  └── actions: ExecutiveAction[]         ← when Execution ships
```

**Invariant I1:** Exactly one **current** `intent` on the portfolio.  
**Invariant I2:** Every `focusOutcomeIds` entry resolves to a portfolio outcome.  
**Invariant I3:** Intent never stores decision/action business state — only ids / narrative framing.  
**Invariant I4:** Priority ranking remains outcome-based; Intent may **boost** focus outcomes and **demote** explicit non-focus, but cannot invent a parallel goal store.

### 2.3 Anti-model (rejected)

| Rejected shape | Why |
|----------------|-----|
| Intent as OKR list with % complete | Goal tracking; violates purpose |
| Intent replaces Outcomes | Breaks ADR-001 / Constitution personalisation |
| Role-based Intent templates as priority | Roles are contextual only |
| Chat-defined Intent as product home | Anti-AI checklist / OS framing |
| Charts of “intent progress” | No analytics |

---

## 3. Entity definitions

### 3.1 `ExecutiveIntent` (canonical)

| Field | Type | Notes |
|-------|------|--------|
| `id` | string | Stable id |
| `title` | string | Short focus name (e.g. “Enterprise conversion half”) |
| `statement` | string | Mandate in plain executive language (1–3 sentences) |
| `horizonLabel` | string | e.g. “This half”, “Next 90 days” |
| `startsOn` | string | Horizon start |
| `endsOn` | string | Horizon end |
| `status` | `IntentStatus` | `active` \| `draft` \| `superseded` |
| `focusOutcomeIds` | string[] | Outcomes **in strategic focus** (≥1 recommended) |
| `watchingOutcomeIds` | string[] | Outcomes monitored but not primary focus |
| `nonFocus` | `IntentBoundary[]` | Explicit “not now” boundaries |
| `constraints` | `IntentConstraint[]` | Hard bounds on judgment |
| `successSignals` | `IntentSignal[]` | Qualitative “we’ll know we’re succeeding when…” — **not** KPI charts |
| `risksToIntent` | `IntentRisk[]` | What could break the mandate |
| `owner` | string | Usually the executive |
| `stakeholders` | `IntentStakeholder[]` | Who must stay aligned |
| `whatChanged` | string | Signal triad for Briefing |
| `why` | string | Why this focus now |
| `whatShouldHappenNext` | string | Near-term judgment posture |
| `recommendation` | RecommendationFields | Impact / confidence / owner / deadline meta |
| `timeline` | `IntentTimelineEvent[]` | Focus shifts, supersessions |
| `confidence` | number | Confidence that this is the right focus |

### 3.2 Supporting entities

| Entity | Essence |
|--------|---------|
| **IntentStatus** | `active` \| `draft` \| `superseded` |
| **IntentBoundary** | id, label, explanation — “Not focusing on X this horizon” |
| **IntentConstraint** | id, label, kind (`capital` \| `talent` \| `time` \| `risk` \| `board` \| `other`), explanation |
| **IntentSignal** | id, label, narrative — qualitative success signal |
| **IntentRisk** | id, title, severity (`critical` \| `attention` \| `watch`), explanation, relatedOutcomeId? |
| **IntentStakeholder** | id, name, role, stance (`sponsor` \| `aligned` \| `informed`), note |
| **IntentTimelineEvent** | id, at, title, detail, kind (`activated` \| `amended` \| `boundary` \| `superseded` \| `note`) |

### 3.3 Derived projections

| Type | Purpose |
|------|---------|
| **IntentContext** | Compact framing for shell/Briefing (title, statement, horizon, focus outcome names) |
| **FocusOutcomeSet** | Resolved focus + watching outcomes with health summaries |
| **IntentAlignment** | For a Decision/Action: `aligned` \| ` tangential` \| `out_of_focus` + explanation (derived, mock rules) |

### 3.4 Explicit non-entities

- OKR key results with scores  
- Goal trees / cascaded objectives  
- Intent “completion %”  
- Analytics dashboards  

---

## 4. Relationships to Outcomes, Decisions, and Execution

### 4.1 Intent ↔ Outcomes

| Rule | Detail |
|------|--------|
| Focus | `focusOutcomeIds` mark outcomes that dominate Briefing personalisation boost |
| Watching | `watchingOutcomeIds` remain visible in Outcome Health but lower Briefing weight |
| Unlisted | Portfolio outcomes not listed stay valid; default weight between watching and ignored |
| Non-focus | `nonFocus` may name themes **or** point at outcomes to demote |
| Ownership | Outcome health/state stays on Outcome Engine only |

**Personalisation formula (conceptual, mock-era):**

1. Start with outcome-based severity (health, decisions due, blocked actions).  
2. Boost items linked to `focusOutcomeIds`.  
3. Soft-demote `watching` / `nonFocus`.  
4. Never rank by role title.

### 4.2 Intent ↔ Decisions

| Rule | Detail |
|------|--------|
| No required FK | Decisions keep `outcomeIds`; Intent alignment is **derived** |
| Decision detail | Show Intent alignment strip (“Serves: Enterprise conversion focus”) |
| Out-of-focus decisions | Allowed (reality intrudes); flag as tangential — do not hide |
| New decisions | Prefer focus outcomes; do not block creation outside focus |

### 4.3 Intent ↔ Execution (Actions)

| Rule | Detail |
|------|--------|
| No required FK on Action | Alignment derived via shared outcomes |
| Action queue | Boost actions on focus outcomes |
| Briefing Recommended Actions | Intent-weighted via Execution derive inputs |
| Blocked focus actions | Highest Intent-relevant attention |

### 4.4 Relationship diagram

```
ExecutiveIntent
  ├── focusOutcomeIds[] ──► Outcome
  ├── watchingOutcomeIds[] ──► Outcome
  └── (derived) alignment ──► Decision / ExecutiveAction
         via shared outcomeIds
```

---

## 5. Provider architecture

### 5.1 Composition (extends ADR-003; proposes ADR-006)

```
OutcomeProvider                 ← SoT: intent, outcomes, decisions, [actions]
  → IntentProvider              ← NEW: derives IntentContext, FocusOutcomeSet, alignment helpers
    → DecisionProvider
      → ExecutionProvider       ← when Sprint 4 Execution approved (ADR-007)
        → IntelligenceProvider
          → ExecutiveBriefingProvider
```

If Execution is not yet approved, ship Intent as:

```
Outcome → Intent → Decision → Intelligence → ExecutiveBriefing
```

### 5.2 Responsibilities

| Provider | Owns | Exposes |
|----------|------|---------|
| **OutcomeProvider** | `portfolio.intent` (+ history) | portfolio including intent |
| **IntentProvider** | nothing writable | `intent`, `context`, `focusOutcomes`, `watchingOutcomes`, `alignDecision(id)`, `alignAction(id)` |
| Downstream | unchanged roles | Consume Intent for ranking hints |

### 5.3 IntentProvider API (design)

```
useIntent():
  intent: ExecutiveIntent
  context: IntentContext
  focusOutcomes: FocusOutcomeSet
  watchingOutcomes: FocusOutcomeSet
  alignDecision(decisionId): IntentAlignment
  alignAction(actionId): IntentAlignment   // when Execution exists
```

### 5.4 Module layout (proposed)

`src/lib/intent/`

| Module | Role |
|--------|------|
| `engine-types.ts` | Intent entities |
| `derive.ts` | context, focus sets, alignment, ranking weights |
| `index.ts` | exports |

Mock authorship stays in `mock-portfolio.ts` (or adjacent mock) — **one portfolio file**, not a second Intent store.

### 5.5 Single-source-of-truth rules

1. No `IntentProvider` local copy of outcomes/decisions/actions.  
2. No Briefing-local Intent object divorced from portfolio.  
3. Amendments to Intent (mock-era) go through OutcomeProvider only.

---

## 6. Route strategy

Constitution: **no seventh primary nav item.**

| Route | Placement | Purpose |
|-------|-----------|---------|
| `/intent` | **Utility** (Account / command palette / Briefing CTA) | Intent detail — full mandate, boundaries, constraints |
| `/today` | Primary **Today** | Intent context strip / section (primary daily exposure) |
| `/outcomes` | Utility | Show focus vs watching badges from Intent |

**Rejected:** `/intent` as primary nav peer to Today/Decisions/…  

**Active nav highlight:** `/intent` does **not** steal a primary; treat like `/outcomes` (utility). Optional: no primary selected, or keep previous — prefer **none** or soft highlight none.

**Command palette:** “Strategic focus”, “Intent”, “Mandate” → `/intent`.

**Deep links:** Briefing Intent section → `/intent`; Outcome cards may badge “In focus”.

---

## 7. Component hierarchy

### 7.1 Briefing (primary exposure)

```
ExecutiveBriefing
  ├── IntentContextStrip          ← NEW (below header / above summary)
  │     ├── Title + horizon
  │     ├── Statement (one sentence)
  │     └── Focus outcome chips → /outcomes/[id]
  ├── ExecutiveSummary
  ├── OutcomeHealthSection        ← may label focus vs watching
  └── … existing sections
```

### 7.2 Intent detail (utility)

```
/intent
  AppShell
    IntentDetailView
      ├── PageHeader + Board Mode
      ├── SignalPanel (What / Why / Next)
      ├── MandateStatement
      ├── FocusOutcomesPanel
      ├── WatchingOutcomesPanel
      ├── NonFocusBoundariesPanel
      ├── ConstraintsPanel
      ├── SuccessSignalsPanel      ← narrative, not charts
      ├── RisksToIntentPanel
      ├── StakeholdersPanel
      └── TimelinePanel
```

### 7.3 Cross-surface embeds

| Host | Embed |
|------|-------|
| Decision detail | `IntentAlignmentStrip` |
| Action detail | `IntentAlignmentStrip` (post-Execution) |
| Outcome portfolio/detail | `FocusBadge` (`In focus` / `Watching`) |
| Shell (optional stretch) | Omit from Sprint 4A MVP — avoid chrome clutter; Briefing strip is enough |

### 7.4 Design restraint

- No progress rings for Intent.  
- No OKR scorecards.  
- Cards only where interaction requires.  
- EOS tokens; Inter / Geist / Geist Mono per ADR-005.

---

## 8. Mock data model

### 8.1 One active Intent

Author a single `active` Intent aligned to the existing enterprise mock (Helix / ARR / focus-time themes), e.g.:

- **Title:** “Enterprise conversion & leadership bandwidth”  
- **Horizon:** current half / 90 days  
- **focusOutcomeIds:** 2–3 hottest outcomes  
- **watchingOutcomeIds:** 1–2 others  
- **nonFocus:** 2–3 explicit boundaries (e.g. “No new geo expansion this half”)  
- **constraints:** capital, talent, board cadence  
- **successSignals:** 3 qualitative narratives  
- **risksToIntent:** 2–3 with optional outcome links  
- Full signal triad + recommendation meta  

### 8.2 Optional history

1 superseded Intent (prior quarter) for timeline/demo only.

### 8.3 Consistency checklist

1. All focus/watching ids exist on portfolio.  
2. Intent `whatChanged` / `why` coherent with overnight/briefing lead.  
3. At least one priority decision and one recommended action land on a focus outcome.  
4. At least one tangential decision exists to demo alignment strip.

---

## 9. Executive workflows

### W1 — Boot the day (Briefing)

1. Open `/today`.  
2. Read Intent strip — confirm mandate still true.  
3. Scan Outcome Health / Priority Decisions through that lens.  
4. Act on judgment; Intent rarely needs editing daily.

### W2 — Challenge the mandate

1. From Briefing → `/intent`.  
2. Review boundaries and constraints.  
3. If reality shifted, amend mock Intent (status/timeline) — judgment about focus, not task updates.

### W3 — Decision under Intent

1. Open decision.  
2. See alignment (aligned / tangential / out of focus).  
3. Decide whether to proceed anyway (allowed) or defer as non-focus.

### W4 — Protect non-focus

1. Open Intent boundaries.  
2. Use “not now” language in board/team conversations.  
3. Avoid creating execution churn outside focus unless forced.

### W5 — Board narrative

1. Board Mode on `/intent` or Briefing.  
2. Present statement, focus outcomes, constraints, risks — no charts.

---

## 10. Executive Briefing integration

| Integration | Spec |
|-------------|------|
| **IntentContextStrip** | Persistent near top of Briefing (after page header) |
| Content | Title · horizon · one-line statement · 2–3 focus chips |
| CTA | “Review focus” → `/intent` |
| Ranking | Intelligence/Briefing derive apply Intent weights to decisions/actions/insights |
| Executive Summary | May reference Intent in `why` / headline when mock-authored |
| Cap | Strip stays one composition unit — no second dashboard |

**Three questions still govern the page;** Intent answers a prior framing question: *What are we trying to advance?* without replacing attention triage.

---

## 11. Board Mode behaviour

| Behaviour | Spec |
|-----------|------|
| Toggle | On Intent detail; optional on Briefing (existing) |
| Intent detail | Large statement, focus outcomes, constraints, risks; demote timeline density |
| Briefing | Existing Board Mode; Intent strip remains visible but calmer (more type, fewer chips) |
| Forbidden | Progress visualisations, score grids |
| A11y | `aria-pressed` on toggle |

---

## 12. Accessibility considerations

| Requirement | Application |
|-------------|-------------|
| WCAG AA | Contrast on dark-first Intent strip and detail |
| Keyboard | Full `/intent` operable; chips are links/buttons |
| Focus | Visible rings; strip not a keyboard trap |
| Colour | Focus vs Watching badges include text, not colour alone |
| Semantics | Strip is a `region` with aria-label “Strategic focus” |
| Motion | Minimal; respect `prefers-reduced-motion` |
| Time pressure | One sentence statement max in strip; detail for depth |

---

## 13. Constitution updates (proposed)

Apply **only after** design approval (governance edit, not feature code).

### 13.1 Article IV — Domain & Data Rules (add)

5a. **Executive Intent** on `OutcomePortfolio` frames strategic focus for the period; it does not replace Outcomes as the personalisation axis.  
5b. Intent references outcomes by id; it must not duplicate outcome, decision, or action business state.  
5c. Provider order includes Intent immediately inside Outcome:  
    `Outcome → Intent → Decision → [Execution] → Intelligence → ExecutiveBriefing`.

*(Renumber subsequent rules as needed.)*

### 13.2 Article III — Information Architecture (add)

9. **Intent** is utility/Briefing context, **not** a seventh primary nav item. Default exposure is the Executive Briefing Intent strip; full detail at `/intent`.

### 13.3 Article VII — Product Surface Maturity (add row)

| Surface | Status |
|---------|--------|
| Executive Intent Engine (`/intent` + Briefing strip) | Implemented (mock) — after Sprint 4A build |

### 13.4 Article II note (clarification)

Add under principle 10: *Outcome-Based Personalisation is framed by Executive Intent (focus/watching/non-focus) but is not replaced by goal-tracking systems.*

### 13.5 Companion docs

- Amend `DOMAIN_MODEL.md` with Intent aggregate.  
- Amend IA mental model diagram to show Intent above Outcomes.  
- Update `CONSTITUTION_INCONSISTENCIES.md` after implementation.

---

## 14. ADR-006 proposal

# ADR-006: Executive Intent Engine as Focus Context

**Status:** Proposed  
**Date:** 2026-07-20  
**Deciders:** Founder, Principal Frontend Architect  
**Sprint:** 4A  
**Depends on:** ADR-001, ADR-003  
**Supersedes in part:** ADR-003 provider list (order amendment only)  
**Coordination:** Sprint 4 Execution Engine ADR becomes **ADR-007** (actions on portfolio + ExecutionProvider placement)

### Context

Executives need a durable statement of **current strategic focus** so Briefing, Decisions, and Actions are interpretable. Without Intent, the product risks feeling like a queue of outcomes without mandate. With a naïve “goals” module, it risks becoming OKR software and violating Outcome-Before-Interface.

### Decision

1. Introduce **Executive Intent** as canonical `OutcomePortfolio.intent`.  
2. Intent **frames and weights** outcomes; Outcomes remain the personalisation and health SoT (ADR-001).  
3. **`IntentProvider`** derives context/alignment; it does not own a parallel store.  
4. Provider order becomes:  
   `OutcomeProvider → IntentProvider → DecisionProvider → (ExecutionProvider) → IntelligenceProvider → ExecutiveBriefingProvider`.  
5. Product exposure: Briefing strip + utility route `/intent` — **not** primary nav.  
6. Explicit non-goals: OKR tracking, completion %, analytics charts, AI-generated mandates.  
7. Mock-first until a persistence ADR.

### Consequences

**Positive:** Clear mandate; better “why” on Briefing; alignment cues on decisions/actions; preserves SoT hierarchy.  
**Negative:** Another provider layer; must discipline authors against goal-tracker UX; Intent/Execution ADR numbering coordination.

### Alternatives considered

| Alternative | Why rejected |
|-------------|--------------|
| Intent as primary nav #7 | Violates Constitution Art. III |
| Intent replaces Outcomes | Violates ADR-001 |
| OKR/% complete Intent | Goal tracking; wrong category |
| Intent owned only by Briefing | Dual SoT risk |
| Role-based focus packs | Conflicts with outcome-based personalisation |

### References

- Constitution Arts. I–IV (proposed amendments §13 of Sprint 4A design)  
- `SPRINT_4A_INTENT_ENGINE_DESIGN.md`  
- FDR personalisation axis  

---

## 15. Risks and edge cases

| ID | Risk / edge | Mitigation |
|----|-------------|------------|
| R1 | Intent becomes OKR product | Hard non-goals; review UI against anti-model |
| R2 | Intent duplicates Outcome descriptions | Intent = mandate/boundaries; Outcomes = results |
| R3 | Empty `focusOutcomeIds` | Warn in derive; Briefing falls back to pure outcome severity |
| R4 | Stale Intent vs reality | Timeline + mock amend workflow; confidence field |
| R5 | Everything marked focus | Guidance: 2–4 focus outcomes max in mock |
| R6 | Seventh nav pressure | Constitution + ADR-006 forbid |
| R7 | Conflict with Execution ADR number | Intent = 006; Execution = 007 |
| R8 | Alignment false negatives | Tangential ≠ hidden; allow out-of-focus work |
| R9 | Shell chrome overload | No persistent Intent ribbon in MVP — Briefing strip only |
| R10 | Role templates sneak in | No role-based Intent packs in Sprint 4A |
| R11 | Analytics “intent health” | Forbidden; risks stay narrative |
| R12 | Dual writable Intent | Only OutcomeProvider writes |

---

## 16. Exit criteria for implementation

Implementation may be accepted when **all** apply:

### Governance

- [ ] ADR-006 accepted  
- [ ] Execution design ADR renumbered to 007 (if still proposed/accepted)  
- [ ] Constitution updates (§13) applied  
- [ ] `DOMAIN_MODEL.md` + IA mental model updated  
- [ ] Inconsistencies log updated post-ship  

### Architecture

- [ ] `OutcomePortfolio.intent` is canonical  
- [ ] Provider order: Outcome → **Intent** → Decision → …  
- [ ] No parallel Intent store in Briefing  
- [ ] No Supabase / AI / analytics  
- [ ] No seventh primary nav item  

### Product

- [ ] Briefing **IntentContextStrip** live  
- [ ] `/intent` detail with mandate, focus/watching, boundaries, constraints, risks, timeline  
- [ ] Focus/Watching badges on outcome surfaces  
- [ ] Intent alignment strip on decision detail  
- [ ] Board Mode on Intent detail  
- [ ] Mock Intent coherent with portfolio  

### Quality

- [ ] Unit tests for intent `derive` (focus resolution, alignment, ranking weights)  
- [ ] `npm test` + `npm run build` pass  
- [ ] AA contrast + keyboard on strip and detail  
- [ ] Empty/missing focus safe fallback  

### Explicit non-goals (must remain out)

- [ ] No OKR/% complete UI  
- [ ] No intent analytics charts  
- [ ] No AI mandate generation  
- [ ] No persistence  

---

## Appendix — Vocabulary

| Prefer | Avoid |
|--------|--------|
| Intent, strategic focus, mandate | Goals app, OKRs, targets tracker |
| In focus / Watching / Not now | Red/amber goal RAG as hero |
| Boundaries, constraints | Cascaded objective trees |
| Success signals (narrative) | Progress % rings |

---

**End of design package.** Stop — awaiting review before any implementation.
