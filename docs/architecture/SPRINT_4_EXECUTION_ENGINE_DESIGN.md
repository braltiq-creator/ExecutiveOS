# Sprint 4 — Execution Engine Design Package

**Status:** Proposed (awaiting founder review)  
**Date:** 2026-07-20  
**Phase:** Sprint 4 Planning — architecture only  
**Constraints:** Constitution v1 · ADRs 001–005 · no implementation · no Supabase · no AI · no analytics  
**Product surface:** Primary nav **Actions** (`/actions`)  
**Engine name:** Execution Engine  

---

## 1. Executive summary

The **Execution Engine** closes the loop between **strategic decisions** and **measurable outcomes**.

| Concept | Role |
|---------|------|
| **Outcome** | What leadership is trying to achieve (personalisation axis) |
| **Decision** | Judgment that commits direction |
| **Action** | Commitment to execute — the work that moves the outcome |

Today, outcomes carry thin `pendingActions` refs and the Briefing shows Recommended Actions, but there is no first-class action store, queue, or detail surface. Sprint 4 designs that engine so **Actions** becomes a real primary destination — not a task manager, not an initiative board, and not a chart surface.

**Design intent (locked for this package):**

1. Actions live on **`OutcomePortfolio`** as the canonical store (same pattern as Decisions).  
2. Every action **must** link to ≥1 outcome — **no standalone actions**.  
3. Actions **may** link to a decision (commitment born from judgment) but need not.  
4. **`ExecutionProvider`** derives queue/detail/priority from Outcome (+ Decision context); it does not own a parallel store.  
5. Provider order becomes:  
   `Outcome → Decision → Execution → Intelligence → ExecutiveBriefing`  
6. UI answers the three questions: what requires attention, why (outcome/decision stakes), what should happen next.  
7. Mock-first only. No persistence, AI, or analytics charts.

**Proposed governance follow-up (on approval):** **ADR-007** (Execution Engine; ADR-006 reserved for Intent Engine per Sprint 4A) + Domain Model amendment + Constitution Article VII maturity update.

---

## 2. Domain model

### 2.1 Mental model

```
                    Strategic Outcomes
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
         Decisions      Insights      Actions ◄── Execution Engine
              │                           │
              └─────────── commits ───────┘
                            │
                            ▼
                    Measurable outcome movement
                    (health / blockers / timeline)
```

**Loop:**

1. Outcome health / insight signals demand attention.  
2. Decision records judgment.  
3. Action records the commitment that executes the judgment.  
4. Action progress / blockage feeds Outcome Health and Briefing priority.

### 2.2 Aggregate ownership

```
OutcomePortfolio
  ├── outcomes: Outcome[]
  ├── decisions: Decision[]          ← Decision Engine (existing)
  └── actions: ExecutiveAction[]     ← Execution Engine (new canonical store)
```

**Invariant A:** `action.outcomeIds.length >= 1`  
**Invariant B:** If `action.decisionId` is set, that decision must exist on the portfolio and share ≥1 outcome with the action.  
**Invariant C:** Outcome action linkage uses ids (`actionIds[]`); thin briefing refs are **derived**, not a second store.  
**Invariant D:** Legacy meeting/initiative “actions” remain operational feeds — they do not become the Execution Engine SoT in Sprint 4.

### 2.3 Relationship to existing `OutcomeActionRef`

| Today | Sprint 4 target |
|-------|-----------------|
| `Outcome.pendingActions: OutcomeActionRef[]` embeds mini-action state | Prefer `Outcome.actionIds: string[]` + portfolio `actions[]` |
| Briefing derives Recommended Actions by flattening `pendingActions` | Briefing derives via **ExecutionProvider** priority list |

**Migration within Sprint 4 implementation (when approved):**

- Mock portfolio authors full `ExecutiveAction` records.  
- Derive keeps `OutcomeActionRef`-shaped projections for Outcome detail cards **or** Outcome detail reads from ExecutionProvider by `actionIds`.  
- Do not leave two writable stores.

---

## 3. Entity definitions

