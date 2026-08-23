# ExecutiveOS Domain Model

**Status:** Canonical (Sprint 3.5)  
**Date:** 2026-07-20  
**Scope:** Entities and relationships for Outcome Engine, Decision Engine, Executive Briefing, and related product concepts.  
**Code SoT (engines):** `src/lib/outcomes/types.ts`, `src/lib/decisions/engine-types.ts`, `src/lib/briefing/executive-briefing-types.ts`

---

## 1. Mental model

```
Organisation / Executive
        │
        ▼
 OutcomePortfolio ── owns ── Intent (context) + intentHistory
        │
        ├── owns ── Outcome[]
        │              ├── decisionIds[] ──► Decision
        │              └── (refs / signals…)
        └── owns ── Decision[] ◄── outcomeIds (≥1)

Derived surfaces (not separate stores):
  IntentContext · DecisionQueue · IntelligenceBundle · ExecutiveBriefingData
```

**Invariants:** Every Decision references ≥1 Outcome. Intent references outcomes by id only. Decision business state lives only on `OutcomePortfolio.decisions`. Intent does not store outcome health or decision records.

---

## 2. Core aggregates

### 2.1 OutcomePortfolio

| Field | Type | Notes |
|-------|------|--------|
| `overallScore` | number | Portfolio Outcome Health (0–100) |
| `statusLabel` | string | Human portfolio status |
| `refreshedAt` | ISO string | Last derive/refresh |
| `executiveName` | string | Briefing personalisation |
| `outcomes` | Outcome[] | Strategic outcomes |
| `decisions` | Decision[] | Canonical Decision Engine store |
| `intent` | ExecutiveIntent | Active strategic focus (context) |
| `intentHistory` | ExecutiveIntent[] | Superseded Intent records |

**Relationships:** 1 portfolio → 1 active Intent; 1 portfolio → many Outcomes; 1 portfolio → many Decisions.

### 2.0 ExecutiveIntent (context)

| Field | Notes |
|-------|--------|
| `title`, `narrative` | Mandate |
| `priority`, `horizon`, `reviewDate`, `reviewCadence` | Cadence |
| `focusOutcomeIds`, `watchingOutcomeIds`, `nonFocusOutcomeIds` | Id refs only |
| `constraints`, `successSignals` | Narrative bounds / signals |
| `status`, `history` | Lifecycle |

Alignment labels for outcomes: Focused · Watching · Supporting · Non-Focus (derived).

### 2.2 Outcome

Strategic result leadership is trying to achieve. Personalisation and priority axis.

| Field | Type | Notes |
|-------|------|--------|
| `id` | string | Stable id |
| `name`, `description` | string | Identity |
| `status` | OutcomeStatus | `on_track` \| `at_risk` \| `off_track` \| `watching` |
| `healthScore` | number | 0–100 |
| `yesterdayMovement` | number | Points vs yesterday |
| `yesterdayMovementLabel` | string | Narrative movement |
| `expectedTrajectory` | { direction, summary, horizonLabel } | Forecast posture |
| `decisionIds` | string[] | Links into portfolio decisions |
| `contributingInsights` | OutcomeInsightRef[] | Embedded insight refs |
| `pendingActions` | OutcomeActionRef[] | Embedded action refs |
| `confidence` | number | Confidence in assessment |
| `owner` | string | Accountable owner |
| `targetDate` | string | Target / horizon |
| `businessImpact` | string | Stakes narrative |
| `timeline` | OutcomeTimelineEvent[] | Chronology |
| `contributors` | OutcomeContributor[] | People contributing |
| `blockers` | OutcomeBlocker[] | Impediments |
| `recommendations` | OutcomeRecommendation[] | Explain-before-recommend |
| `forecast` | OutcomeForecast | Forward view |
| `history` | OutcomeHistoryPoint[] | Health history |
| `relationships` | OutcomeRelationship[] | Outcome↔Outcome |
| `overnightSignals` | OutcomeOvernightSignal[] | Briefing overnight feed |
| `calendarContext` | OutcomeCalendarRef[] | Calendar linkage |

**Relationships:**

| From | To | Cardinality | Via |
|------|----|-------------|-----|
| Outcome | Decision | many↔many | `decisionIds` / `outcomeIds` |
| Outcome | Outcome | many↔many | `relationships` |
| Outcome | Insight (ref) | 1→many | `contributingInsights` |
| Outcome | Action (ref) | 1→many | `pendingActions` |
| Outcome | Blocker | 1→many | `blockers` |
| Outcome | Contributor | 1→many | `contributors` |

### 2.3 Decision (Decision Intelligence Engine)

Unit of executive judgment. **Never standalone.**

| Field | Type | Notes |
|-------|------|--------|
| `id` | string | Stable id |
| `question` | string | Decision question (leads UI) |
| `outcomeIds` | string[] | **Required, length ≥ 1** |
| `status` | EngineDecisionStatus | pending, under_review, due_today, approved, deferred, decided |
| `owner`, `deadline` | string | Accountability |
| `confidence` | number | Judgment confidence |
| `businessImpact` | string | Stakes |
| `expectedOutcomeImpact` | string | Effect on linked outcomes |
| `costOfDelay` | string | Delay narrative |
| `whatChanged`, `why`, `whatShouldHappenNext` | string | Signal triad |
| `stakeholders` | DecisionStakeholder[] | People & stance |
| `evidence` | DecisionEvidence[] | Supporting material |
| `alternatives` | DecisionAlternative[] | Options |
| `tradeOffs` | DecisionTradeOff[] | Trade-offs |
| `relationships` | DecisionRelationship[] | Decision↔Decision |
| `timeline` | DecisionTimelineEvent[] | Chronology |
| `history` | DecisionHistoryEntry[] | Status history |
| `approvalWorkflow` | ApprovalWorkflowStep[] | Approval chain |
| `recommendationSummary` | string | Summarised recommend |