### 3.1 `ExecutiveAction` (canonical)

| Field | Type | Notes |
|-------|------|--------|
| `id` | string | Stable id |
| `title` | string | Commitment label (UI: action title) |
| `description` | string | Context for judgment under time pressure |
| `outcomeIds` | string[] | **Required, ≥1** |
| `decisionId` | string \| null | Optional parent decision |
| `status` | `EngineActionStatus` | See §3.2 |
| `priority` | `critical` \| `attention` \| `normal` | Queue ranking input (with outcome health) |
| `owner` | string | Accountable person |
| `delegatedTo` | string \| null | Executor if different from owner |
| `deadline` | string | ISO date or display date |
| `confidence` | number | Confidence that this commitment is the right next move |
| `businessImpact` | string | Stakes |
| `expectedOutcomeImpact` | string | How completion moves linked outcomes |
| `costOfDelay` | string | What slips if blocked/late |
| `whatChanged` | string | Signal triad |
| `why` | string | Signal triad |
| `whatShouldHappenNext` | string | Signal triad |
| `blockers` | `ActionBlocker[]` | Execution impediments |
| `dependencies` | `ActionDependency[]` | Action↔Action |
| `stakeholders` | `ActionStakeholder[]` | Informed / accountable / consult |
| `timeline` | `ActionTimelineEvent[]` | Chronology |
| `history` | `ActionHistoryEntry[]` | Status transitions |
| `checklist` | `ActionCheckpoint[]` | Lightweight progress markers (not a PM task tree) |
| `recommendationSummary` | string | Explain-before-recommend close |

### 3.2 `EngineActionStatus`

| Status | Meaning |
|--------|---------|
| `pending` | Committed, not started |
| `in_progress` | Actively executing |
| `blocked` | Cannot proceed; blocker required |
| `waiting` | Waiting on external dependency / decision |
| `done` | Complete; outcome impact expected |
| `cancelled` | No longer pursuing |
| `overdue` | Past deadline and not done (may be derived and/or stored) |

**Rule:** `overdue` may be **derived** from `deadline` + status for queue badges; store may still keep `pending`/`in_progress`/`blocked`.

### 3.3 Supporting entities

| Entity | Fields (essence) |
|--------|------------------|
| **ActionBlocker** | id, title, description, severity (`critical` \| `attention` \| `watch`), owner, since |
| **ActionDependency** | id, relatedActionId, relatedActionTitle, relationship (`blocks` \| `blocked_by` \| `related_to`), explanation |
| **ActionStakeholder** | id, name, role, stance (`accountable` \| `responsible` \| `consulted` \| `informed`), note |
| **ActionTimelineEvent** | id, at, title, detail, kind (`opened` \| `status` \| `blocker` \| `decision` \| `note` \| `done`) |
| **ActionHistoryEntry** | id, at, status, note, actor |
| **ActionCheckpoint** | id, label, done, doneAt? |

### 3.4 Derived projections

| Type | Purpose |
|------|---------|
| **ActionQueueItem** | `ExecutiveAction` + `outcomeNames` + `primaryOutcomeId` + `decisionQuestion?` + `overdue` |
| **PriorityAction** | Briefing-shaped recommended action (maps to existing `RecommendedAction`) |
| **ActionPortfolioSummary** | Counts by status, blocked count, due-today count (narrative metrics — **not** charts) |

### 3.5 Explicit non-entities (out of scope)

- Sprint velocity, burndown, analytics dashboards  
- Full initiative WBS / Gantt  
- AI-generated action plans  
- Supabase persistence models  

---

## 4. Relationships to Outcomes and Decisions

### 4.1 Outcome ↔ Action

| Direction | Mechanism |
|-----------|-----------|
| Action → Outcome | `outcomeIds[]` (required) |
| Outcome → Action | `actionIds[]` on Outcome (replacing embedded writable `pendingActions` over time) |
| Priority | Outcome health / status / personalisation ranks which actions surface first |

**No orphan actions.** Creating an action without an outcome is invalid.

### 4.2 Decision ↔ Action

| Pattern | Rule |
|---------|------|
| Decision commits action | `action.decisionId = decision.id`; share ≥1 outcome |
| Action without decision | Allowed for operational follow-ups still tied to outcomes (e.g. unblock hiring band) |
| Decision detail | Shows **Committed Actions** list derived from ExecutionProvider |
| Action detail | Shows **Parent Decision** when present (question + link) |

### 4.3 Outcome Health feedback (conceptual, mock-era)

Mock narrative only in Sprint 4:

- Blocked / overdue actions on an outcome contribute to “why” copy and attention ranking.  
- Completing an action may appear on Outcome timeline as `kind: "action"`.  
- **No** automatic numeric health-score algorithm redesign in Sprint 4 (avoid analytics engine scope). Health numbers remain authored in mock portfolio; Execution Engine **explains** and **queues**, it does not become a scoring science project.

### 4.4 Legacy operational systems

| System | Relationship |
|--------|--------------|
| Initiatives (`/initiatives`) | Optional future `initiativeId` ref — **utility**, not Execution SoT |
| Meeting actions | May seed mock actions later; not dual store |
| Calendar | Context for deadlines; calendar is not Actions |

---

## 5. Provider architecture

### 5.1 Composition (extends ADR-003)

```
OutcomeProvider          ← owns portfolio (outcomes, decisions, actions)
  → DecisionProvider     ← derives decision queue / priorityDecisions
    → ExecutionProvider  ← NEW: derives action queue / priorityActions
      → IntelligenceProvider   ← merges priority decisions + priority actions
        → ExecutiveBriefingProvider
```

Wired via existing `BriefingProviders` (or equivalent shell wrapper).

### 5.2 Responsibilities

| Provider | Owns | Exposes |
|----------|------|---------|
| **OutcomeProvider** | `OutcomePortfolio` including `actions[]` | portfolio, outcome lookups, health |
| **DecisionProvider** | nothing writable | queue, decision-by-id, priorityDecisions |
| **ExecutionProvider** | nothing writable | queue, action-by-id, priorityActions, actionsForOutcome, actionsForDecision, summary |
| **IntelligenceProvider** | nothing writable | bundle including recommendedActions from Execution |
| **ExecutiveBriefingProvider** | layout / boardMode | briefing assembly |

### 5.3 ExecutionProvider API (design)

```
useExecution():
  queue: ActionQueueItem[]
  priorityActions: PriorityAction[]
  summary: ActionPortfolioSummary
  getAction(id): ExecutiveAction | null
  getActionsForOutcome(outcomeId): ActionQueueItem[]
  getActionsForDecision(decisionId): ActionQueueItem[]
```

### 5.4 Derive layer

`src/lib/execution/` (proposed):

| Module | Role |
|--------|------|
| `engine-types.ts` | `ExecutiveAction` + supporting types |
| `derive.ts` | queue sort, overdue flags, priorityActions, summary |
| `mock-actions.ts` | may re-export from portfolio mock or live inside `mock-portfolio.ts` |
| `index.ts` | public exports |

**Sort order (proposed):** blocked+critical → overdue → due today → waiting on decision → in_progress → pending → by outcome health severity → deadline.

### 5.5 Mutations (mock-era)

In-memory updates through OutcomeProvider only (same pattern as any future decision mutations):

- status change, blocker add, checkpoint toggle  
- **No** server actions / Supabase in Sprint 4  

Optional: read-only Sprint 4 (display + Board Mode only) if founder prefers zero mutation surface — **recommend minimal local status transitions** so the loop feels real without persistence.

---

## 6. Route structure

| Route | Primary nav | Purpose |
|-------|-------------|---------|
| `/actions` | Actions | Execution queue (default) |
| `/actions/[actionId]` | Actions | Action detail / commitment deep dive |
| `/today` | Today | Briefing Recommended Actions → detail |
| `/decisions/[decisionId]` | Decisions | Committed Actions section → `/actions/[id]` |
| `/outcomes/[outcomeId]` | Utility | Linked Actions section → `/actions/[id]` |