**Derived:** `DecisionQueueItem` = Decision + `outcomeNames` + `primaryOutcomeId`.

---

## 3. Supporting entities (Outcome-owned)

| Entity | Purpose | Key fields |
|--------|---------|------------|
| **OutcomeContributor** | Who contributes | name, role, contribution |
| **OutcomeBlocker** | Impediment | title, severity, owner, since |
| **OutcomeRecommendation** | Recommend with explain | what/why/next + RecommendationFields |
| **OutcomeTimelineEvent** | Chronology | at, kind, title, detail |
| **OutcomeHistoryPoint** | Health series | date, healthScore, note |
| **OutcomeForecast** | Forward narrative | expectedScore, direction, assumptions |
| **OutcomeRelationship** | Cross-outcome | supports / depends_on / conflicts_with / informs |
| **OutcomeInsightRef** | Insight pointer | sourceLabel + signal triad + recommendation |
| **OutcomeActionRef** | Action pointer | status + signal triad + recommendation |
| **OutcomeOvernightSignal** | Overnight change | severity + signal triad |
| **OutcomeCalendarRef** | Meeting context | schedule + signal triad |

---

## 4. Supporting entities (Decision-owned)

| Entity | Purpose |
|--------|---------|
| **DecisionStakeholder** | Sponsor / approver / advisor / impacted / informed |
| **DecisionEvidence** | Fact or source backing judgment |
| **DecisionAlternative** | Option with upside/downside |
| **DecisionTradeOff** | Dimension / choice / consequence |
| **DecisionRelationship** | blocks / enables / related_to / supersedes |
| **DecisionTimelineEvent** | Decision chronology |
| **DecisionHistoryEntry** | Status transitions |
| **ApprovalWorkflowStep** | Approval step state |

---

## 5. Briefing & intelligence (derived projections)

These are **views**, not independent domain stores for Outcomes/Decisions.

### 5.1 RecommendationFields

Shared recommendation metadata: Business Impact, Expected Outcome Impact, Confidence, Owner, Deadline.

### 5.2 BriefingSignal / PriorityDecision / TopInsight / RecommendedAction / OvernightChange

Briefing section items with What / Why / Next (+ recommendation). Priority decisions include decision id and outcome linkage.

### 5.3 ExecutiveBriefingData

Assembled daily brief: Executive Summary, Outcome Health, Overnight Changes, Priority Decisions, Top Insights, Recommended Actions, Calendar Context.

### 5.4 IntelligenceBundle

Projection used by IntelligenceProvider; merges Decision Engine priorities with other signals.

### 5.5 Legacy / parallel domains (not engine SoT)

Present in codebase; **not** the Phase 1–3 engine source of truth:

| Domain | Location | Notes |
|--------|----------|--------|
| MorningBrief | `src/lib/briefing/types.ts` | Older brief generator types |
| ExecutiveDecisionRecord | `src/lib/decisions/types.ts` | Supabase decision register |
| IntelligenceCenterData | `src/lib/intelligence-center/types.ts` | Pre-Briefing center model |
| Initiatives, Meetings, Calendar integrations | respective `src/lib/*` | Operational systems; feed outcomes over time |

---

## 6. Organisation & access (product context)

Not fully modelled in Outcome Engine types yet; product-level entities:

| Entity | Relationship to engines |
|--------|-------------------------|
| **Organisation** | Tenancy boundary for portfolio |
| **User / Executive profile** | `executiveName`, owners, stakeholders |
| **Role** | Context for language/entitlements — **not** priority ranking |
| **Integration connection** | Sources for calendar/mail/teams signals |
| **Billing / Plan** | Entitlements for features |

---

## 7. Relationship rules (governance)

1. **No orphan decisions** — `outcomeIds.length >= 1`.  
2. **Decision state lives once** — on `OutcomePortfolio.decisions`.  
3. **Outcome.decisionIds** must resolve to portfolio decisions.  
4. **Priority order** is outcome-driven, not role-driven.  
5. **Briefing / Intelligence** derive; they do not author competing outcome health scores.  
6. **Legacy register types** must not be overwritten by engine types (ADR-002).

---

## 8. ER diagram (simplified)

```
┌──────────────────┐       1        ┌─────────────┐
│ OutcomePortfolio │───────────────▶│  Outcome    │
└────────┬─────────┘                └──────┬──────┘
         │ 1                               │ M:N (ids)
         │                                 │
         │ N                               ▼
         └────────────────────────▶┌─────────────┐
                                   │  Decision   │
                                   └─────────────┘
 Outcome ──< InsightRef, ActionRef, Blocker, Contributor,
            OvernightSignal, CalendarRef, Recommendation,
            TimelineEvent, HistoryPoint, Relationship >
 Decision ──< Stakeholder, Evidence, Alternative, TradeOff,
             Relationship, TimelineEvent, HistoryEntry,
             ApprovalWorkflowStep >
```