**Rules:**

- Nested routes inherit **Actions** primary highlight.  
- No seventh nav item.  
- No `/execution` public path — product language is **Actions**; engine name is internal/docs.  
- Command palette: add Actions destinations (already has `/actions` placeholder entry).

---

## 7. Component hierarchy

### 7.1 Route shells

```
/actions
  AppShell
    ExecutionProviders (or BriefingProviders including Execution)
      ActionQueueView

/actions/[actionId]
  AppShell
    ExecutionProviders
      ActionDetailView
```

### 7.2 Queue (`ActionQueueView`)

```
ActionQueueView
  ├── PageHeader (Actions / Execution commitments)
  ├── Board Mode toggle
  ├── ActionPortfolioSummaryStrip (counts as text — not charts)
  ├── ActionQueueFilters (status chips; sparse)
  └── ActionQueueList
        └── ActionQueueCard[]
              ├── Title + status badge
              ├── Linked outcome name(s)
              ├── Optional decision question (one line)
              ├── What / Why / Next (compact)
              └── Owner · Deadline · Priority
```

### 7.3 Detail (`ActionDetailView`)

```
ActionDetailView
  ├── PageHeader + Board Mode
  ├── SignalPanel (What / Why / Next)
  ├── RecommendationMeta (impact, confidence, owner, deadline)
  ├── LinkedOutcomesPanel
  ├── ParentDecisionPanel (if decisionId)
  ├── BlockersPanel
  ├── CheckpointsPanel
  ├── StakeholdersPanel
  ├── DependenciesPanel
  ├── TimelinePanel
  └── HistoryPanel
```

### 7.4 Cross-surface embeds

| Host | Embed |
|------|-------|
| Briefing | `RecommendedActionsSection` consumes `useExecution().priorityActions` |
| Decision detail | `CommittedActionsPanel` |
| Outcome detail | `LinkedActionsPanel` (replace raw pendingActions list) |

### 7.5 UI primitives

Reuse `Button`, `Badge`/`StatusBadge`, `PageHeader`, `EmptyState`, `Card` (only where interaction requires). Prefer EOS tokens; do not expand zinc debt in new components.

---

## 8. Mock data model

### 8.1 Portfolio extension

Extend enterprise mock portfolio (Helix / ARR / etc.) with **8–14** actions:

| Mix | Intent |
|-----|--------|
| 2–3 blocked | Show unblock path + Outcome Health narrative |
| 2–3 overdue / due today | Briefing priority |
| 3–4 in progress | Operating mode |
| 2 linked to decided/approved decisions | Decision → Action loop |
| 2 without decisionId | Outcome-direct commitments |
| ≥1 waiting | Waiting on a pending decision |

### 8.2 Field completeness

Every mock action must include:

- Signal triad + recommendation meta  
- ≥1 outcomeId matching portfolio outcomes  
- Owner + deadline  
- At least one timeline event  
- Blocked items: ≥1 blocker  

### 8.3 Consistency rules for authors

1. `decisionId` targets must exist.  
2. Shared outcome between action and decision when linked.  
3. Outcome `actionIds` must match portfolio actions.  
4. Briefing Recommended Actions = top N from Execution derive (not hand-copied duplicates).

---

## 9. Executive workflows

### W1 — Morning attention (Briefing → Action)

1. Open `/today`.  
2. Scan Recommended Actions (≤3–5).  
3. Open action → confirm Why / Outcome impact.  
4. Either execute offline, update status (mock), or escalate blocker.

### W2 — Decision commits execution

1. Decide on `/decisions/[id]`.  
2. See / open Committed Actions.  
3. Confirm owner + deadline.  
4. Track from `/actions` thereafter.

### W3 — Outcome deep dive

1. Outcome Health → `/outcomes/[id]`.  
2. Review Linked Actions.  
3. Unblock or re-prioritise commitments that drag health.

### W4 — Blocked execution loop

1. Queue filter / badge shows Blocked.  
2. Detail shows blocker owner + since.  
3. Next step may be a **new Decision** (judgment) or unblock Action.  
4. Briefing surfaces blocked critical items first.

### W5 — Delegation check

1. Executive scans actions where `delegatedTo` is set.  
2. Confirms accountability still sits with `owner`.  
3. No full people-management suite — stance notes only.

### W6 — Board review

1. Enable Board Mode on queue or detail.  
2. Present commitments with outcome linkage and cost of delay.  
3. Exit Board Mode (Confidence Exit reserved for later; use existing Board Mode exit pattern).

---

## 10. Board Mode behaviour

Align with Briefing / Outcome / Decision Board Mode:

| Behaviour | Spec |
|-----------|------|
| Toggle | Explicit control; `aria-pressed` |
| Density | Larger type, more whitespace, fewer secondary panels |
| Content priority | Title → linked outcome → What/Why/Next → impact → owner/deadline |
| Hide / demote | Dense history tables, checkpoint chrome, utility clutter |
| Queue | Fewer cards visible as “presentation set” (e.g. top blocked + due) |
| Detail | Signal + recommendation + outcomes + blockers; collapse long history |
| Motion | Minimal; state change only |
| Print | Prefer readable contrast; no chart dependency |

Board Mode is **presentation restraint**, not a separate data mode.

---

## 11. Accessibility requirements

Constitution Article II.9 + V.6 — WCAG AA minimum.

| Requirement | Application |
|-------------|-------------|
| Keyboard | Full queue/detail operable; filters as buttons/tabs with roles |
| Focus | Visible focus rings (`focusRing` / EOS ring token) |
| Labels | Status badges not colour-only; text labels required |
| Live regions | Status change confirmations via polite `aria-live` when mutating |
| Board Mode | `aria-pressed` on toggle; do not trap focus oddly |
| Contrast | Semantic tokens on dark-first surfaces; avoid zinc-on-dark debt in new UI |
| Time pressure | Hit targets ≥44px; sparse primary actions |
| Screen readers | Queue cards announce title, status, outcome, deadline |
| Reduced motion | Respect `prefers-reduced-motion` |

---

## 12. Information Architecture impacts

| Area | Impact |
|------|--------|
| Primary nav **Actions** | Becomes real Execution Engine entry (placeholder replaced) |
| Six-item rule | Unchanged |
| Outcome Health chrome | Unchanged; actions explain health, don’t replace ribbon |
| Attention Budget | Still P0 companion; action counts may feed budget later — **not required** to ship Sprint 4 |
| Utility `/initiatives` | Remains utility; do not promote to primary |
| Vocabulary | UI: **Actions** / commitments; docs: Execution Engine |
| Command palette | `/actions`, action titles as navigable targets (optional stretch) |
| Mobile | Same six-item bar; Actions equal peer |

**IA doc amendment (on approval):** mark `/actions` and `/actions/[id]` as implemented engine routes; note Execution Engine ownership.

---

## 13. Executive Briefing integration

### 13.1 Section: Recommended Actions (existing)

| Today | Sprint 4 |
|-------|----------|
| Flattened from `outcome.pendingActions` in Outcome derive | Sourced from `ExecutionProvider.priorityActions` |
| Shape: `RecommendedAction` | Keep briefing DTO; map from `ExecutiveAction` |

### 13.2 Mapping

```
ExecutiveAction → RecommendedAction:
  id, actionLabel ← title
  whatChanged, why, whatShouldHappenNext
  outcomeId ← primaryOutcomeId
  recommendation ← { businessImpact, expectedOutcomeImpact, confidence, owner, deadline }
```

### 13.3 Briefing rules

1. Cap Recommended Actions (≤5).  
2. Prefer blocked/overdue/due-today on outcome-personalised set.  
3. Each card keeps What / Why / Outcome / Next + recommendation meta.  
4. CTA navigates to `/actions/[id]`.  
5. IntelligenceProvider **merges** Execution priorities — does not re-author action copy.

### 13.4 Executive Summary counters

Optional mock field: `actionsDueToday` / blocked count alongside `decisionsDueToday` — narrative only.

---

## 14. Risks and edge cases

| ID | Risk / edge | Mitigation |
|----|-------------|------------|
| R1 | Dual stores (`pendingActions` vs `actions[]`) | Single writable store; refs derived |
| R2 | Action without outcome | Validation invariant; reject in derive/mock lint |
| R3 | Action linked to decision with disjoint outcomes | Invariant B; mock review checklist |
| R4 | Confusion with React/server “actions” | Types: `ExecutiveAction` / `engine-types.ts`; routes stay `/actions` |
| R5 | Becoming a PM tool | No subtasks trees, sprints, or analytics; checkpoints ≤5 |
| R6 | Initiative dual SoT | Initiatives remain utility; optional ref only |
| R7 | Provider order break | Amend ADR-003 via ADR-006; nest Execution under Decision |
| R8 | Overdue vs status conflict | Derive `overdue` flag; don’t invent parallel status without rules |
| R9 | Empty queue | EmptyState with path back to Briefing / Outcomes |
| R10 | Board Mode inconsistency across engines | Shared behavioural spec (§10) |
| R11 | Attention Budget unfinished | Ship Actions without blocking on budget chrome |
| R12 | Legacy meeting actions collide | Do not import into store automatically in Sprint 4 |

---

## 15. Exit criteria for implementation

Implementation may be accepted when **all** of the following are true:

### Governance

- [ ] ADR-006 accepted (Execution Engine + provider order amendment)  
- [ ] `DOMAIN_MODEL.md` updated with Action aggregate  
- [ ] Constitution Article VII lists Actions / Execution Engine as implemented (mock)  
- [ ] CONSTITUTION_INCONSISTENCIES updated (B1 Actions row resolved or narrowed)

### Architecture

- [ ] `OutcomePortfolio.actions` is canonical store  
- [ ] Every mock action has `outcomeIds.length >= 1`  
- [ ] Provider order: Outcome → Decision → **Execution** → Intelligence → Briefing  
- [ ] No Supabase / AI / analytics charts introduced  
- [ ] No parallel writable action store in Briefing or Outcome embeds  

### Product surfaces

- [ ] `/actions` queue answers the three questions  
- [ ] `/actions/[actionId]` detail with outcomes, optional decision, blockers, timeline  
- [ ] Briefing Recommended Actions sourced from ExecutionProvider  
- [ ] Decision detail shows committed actions  
- [ ] Outcome detail shows linked actions  
- [ ] Board Mode on queue + detail  

### Quality

- [ ] Unit tests for execution `derive` (sort, overdue, priority, invariants)  
- [ ] `npm test` and `npm run build` pass  
- [ ] Keyboard + AA contrast verified on queue/detail  
- [ ] Empty and blocked states implemented  

### Explicit non-goals (must remain out)

- [ ] No persistence  
- [ ] No AI action generation  
- [ ] No burndown/analytics visualisations  
- [ ] No seventh primary nav item  

---

## Appendix A — Proposed ADR-007 sketch (not ratified)

**Title:** Execution Engine coupled to Outcomes (and optionally Decisions)  
**Number:** ADR-007 (ADR-006 = Executive Intent Engine — see Sprint 4A design)  
**Depends on:** ADR-001, ADR-002, ADR-003, ADR-006 (Intent)  
**Decision:** Canonical `actions[]` on `OutcomePortfolio`; `ExecutionProvider` after Decision (and after Intent); no standalone actions.  
**Provider order:** `Outcome → Intent → Decision → Execution → Intelligence → ExecutiveBriefing`  
**Consequences:** Briefing/Outcome action projections derive from Execution; ADR-003 provider order amended.

## Appendix B — Vocabulary

| Prefer | Avoid |
|--------|--------|
| Actions, commitments | Tasks, tickets, Jira |
| Execution Engine (docs) | Workflow engine, automation hub |
| Blocked / cost of delay | Red/amber dashboards as hero |
| Owner / delegated to | Assignee swarm |

---

**End of design package.** Stop — awaiting review before any implementation.
