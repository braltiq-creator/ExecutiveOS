# ExecutiveOS UX Blueprint v1

**Status:** Formal UX architecture blueprint  
**Version:** 1.0  
**Role:** Translates completed Product Doctrine into the complete user experience — every screen, flow, relationship, and journey — before wireframes or visual design  
**Authority:** Constitution · Narrative v1.1 · Product Strategy · Product Principles · Core Executive Loop · PRODUCT_SPEC_001–006 · ADRs · Executive Experience Blueprint · Information Architecture  

**Nature:** Architectural experience blueprint — not UI design, wireframes, high fidelity, Design System, or engineering.

No future wireframe may contradict this document. Where older design notes conflict with PRODUCT_SPEC_001–006 or the Constitution, **doctrine and this blueprint win**.

---

## 1. UX Philosophy

### How ExecutiveOS should be experienced

ExecutiveOS is experienced as a **Decision Operating System**: a daily environment that prepares judgement, records Decisions bound to Outcomes, and returns the executive to clarity — not as a dashboard suite, CRM, or AI chat home.

The experiential standard is **Confidence Through Clarity** (Narrative v1.1). Every screen, journey, and state must leave the executive clearer about what matters, why, and what to do — including clarity about what is unknown.

### The three questions (always)

Every primary surface answers, in order:

1. What requires my attention?  
2. Why?  
3. What should I do?

If a screen cannot answer a single dominant question, it is not ready for UX detailing (PRODUCT_SPEC_005; Product Principles).

### Experiential spine

```
Intent → Observe → Understand → Decide → Execute → Learn → Refine Intent
```

UX maps this loop onto places:

| Loop stage | Primary UX home |
|------------|-----------------|
| Intent | Briefing strip + Intent utility |
| Observe | Connectors (Trust) + silent engine; gaps on Today |
| Understand | Today synthesis + Insights depth + Knowledge |
| Decide | Decisions (+ Briefing deep links) |
| Execute | Actions |
| Learn | Knowledge + Decision/Outcome history + review |
| Refine Intent | Intent utility + review cadence |

### Experience contracts (non-negotiable)

1. **Logo → Today** always.  
2. **Exactly six primaries:** Today · Decisions · Insights · Actions · Knowledge · Reports.  
3. **Outcomes and Intent are utility/chrome** — not seventh primaries (PRODUCT_SPEC_004).  
4. **AI is advisor** — never home, never operator, never seventh nav (SPEC_002/005/006).  
5. **Human commits** — Approve/Reject/Defer/etc. are explicit (SPEC_006).  
6. **Value before commitment** — First Launch reaches a useful Briefing before ransom setup.  
7. **Same truth under pressure** — Board Mode changes density, not integrity (SPEC_003).  

### What “complete UX” means here

Complete means: every destination has a purpose, every journey has entries/exits, every major screen has empty/loading/error behaviour, and every relationship between screens is named. It does **not** mean layouts, type, colour, or components.

### Experience quality bar

A screen is experientially complete only when:

1. An interrupted executive can resume without reconstruction homework.  
2. An AI-unavailable session still boots Today and can commit Decisions.  
3. A Trust-partial session remains honest and useful.  
4. A board-pressure session can restrain density without inventing a second truth.  

If any of these fail, the blueprint for that screen is incomplete — regardless of feature richness.

### Solo to Enterprise (same UX map)

Editions change depth (escalate/delegate richness, admin, connectors), not the mental model. Solo founders and ELTs share the same product map. UX that forks “lite nav” versus “enterprise nav” violates PRODUCT_SPEC_004 scalability and this blueprint.

---

## 2. Product Map

### 2.1 Destination classes

| Class | Members |
|-------|---------|
| **Primary** | Today, Decisions, Insights, Actions, Knowledge, Reports |
| **Utility** | Intent, Outcomes, Organisation, Team, Settings (org/billing/integrations), Calendar, Meetings, Initiatives (execution detail under Outcomes/Actions), Admin System |
| **Secondary** | Assistant (Chief of Staff), Board Mode (posture on Today), Command Palette |
| **Auth / activation** | Sign in, Auth callback, Onboarding / Get started, Completion |
| **Chrome** | Logo, Primary nav, Outcome Health, Attention Budget (future), Account menu |
| **Modal / overlay** | Confirm destructive, Confirm Decision commit (when needed), Trust permission explain, Undo toast window, Command palette, Light Intent/Focus edit, Connector grant explain |

### 2.2 Primary screens

| Screen | Route (canonical) | Job |
|--------|-------------------|-----|
| Today — Executive Briefing | `/today` | Boot judgement |
| Decisions — Register | `/decisions` | List/filter judgement register |
| Decision Detail | `/decisions/[id]` | Decide / review one Decision |
| Insights — Hub | `/insights` | Depth of explained intelligence |
| Insight Detail | `/insights/[id]` | Single insight / advisor rationale depth |
| Actions — Queue | `/actions` | Commitments toward Outcomes |
| Action Detail | `/actions/[id]` | One commitment |
| Knowledge — Entry | `/knowledge` | Memory / graph entry |
| Knowledge Focus | `/knowledge/...` | Subgraph / memory node focus |
| Reports — Library | `/reports` | Outward narratives |
| Report Detail / Compose | `/reports/[id]` | One report / draft / export |

Aliases (migration only): `/dashboard`→Today; `/advisors`→Insights; `/graph`→Knowledge.

### 2.3 Utility screens

| Screen | Route | Job |
|--------|-------|-----|
| Intent Detail | `/intent` | Mandate / Focus / constraints / review |
| Outcomes Portfolio | `/outcomes` | Strategic Outcomes SoT portfolio |
| Outcome Detail | `/outcomes/[id]` | One Outcome health & links |
| Organisation Overview | `/organization` | Org context |
| Team | `/team` | Seats / members |
| Settings — Organisation | `/settings/organization` | Org settings |
| Settings — Billing | `/settings/billing` | Plan / billing |
| Settings — Integrations (Trust Zone) | `/settings/integrations` | Connectors / Progressive Trust |
| Integration Detail / Settings | (within Trust Zone) | One connector scopes |
| Calendar | `/calendar` | Rhythm input (not primary) |
| Meetings List / Detail | `/meetings`, `/meetings/...` | Meeting context → Actions/Today |
| Initiatives Board / Detail | `/initiatives`, ... | Execution detail linked to Outcomes/Actions |
| Admin System | `/admin/system` | Entitled health (not primary) |

### 2.4 Secondary & activation screens

| Screen | Placement |
|--------|-----------|
| Assistant | `/assistant` — secondary under Insights identity or none |
| Sign in | `/sign-in` |
| Onboarding Wizard | `/onboarding` / `/get-started` |
| Completion Sequence | end of onboarding → Today |

### 2.5 Modals & overlays (inventory)

| Overlay | Purpose | Never |
|---------|---------|-------|
| Decision commit confirm | Clarify high-stakes Approve when needed | Celebrate / gamify |
| Destructive confirm | Delete/archive with undo path | Ambiguous authority |
| Trust scope explain | What permission unlocks | Ransom before any value |
| Light Intent / Focus edit | Confirm inferred framing | Full OKR questionnaire |
| Command palette | Jump across map | Become Search-as-home |
| Undo window | Reverse reversible mistake | Erase audit of commits |
| Offline / fatal error | Honest recovery | Fake success |
| Board Mode toggle confirm (optional) | Enter presentation restraint | Second political truth |

### 2.6 Chrome destinations (not screens)

- Logo → Today  
- Outcome Health → Outcomes portfolio or filtered health  
- Account → utility cluster  
- Attention Budget → explanatory utility (future; not seventh primary)  

---

## 3. User Journeys

### 3.1 Morning Briefing

**Goal:** Boot judgement in minutes; leave with Confidence Through Clarity.

**Actors:** Executive (primary); optional observer in Board Mode.

**Preconditions:** Authenticated session; Outcomes may be partial; Trust may be partial; AI may be unavailable.

```
Land Today
  → Recognise Intent strip
  → Scan lead judgement + why
  → Scan Outcome Health / overnight change (if consequential)
  → Scan sparse priority Decisions / insights / actions / calendar context
  → Optional: Board Mode if presenting
  → Optional deep link → Decision / Outcome / Intent / Action
  → Act or leave
  → Logo returns to Today anytime
```

**Variants:**

| Variant | Behavioural difference |
|---------|------------------------|
| Quiet day | Honest silence; no filler widgets |
| Busy day | Strict sparse survivors; Board Mode available |
| Travel / mobile | Shorter path to lead judgement |
| Uncertain day | Named gaps; drafts over prescriptions |
| AI unavailable | Structured Briefing still boots |

**Success:** Knows what matters, what can wait, next move.  
**Failure:** Dashboard sprawl; chat-home; setup ransom; fabricated completeness.

### 3.2 Decision Review

**Goal:** Exercise or revisit organisational judgement linked to Outcomes.

```
Entry: Today deep link | Decisions register | Outcome detail | Command palette | Notification
  → Decision Detail
  → Recognise stakes (Outcomes, Intent alignment)
  → Explain / evidence (progressive disclosure)
  → Recommendation as proposal (if any)
  → Approve | Reject | Defer | Escalate | Delegate
  → Optional Undo window
  → Optional spawn Action
  → Exit: Register | Today | Outcome
```

**Success:** Attributed Decision state; Outcome linkage intact.  
**Failure:** Orphan Decision; AI auto-commit; bulk approve.

### 3.3 Outcome Review

**Goal:** Understand how we know; health and blockers toward results.

```
Entry: Outcome Health chrome | Today link | Decisions/Actions link | Utility Outcomes | Palette
  → Portfolio scan OR Outcome Detail
  → Health, blockers, linked Decisions/Actions
  → Optional Intent alignment context
  → Optional deepen to Decision/Action/Knowledge
  → Exit: Today | Decisions | Actions
```

**Success:** Honest accountability language; no OKR theatre.  
**Failure:** Outcomes as seventh primary home; vanity scores as product identity.

### 3.4 Board Preparation

**Goal:** Same truth under social/presentation restraint.

```
Today → enable Board Mode (density restraint)
  and/or
Reports → open/compose narrative derived from SoT
  → Optional deep links to Decisions/Outcomes for rehearsal
  → Quiet Mode compatible
  → Present / export
  → Exit Board Mode → normal Today
```

**Success:** Continuity of stakes language; no rebuilt fiction.  
**Failure:** BI pack theatre; alternate political reality; chart-first identity.

### 3.5 Knowledge Discovery

**Goal:** Memory and connection when Understand/Learn need depth.

```
Entry: Today disclosure | Insights citation | Decision evidence | Knowledge primary | Palette
  → Knowledge Entry
  → Focus subgraph / memory node
  → Optional return citation into Decision/Outcome
  → Exit: Today | Insights | Decisions
```

**Success:** Context found without becoming morning home.  
**Failure:** Graph as boot sequence; document-repo identity.

### 3.6 Reporting

**Goal:** Outward leadership narrative from operating truth.

```
Reports Library → Compose/Open Report
  → Derive from Intent/Outcomes/Decisions/Actions
  → AI may draft sections (human publishes)
  → Export / share per Trust
  → Exit: Reports | Today
```

**Success:** Narrative matches SoT; human authority on publish.  
**Failure:** Shadow portfolio; Reports replace Briefing.

### 3.7 Settings

**Goal:** Enable tenancy and preferences without capturing the morning.

```
Account → Settings cluster
  → Organisation | Billing | (Integrations = Trust journey)
  → Save / return
  → Prefer Logo → Today over lingering in settings
```

**Success:** Enabling clarity; lower emotional temperature.  
**Failure:** Settings-first onboarding; Settings as primary nav.

### 3.8 Trust (Progressive Trust)

**Goal:** Earn connectors with least privilege after value.

```
Partial Briefing with gaps
  → Optional Trust ask with one-sentence unlock
  → Settings → Integrations (Trust Zone)
  → Grant minimum scope | Decline
  → Graceful degradation if decline/revoke
  → Return Today — gaps update honestly
```

**Success:** Value before broader access; honest gaps.  
**Failure:** Ransom wall; broad scopes “just in case”; zombie metrics after revoke.

### 3.9 First Launch

**Goal:** Magic Moment — recognised, ranked, explained, actionable.

**Actors:** New executive; optional concierge/admin for enterprise rollout.

**Preconditions:** None beyond auth; connectors optional.

```
Sign in
  → Concierge / short onboarding (infer-first)
  → Light confirm Intent/Outcomes drafts (not interrogation)
  → Optional connect Microsoft 365 / Teams (minimum)
  → Land Today with partial-but-honest Briefing
  → Correction easy if inference wrong
  → Deeper Trust later
```

**Magic Moment test (Experience Blueprint):** Intent present · 1–3 judgement calls · Outcome stakes · next move in under two minutes.

**Enterprise variant:** Admin may pre-seed org connectors; executive still lands on Today, not on Settings. Concierge must not become questionnaire.

**Success:** Judgement asked for, not data entry.  
**Failure:** Configuration theatre; empty dashboard; AI greeting as identity.

### Journey design rules (apply to all §3 journeys)

1. **Entry names the job** — the executive knows why they arrived.  
2. **Centre is obvious within one scan** — one primary question.  
3. **Authority acts are explicit** — no accidental binds.  
4. **Exit is dignified** — Logo→Today, Back, or leave with clarity.  
5. **Branches prefer deep links over new primaries.**  
6. **Failure modes are designed** — not left to empty spinner death.  

### Cross-journey interrupts

Any journey may be interrupted by:

- Phone call / meeting start → state preserved (SPEC_006)  
- Urgent alert (rare) → deep link → return  
- Trust failure mid-act → gap honesty → resume draft  
- AI cancel → continue structured path  

Journeys that cannot survive interrupt are not executive-grade.

### Journey priority for UX sequencing

When wireframing, sequence by doctrine criticality:

1. First Launch + Morning Briefing (Magic Moment)  
2. Decision Review (authority)  
3. Trust (Progressive Trust after value)  
4. Outcome Review  
5. Board Preparation  
6. Actions / Knowledge / Reporting depth  
7. Settings polish  

Do not wireframe Reports spectacle before Today and Decisions are ratified.

---

## 4. Screen Inventory

For each screen: Purpose · Primary Question · Inputs · Outputs · Navigation · Entry · Exit · Success · Failure.

### 4.1 Today — Executive Briefing

| | |
|--|--|
| **Purpose** | Daily boot of judgement |
| **Primary Question** | What requires my judgement now — and why? |
| **Inputs** | Derived Intent, Outcomes, Decisions, Actions, Insights, signals, calendar context, Trust state |
| **Outputs** | Attention triage; deep links; light defer/correct; Board Mode posture |
| **Navigation** | Primary Today; Logo target; deep links out |
| **Entry** | Auth default; Logo; end of onboarding; return from depth |
| **Exit** | Leave product; deep link; switch primary |
| **Success** | Triad answered; Confidence Through Clarity |
| **Failure** | Widget sprawl; chat-home; fabricated completeness |

**Regions (conceptual, not layout):** Intent context · Lead judgement · Outcome Health / overnight change · Priority Decisions · Sparse insights/actions · Calendar context · Meta (sync/gaps).

### 4.2 Decisions — Register

| | |
|--|--|
| **Purpose** | Durable register of leadership judgement |
| **Primary Question** | Which Decisions need me — and in what state? |
| **Inputs** | Portfolio Decisions; filters (status, Outcome, due) |
| **Outputs** | Open detail; create draft Decision (with Outcome linkage) |
| **Navigation** | Primary Decisions |
| **Entry** | Primary nav; palette; Today “see all”; Outcome links |
| **Exit** | Detail; Today; other primary |
| **Success** | Scannable register; no orphan create path |
| **Failure** | Task board identity; chat threads as register |

### 4.3 Decision Detail

| | |
|--|--|
| **Purpose** | Exercise or review one Decision |
| **Primary Question** | What should we decide — given Outcomes and evidence? |
| **Inputs** | Decision record; Outcomes; Intent alignment; evidence; recommendations; history |
| **Outputs** | Approve/Reject/Defer/Escalate/Delegate; Undo; Reopen; spawn Action; corrections |
| **Navigation** | Nested under Decisions primary |
| **Entry** | Register; Today deep link; notification; Outcome; Insight |
| **Exit** | Register; Today; Outcome; Action |
| **Success** | Attributed commit; OutcomeIds ≥ 1 |
| **Failure** | AI auto-bind; missing Outcomes; celebration theatre |

### 4.4 Insights — Hub

| | |
|--|--|
| **Purpose** | Depth of explained intelligence |
| **Primary Question** | What do we understand more deeply? |
| **Inputs** | Insight artefacts; advisor contributions; links to Outcomes |
| **Outputs** | Open insight detail; deep link to Decision/Outcome; optional Assistant entry |
| **Navigation** | Primary Insights |
| **Entry** | Primary; Today sparse insight; palette |
| **Exit** | Detail; Today; Decisions |
| **Success** | Explain-before-recommend room; not morning siphon |
| **Failure** | AI playground home; sparkle identity |

### 4.5 Insight Detail

| | |
|--|--|
| **Purpose** | Inspect one explained analysis |
| **Primary Question** | Why this — and what should I do about it? |
| **Inputs** | Insight; confidence; sources; Outcome links; recommendation proposal |
| **Outputs** | Challenge; deep link Decision/Action; dismiss/learn signal |
| **Navigation** | Nested Insights |
| **Entry** | Hub; Today; Decision citation |
| **Exit** | Hub; Decision; Today |
| **Success** | Challengeable rationale |
| **Failure** | Opaque score; command tone |

### 4.6 Actions — Queue

| | |
|--|--|
| **Purpose** | Commitments that execute judgement toward Outcomes |
| **Primary Question** | What must happen — and what is blocked? |
| **Inputs** | Actions linked to Outcomes (± Decisions) |
| **Outputs** | Open detail; mark progress; unblock paths |
| **Navigation** | Primary Actions |
| **Entry** | Primary; Today recommended actions; Decision spawn |
| **Exit** | Detail; Today; Outcome; Decision |
| **Success** | Executive commitment language |
| **Failure** | Sprint-board identity; orphan tasks |

### 4.7 Action Detail

| | |
|--|--|
| **Purpose** | Own one commitment |
| **Primary Question** | How do we unblock or complete this toward the Outcome? |
| **Inputs** | Action; Outcome; optional Decision parent; blockers |
| **Outputs** | Status change; reassign; note; link |
| **Navigation** | Nested Actions |
| **Entry** | Queue; Today; Decision; Meeting |
| **Exit** | Queue; Today; Outcome |
| **Success** | Clear ownership; Outcome why intact |
| **Failure** | Disconnect from Outcomes |

### 4.8 Knowledge — Entry / Focus

| | |
|--|--|
| **Purpose** | Institutional memory and connected context |
| **Primary Question** | What do we know that helps understanding now? |
| **Inputs** | Graph/memory; citations |
| **Outputs** | Focus node; cite into Decision/Outcome; return |
| **Navigation** | Primary Knowledge |
| **Entry** | Primary; progressive disclosure; Decision evidence |
| **Exit** | Today; Insights; Decisions |
| **Success** | Depth on demand |
| **Failure** | Replaces Briefing; doc-repo identity |

### 4.9 Reports — Library / Detail

| | |
|--|--|
| **Purpose** | Outward leadership narrative |
| **Primary Question** | What must we communicate — matching operating truth? |
| **Inputs** | Derived SoT; prior reports |
| **Outputs** | Draft/edit; AI section drafts; publish/export |
| **Navigation** | Primary Reports |
| **Entry** | Primary; Board prep journey |
| **Exit** | Today; Decisions/Outcomes for source |
| **Success** | Human publish; SoT-derived |
| **Failure** | Shadow portfolio; BI suite identity |

### 4.10 Intent (utility)

| | |
|--|--|
| **Purpose** | Strategic mandate for the horizon |
| **Primary Question** | What are we trying to achieve — and what is Non-Focus? |
| **Inputs** | Active Intent + history; Outcome id refs |
| **Outputs** | Amend narrative/Focus/constraints/review; confirm drafts |
| **Navigation** | Utility (Account / Briefing strip / palette) |
| **Entry** | Strip; Account; review due; First Launch confirm |
| **Exit** | Today (preferred) |
| **Success** | Framing clarity; id refs only |
| **Failure** | Seventh primary; OKR gardening daily home |

### 4.11 Outcomes Portfolio / Detail (utility)

| | |
|--|--|
| **Purpose** | Business-state SoT for strategic Outcomes |
| **Primary Question** | How will we know — and how healthy are we? |
| **Inputs** | Outcomes; health; linked Decisions/Actions |
| **Outputs** | Amend Outcome; open links; health drill |
| **Navigation** | Utility + Outcome Health chrome |
| **Entry** | Chrome; Today; Decision/Action links; Account |
| **Exit** | Today; Decisions; Actions |
| **Success** | Honest health language |
| **Failure** | Competing morning home; role-ranked politics |

### 4.12 Trust Zone — Integrations

| | |
|--|--|
| **Purpose** | Progressive Trust connectors |
| **Primary Question** | What is connected — and what does each grant unlock? |
| **Inputs** | Grants; scopes; sync state |
| **Outputs** | Connect/disconnect; scope change |
| **Navigation** | Account → Settings → Integrations |
| **Entry** | Gap CTA after value; Account; error Trust failure |
| **Exit** | Today |
| **Success** | Least privilege; graceful revoke |
| **Failure** | Ransom before Briefing; zombie data |

### 4.13 Settings — Organisation / Billing; Organisation; Team

| | |
|--|--|
| **Purpose** | Tenancy, plan, membership |
| **Primary Question** | Who are we / who has access / what plan? |
| **Inputs** | Org profile; entitlements; members |
| **Outputs** | Updates; invites |
| **Navigation** | Account utility |
| **Entry** | Account |
| **Exit** | Today / Account |
| **Success** | Enabling without morning capture |
| **Failure** | Primary nav placement |

### 4.14 Calendar / Meetings / Initiatives (utility)

| | |
|--|--|
| **Purpose** | Rhythm and execution detail feeding Observe/Execute |
| **Primary Question** | What is the time/execution context? |
| **Inputs** | Events; meetings; initiatives |
| **Outputs** | Prep links; Action links; return to Today |
| **Navigation** | Not primary; linked from Today/Actions/Health |
| **Entry** | Today calendar context; Actions; Health |
| **Exit** | Today; Actions; Outcomes |
| **Success** | Context without becoming home |
| **Failure** | Calendar as seventh primary |

### 4.15 Assistant (secondary)

| | |
|--|--|
| **Purpose** | Conversational advisor craft |
| **Primary Question** | What do I need clarified — pointing into structure? |
| **Inputs** | Thread; OS context |
| **Outputs** | Explanations; drafts; deep links; never silent SoT writes |
| **Navigation** | Secondary; Insights-adjacent |
| **Entry** | Today Ask; Insights; palette |
| **Exit** | Decision Detail commit; Today |
| **Success** | Pointers into structure |
| **Failure** | Chat-as-home; Decision SoT in thread |

### 4.16 Onboarding / Sign in / Completion

| | |
|--|--|
| **Purpose** | Authenticate; infer identity/org/objectives lightly; reach Today |
| **Primary Question** | Can I reach a useful Briefing quickly? |
| **Inputs** | Auth; light confirmations; optional first connector |
| **Outputs** | Session; draft Intent/Outcomes; land Today |
| **Navigation** | Pre-shell / limited shell |
| **Entry** | Marketing → sign in; invite |
| **Exit** | Today Magic Moment |
| **Success** | Recognised + ranked early |
| **Failure** | Interrogation; settings-first |

### 4.17 Admin System (entitled)

| | |
|--|--|
| **Purpose** | Platform health for operators |
| **Primary Question** | Is the system healthy? |
| **Inputs** | System signals |
| **Outputs** | Operator actions |
| **Navigation** | Account entitled only — not primary |
| **Entry** | Account |
| **Exit** | Today |
| **Success** | Invisible to normal morning |
| **Failure** | Surfacing as peer primary |

### 4.18 Modal inventory (behavioural specs)

#### Decision commit confirm

| | |
|--|--|
| **Purpose** | Prevent accidental high-stakes Approve |
| **Primary Question** | Confirm this Decision binds now? |
| **Inputs** | Decision summary; Outcome names; actor |
| **Outputs** | Confirm leads to commit; Cancel remains on detail |
| **Success** | Authority unmistakable |
| **Failure** | Used for every trivial toggle; celebration |

#### Trust scope explain

| | |
|--|--|
| **Purpose** | Progressive Trust clarity before grant |
| **Primary Question** | What does this permission unlock for judgement? |
| **Inputs** | Connector; minimum scopes; unlock sentence |
| **Outputs** | Continue to grant, or Not now |
| **Success** | Least privilege understood |
| **Failure** | Walls Today until accepted |

#### Light Intent / Focus edit

| | |
|--|--|
| **Purpose** | Fast correction of framing |
| **Primary Question** | Is Focus / Non-Focus right for this horizon? |
| **Inputs** | Draft Intent fields; Outcome id refs |
| **Outputs** | Save refreshes Today ranking; Cancel |
| **Success** | Light, reversible, no OKR exam |
| **Failure** | Full strategy workshop forced mid-morning |

#### Command palette

| | |
|--|--|
| **Purpose** | Jump across existing map |
| **Primary Question** | Where do I need to go? |
| **Inputs** | Query; destinations; known objects |
| **Outputs** | Navigate to owning screen |
| **Success** | Lands in SoT owner |
| **Failure** | Results page as second home; search used as judgement |

#### Destructive confirm and Undo window

| | |
|--|--|
| **Purpose** | Safe reverse of reversible mistakes; confirm irreversible risk |
| **Primary Question** | Did I mean this — can I recover? |
| **Inputs** | Act summary; time window for undo |
| **Outputs** | Confirm / Undo / Dismiss |
| **Success** | Dignity; audit intact for true commits |
| **Failure** | Undo that silently erases Decision history |

### 4.19 Screen inventory completeness rule

Any newly proposed screen must add a full inventory row (Purpose through Failure) to this blueprint in a versioned amendment before wireframes. Screens may not appear only because a route file exists.

### 4.20 Composite surfaces note

Board Mode is a posture on Today, not a separate inventory screen. Quiet Mode is a notification posture, not a destination. Attention Budget is chrome, not a primary. Treat them as modifiers in journeys and states — not as seventh doors.

### 4.21 Secondary utility screens (condensed inventory)

Calendar, Meetings, and Initiatives share a pattern:

- **Purpose:** Provide rhythm or execution detail that feeds Observe/Execute.
- **Primary Question:** What context do I need for judgement or commitment?
- **Inputs:** Events, meeting records, initiative progress linked to Outcomes.
- **Outputs:** Prep awareness; Action links; return to Today or Actions.
- **Navigation:** Utility only — never primary.
- **Entry:** Today calendar context; Actions; Outcome Health.
- **Exit:** Today preferred.
- **Success:** Context without becoming a competing home.
- **Failure:** Elevating Calendar or Initiatives to primary navigation.

Organisation, Team, Billing share a pattern:

- **Purpose:** Tenancy and commercial enablement.
- **Primary Question:** Who are we, who has access, what is our plan?
- **Success:** Lower emotional temperature than Today; enabling clarity.
- **Failure:** Capturing first-session attention before Magic Moment.

---

## 5. Screen Relationships

### Relationship diagram (conceptual)

```
                    [Intent utility] ←strip—
                            │
[Outcome Health] → [Outcomes] ←——— id refs ———┐
                            │                 │
                            ▼                 │
                     [Today Briefing] ←——————─┤
                      │    │    │             │
          deep links  │    │    │             │
         ┌────────────┼────┼────┼─────────┐   │
         ▼            ▼    ▼    ▼         ▼   │
   [Decisions]   [Insights] [Actions] [Knowledge] [Reports]
         │            │        │          │         │
         └──────── object links / citations ────────┘
                            │
                    [Assistant] (secondary)
                            │
              [Calendar][Meetings][Initiatives] (utility)
                            │
              [Trust/Settings/Org/Team/Billing] (utility)
```

### Ownership rules in relationships

- Today **derives**; does not own Outcomes/Decisions.  
- Reports **derive** narratives; do not fork portfolios.  
- Recommendations live as intelligence until Approve creates/updates Decision.  
- Assistant **points**; Decisions/Outcomes remain SoT.  
- Initiatives support Actions/Outcomes — not a competing primary.  

### Relationship integrity checks

Before adding a link between screens: Which SoT owns the object? Does the link preserve Outcome grounding? Does it create a second home for morning attention? If yes to the last — reject.

### Object thread model

An **object thread** is the chain of screens visiting the same Decision, Outcome, Action, or Insight identity.

**Rules:**

- Cross-primary navigation should preserve thread identity in context.  
- Breaking a thread (landing on an unrelated object) requires clear user intent (new search/palette choice).  
- Assistant suggestions must name the object before switching threads.  
- Reports cite objects; they do not silently retarget the live Decision under edit.  

### Chrome ↔ content relationships

| Chrome | Relates to | Must not |
|--------|------------|----------|
| Outcome Health | Outcomes SoT | Become a second Briefing |
| Account | Utility cluster | Contain primary jobs |
| Attention Budget (future) | Cognitive load signal | Become gamified score destination |
| Logo | Today | Ever go to marketing in-product |

### Derived vs owned edges

| Edge | Type |
|------|------|
| Today → Decision Detail | Deep link to owned Decision |
| Today ← Intent strip | Derived presentation of Intent SoT |
| Report → Outcome | Citation / derive |
| Insight → Outcome | Required link when consequential |
| Action → Outcome | Required ownership edge |
| Assistant → Decision | Proposal pointer only |

---

## 6. Navigation Flows

### 6.1 Global navigation rules

- One primary active; nested inherits.  
- Logo → Today.  
- Back restores judgement context (SPEC_006).  
- Palette jumps to owning screens.  
- Mobile: six peers visible preferred.  

### 6.2 Morning Briefing branches

```
Today
 ├─ Stay / leave product (success path)
 ├─ Board Mode on/off
 ├─ Intent strip → Intent utility → Today
 ├─ Outcome Health → Outcomes → (Detail) → Today|Decisions|Actions
 ├─ Priority Decision → Decision Detail → Approve/Defer/... → Today|Register
 ├─ Insight → Insight Detail → Decision/Action → ...
 ├─ Action → Action Detail → ...
 ├─ Calendar context → Calendar|Meeting → Today|Actions
 ├─ Ask… → Assistant → deep link back to structure
 ├─ Gap/Trust CTA → Trust Zone → Today
 └─ Primary switch → other primary (job change)
```

### 6.3 Decision Review branches

```
Decision Detail
 ├─ Approve → settled → optional Action spawn → exit
 ├─ Reject → closed → exit
 ├─ Defer → deferred → exit
 ├─ Escalate / Delegate → waiting ownership → exit
 ├─ Undo (window) → prior reversible state
 ├─ Reopen (if closed) → active
 ├─ Expand evidence → Knowledge/Insight → return
 ├─ Open Outcome → return
 └─ Cancel / Back → Register|Today
```

### 6.4 First Launch branches

```
Sign in
 ├─ Existing user → Today
 └─ New → Onboarding (short)
      ├─ Infer drafts → light confirm Intent/Outcomes
      ├─ Optional connector (min scope)
      ├─ Skip connector → Today with gaps
      └─ Completion → Today Magic Moment
```

### 6.5 Trust branches

```
Gap visible on Today
 ├─ Ignore (valid) → continue with honesty
 └─ Connect → Trust Zone
      ├─ Grant → return Today (richer Observe)
      ├─ Decline → Today unchanged + honest gap
      └─ Later revoke → degrade gracefully
```

### 6.6 Board Preparation branches

```
Today → Board Mode → present from Briefing truth
Reports → compose/export → optional source deep links
Both may combine; neither invents alternate SoT
Exit → normal density Today
```

### 6.7 Exit catalogue (all journeys)

| Exit type | Meaning |
|-----------|---------|
| **Leave product** | Clarity carried into the day |
| **Logo → Today** | Recover centre |
| **Back** | Prior judgement context |
| **Primary switch** | New job |
| **Utility complete** | Return preferred to Today |
| **Commit complete** | Settled authority act |
| **Defer** | Timing chosen; stakes kept |

### 6.8 Knowledge Discovery navigation

```
Knowledge Entry
 ├─ Focus node / subgraph
 ├─ Open cited Decision → Decision Detail → back to Knowledge or Today
 ├─ Open Outcome → Outcomes → back
 ├─ Related Insight → Insights
 └─ Exit primary → Today
```

### 6.9 Reporting navigation

```
Reports Library
 ├─ New report → Compose (SoT pickers) → draft → publish/export
 ├─ Open existing → edit/export
 ├─ Source deep link → Decision/Outcome (thread) → return Reports
 └─ Exit → Today
```

### 6.10 Settings navigation

```
Account
 ├─ Intent / Outcomes (strategic utilities)
 ├─ Organisation / Team
 ├─ Settings Organisation / Billing
 ├─ Integrations (Trust journey)
 ├─ Admin (entitled)
 └─ Sign out
Any leaf → prefer return Today
```

### 6.11 Dead ends to eliminate

Navigation flows must not terminate in:

- Utility without path home  
- Assistant without deep link  
- Error without recovery  
- Empty state without one constructive act or dignified quiet  

---

## 7. Interaction Flows

### 7.1 Decision Flow

```
Recognise (Outcomes + Intent alignment + question)
  → Understand (why, evidence, alternatives) [disclosure]
  → Recommendation proposal (optional; after explain)
  → Human act: Approve | Reject | Defer | Escalate | Delegate
  → Confirm if high stakes
  → Persist attributed state
  → Optional Undo window
  → Optional Execute: create Action
  → Learn later: Review
```

AI drafts language/options; never completes Approve.

### 7.2 Recommendation Flow

```
Engine ranks survivors (SPEC_002)
  → Today/Insights presents sparse proposal
  → Recognition + explanation visible
  → Executive: Open | Defer noise | Dismiss learn signal | Act via Decision/Action deep link
  → Never: auto-commit | notification spam | bulk clear
```

### 7.3 AI Flow

```
Need explain/draft?
  ├─ No → silence (valid)
  └─ Yes → appear as advisor
       → Stream if long draft (interruptible)
       → Show confidence/gaps honestly
       → Human edit / override / confirm
       → Disappear when structured path resumes
Assistant branch: converse → deep link → structure binds
```

### 7.4 Trust Flow

```
Value present (partial Briefing)
  → Named gap
  → One-sentence unlock ask
  → Trust Zone grant minimum | decline
  → Observe updates | graceful degrade
  → Broader scopes only after further value
```

### 7.5 Outcome Flow

```
Health signal or review intent
  → Portfolio or Detail
  → Understand health/blockers
  → Link to Decision (judge) or Action (unblock) or Intent (reframe)
  → Amend Outcome SoT when human owns change
  → Return Today
```

### 7.6 Report Flow

```
Need outward narrative
  → Reports Library
  → Compose from SoT (no fork)
  → AI section drafts optional
  → Human publish/export
  → Optional Board Mode on Today for live composure
```

### 7.7 Correction / Learn Flow

```
Executive sees wrong inference (Intent Focus, ranking, recommendation)
  → Light correction (edit Focus; defer; dismiss with reason optional)
  → State updates without shame ceremony
  → Learn signal recorded for Engine
  → Today/Insights reflect change calmly
```

Corrections are Progressive Trust made tactile (SPEC_003/006).

### 7.8 Board Mode Flow

```
Need presentation composure
  → Enable Board Mode on Today
  → Density restraint; same SoT
  → Optional Quiet Mode for alerts
  → Optional jump to Reports for formal pack
  → Disable Board Mode → restore normal Briefing density
```

Board Mode is posture, not a separate product reality.

### 7.9 Create Decision Flow

```
Need new judgement object
  → From Decisions Register or Outcome Detail (preferred) or Today (if explicit)
  → Require ≥1 Outcome
  → Capture question / stakes
  → Optional AI draft framing
  → Save draft OR move to Decide acts
  → Never create orphan Decision
```

### 7.10 Flow composition rule

Flows compose; they do not fork doctrine. A Trust Flow may occur inside Morning Briefing. A Correction Flow may occur inside Decision Review. Composition must leave ownership and authority rules intact.

---

## 8. Empty States

Empty states must feel **composed incompleteness** — not shame, not hopeful AI theatre (SPEC_005).

| Screen | Empty meaning | Behaviour |
|--------|---------------|-----------|
| **Today** | Quiet day or new mandate | Honest quiet; still show Intent if known; invite light framing if missing — not widget filler |
| **Decisions Register** | No Decisions yet | Path to create Outcome-linked Decision; or return Today |
| **Decision Detail** | N/A (404-like) | Recover to Register; do not invent |
| **Insights** | No depth yet | Point to Today synthesis; do not force chat |
| **Actions** | No commitments | Explain Execute stage; link from Decisions |
| **Knowledge** | Sparse memory | Honest thin graph; do not fake nodes |
| **Reports** | None yet | Start from SoT; Board Mode tip without BI bait |
| **Intent** | Missing framing | Draft-confirm path; First Launch pattern |
| **Outcomes** | None yet | Concierge capture; block orphan Decisions |
| **Trust Zone** | None connected | Value-first copy; minimum scopes listed |
| **Assistant** | No thread | Suggest structured questions that deep-link |
| **Onboarding** | N/A | Short path; never empty-dashboard land |

**Forbidden empty behaviours:** confetti; “connect everything”; fake demo metrics presented as live truth without label; chat-only recovery.

### Empty state quality bar

For each major empty state, wireframes must show:

1. What is still true (Intent? Org name? Last sync?)  
2. What is missing (named gap)  
3. One constructive next act **or** dignified quiet  
4. Path home (Today)  

Empty states that only market features fail Value Before Commitment.

### Quiet day versus broken empty

| Condition | UX meaning |
|-----------|------------|
| Quiet day | Success of Calm; Silence Is A Feature |
| No Outcomes configured | Activation gap — concierge, not shame |
| AI unavailable | OS still boots — not empty product |
| Connector down | Trust failure — degrade, don’t blank the OS |

---

## 9. Loading States

Loading preserves hierarchy and prefers partial truth (SPEC_006).

| Screen | Loading behaviour |
|--------|-------------------|
| **Today** | Structure of triad regions first; lead content as soon as trustworthy; meta sync honesty; no entertainment spinner as hero |
| **Decisions** | Register skeleton; do not block filters that already have data |
| **Decision Detail** | Identity + Outcome linkage early; evidence may progressive-load |
| **Insights** | Hub list first; depth on demand |
| **Actions** | Queue structure; blockers when ready |
| **Knowledge** | Entry shell; focus load on navigate |
| **Reports** | Library first; compose loads sources with gap labels |
| **Intent / Outcomes** | SoT fetch with calm placeholder; no false health |
| **Trust Zone** | Connector list; status per grant |
| **Assistant** | Interruptible generation; cancel always |

**Cross-cutting:** Offline declaration; slow connection prioritises Today triad; stale labelled; no bait-and-switch mid-Approve.

### Loading sequencing (Today critical path)

1. Shell chrome available (Logo, nav, Account)  
2. Intent strip when ready (or honest absence)  
3. Lead judgement region  
4. Supporting sparse survivors  
5. Heavier Insights/Knowledge depth only on demand  

Never invert: do not load graph spectacle before lead judgement.

### Loading and motion

Motion during load confirms readiness — it does not entertain (SPEC_005/006). Reduced motion: instant structural appearance with textual readiness indicators.

---

## 10. Error States

| Screen | Recoverable | Fatal / hard | Trust / permission |
|--------|-------------|--------------|--------------------|
| **Today** | Partial Briefing + retry meta | Admit boot failure + recover to reload/sign-in | Gaps + CTA to Trust; never ransom lock |
| **Decisions** | Retry list; keep drafts | Hard fail message + Register recover | Cannot create if Outcomes missing — validate with teaching |
| **Decision Detail** | Save draft fail → keep local draft + retry | Cannot bind — say so | Permission deny with admin path |
| **Insights** | Retry fetch; Today still works | Non-blocking to OS | — |
| **Actions** | Retry; Decision path remains | — | — |
| **Knowledge** | Degrade to citations list | — | — |
| **Reports** | Draft preserved on export fail | Publish fail clear | Export Trust limits explained |
| **Intent/Outcomes** | Conflict → human choose (SPEC_006) | — | — |
| **Trust Zone** | Re-auth connector | — | Core of Trust failures |
| **Assistant** | Cancel/retry generation | OS usable without AI | — |
| **Global** | Undo where reversible | Fatal overlay with recovery | Re-auth for sensitive commits explained |

**Principle:** Name failure; preserve truth; smallest next step; no shame; no fake success.

### Error severity model (UX)

| Severity | Executive experience | Example |
|----------|----------------------|---------|
| **Soft** | Continue with gap label | One insight failed to load |
| **Hard on act** | Block only the failing commit | Cannot Approve while conflict unresolved |
| **Session** | Must recover session | Auth expired |
| **Product** | Today cannot boot | Catastrophic client failure |

Soft errors must not escalate to product-blocking walls. Product errors must not pretend to be soft.

### Conflict resolution UX

When draft Decision conflicts with server state: present both; human chooses; never last-write-wins silently on leadership commits (SPEC_006).

---

## 11. UX Validation Checklist

Use this checklist to validate **future wireframes and flows**. Every item must pass before visual design lock.

### Doctrine & category

- [ ] Experience is DecisionOS — not dashboard, CRM, or chat-home  
- [ ] Confidence Through Clarity is the explicit outcome of the flow  
- [ ] Core Executive Loop stage(s) strengthened are named  
- [ ] No contradiction with Constitution Article III (six primaries; Logo→Today)  
- [ ] No contradiction with PRODUCT_SPEC_001–006  

### Navigation & IA

- [ ] Primaries are exactly Today · Decisions · Insights · Actions · Knowledge · Reports  
- [ ] Outcomes, Intent, Settings, Calendar, Assistant are not primary  
- [ ] Logo control targets Today  
- [ ] Deep links are surgical and returnable  
- [ ] Back restores judgement context  
- [ ] Nested routes inherit primary identity  
- [ ] Mobile plan keeps judgement peers reachable  

### Screen purpose

- [ ] Each screen has one primary question  
- [ ] One centre of attention per view region  
- [ ] Progressive disclosure ladder defined  
- [ ] Ownership respected (no dual SoT writes)  

### Judgement & authority

- [ ] Approve/Reject/Defer/Escalate/Delegate/Undo/Reopen behaviours match SPEC_006  
- [ ] Decisions always Outcome-linked  
- [ ] Recommendations distinct from Decisions  
- [ ] AI cannot bind organisational judgement  
- [ ] Attribution/audit path exists for commits  

### AI & intelligence

- [ ] AI appears only as advisor craft  
- [ ] Silence paths exist  
- [ ] Streaming interruptible; never auto-approve  
- [ ] Drafts confirm; overrides light  
- [ ] Assistant deep-links into structure  

### Trust & first value

- [ ] First Launch reaches partial Briefing before broad asks  
- [ ] Trust asks explain unlock in one sentence  
- [ ] Decline/revoke degrade gracefully  
- [ ] No configuration-first ransom  

### Calm & pressure

- [ ] Notification behaviour rare and explained  
- [ ] Quiet/Board Mode defined without alternate truth  
- [ ] Board prep uses Reports + Board Mode correctly  
- [ ] Time-pressure path: scan → one act → leave  

### States

- [ ] Empty = composed incompleteness (per §8)  
- [ ] Loading = hierarchy-preserving partial truth (per §9)  
- [ ] Error = named, recoverable, honest (per §10)  
- [ ] Offline/stale labelled; no invented live metrics  

### Interaction & a11y

- [ ] Keyboard can complete authority acts  
- [ ] Focus order follows triad  
- [ ] Reduced motion: meaning without animation  
- [ ] Status not colour-only  
- [ ] No swipe/hover accidental Approve  

### Anti-patterns absent

- [ ] No seventh primary / AI Hub / Dashboard-as-home  
- [ ] No gamification / streaks / badge addiction  
- [ ] No infinite feed as judgement model  
- [ ] No bulk leadership approve  
- [ ] No shadow portfolio in Reports  
- [ ] No chat as Decision SoT  
- [ ] No celebration theatre on commit  

### Journey coverage

- [ ] Morning Briefing  
- [ ] Decision Review  
- [ ] Outcome Review  
- [ ] Board Preparation  
- [ ] Knowledge Discovery  
- [ ] Reporting  
- [ ] Settings  
- [ ] Trust  
- [ ] First Launch  

### Sign-off

- [ ] Product doctrine owner pass  
- [ ] UX architecture pass (this blueprint)  
- [ ] Ready for wireframes (not before)  

---

## Appendix A — Briefing Content Architecture (Today)

Aligned to PRODUCT_SPEC_001/003 and IA — conceptual regions only:

1. Intent context (strip)  
2. Lead judgement (what / why / what to do)  
3. Outcome Health / consequential overnight change  
4. Priority Decisions (sparse)  
5. Top insights (sparse)  
6. Recommended actions (sparse)  
7. Calendar context (rhythm, not hero)  
8. Meta: sync, gaps, Trust honesty  

Exclusions remain binding: chat-home, equal widgets, charts-first, admin, full graph, Non-Focus noise, fabricated completeness.

---

## Appendix B — Journey × Loop Matrix

| Journey | Intent | Observe | Understand | Decide | Execute | Learn | Refine |
|---------|--------|---------|------------|--------|---------|-------|--------|
| Morning Briefing | show | gaps | synthesise | deep link | sparse actions | — | strip |
| Decision Review | align | — | evidence | **commit** | spawn | history | — |
| Outcome Review | align | health | blockers | link | link | — | maybe |
| Board Prep | frame | — | narrative | rare | — | — | — |
| Knowledge | — | — | **depth** | cite | — | **memory** | — |
| Reporting | include | — | narrate | — | — | outward | — |
| Settings | — | — | — | — | — | — | prefs |
| Trust | — | **grant** | — | — | — | — | — |
| First Launch | **draft** | optional | first synth | — | — | correct | seed |

---

## Appendix C — Relationship to Prior Documents

| Document | Role vs this Blueprint |
|----------|------------------------|
| Executive Experience Blueprint | Experience philosophy & Magic Moment — upheld and operationalised |
| PRODUCT_SPEC_004 | IA destinations — product map obeys |
| PRODUCT_SPEC_005–006 | Design language & interaction — flows obey |
| `INFORMATION_ARCHITECTURE.md` | Design IA — aligned; blueprint expands journeys/states |
| Older `UX_PRINCIPLES.md` trees | Superseded where they show Intelligence Center / multi-primary sprawl |

---

## Appendix D — Wireframe Entry Rules

Wireframes may begin only when:

1. This blueprint’s checklist (§11) is accepted for the scope in question.  
2. Screen inventory rows exist for every screen in scope.  
3. Empty/loading/error behaviours are agreed.  
4. No open doctrine contradiction remains.

Wireframes define structure of regions and flow — still without treating colour/type/component polish as the source of truth. Design System comes after behavioural and structural ratification.

---

## Appendix E — Persona Pressure Tests

Validate wireframes against these scenarios (no UI invention — behavioural pass/fail):

1. **Five-minute morning** — Can the triad be answered and one Decision deferred or opened?  
2. **Board in ten minutes** — Board Mode + key Outcome language without BI rebuild?  
3. **AI outage** — Today and Decisions still usable?  
4. **Salesforce revoked** — Gaps honest; no zombie pipeline?  
5. **Wrong Intent Focus** — Correctable in under a minute without leaving dignity?  
6. **Mobile between meetings** — Six peers reachable; no accidental Approve?  
7. **First day enterprise admin** — Trust Zone clear; morning not stolen?  
8. **Solo founder day one** — Magic Moment without full connector set?  

Any scenario fail blocks visual polish for that scope.

---

## Appendix F — Screen Priority for Implementation Planning

This is not an engineering plan. It is UX sequencing so wireframes do not invert doctrine.

| Priority | Screens / postures | Why first |
|----------|--------------------|-----------|
| P0 | Today, Decision Detail, Intent utility, Outcomes Detail | Loop centre: framing, measurement, judgement |
| P0 | First Launch → Today | Magic Moment |
| P1 | Decisions Register, Trust Zone, Board Mode posture | Authority, Progressive Trust, pressure |
| P2 | Actions Queue/Detail, Insights Hub/Detail | Execute and Understand depth |
| P3 | Knowledge, Reports | Memory and outward narrative |
| P4 | Calendar, Meetings, Initiatives, Assistant | Supporting utilities/secondary |
| P5 | Billing, Admin, Team polish | Enablement after value |

Wireframing P3 spectacle before P0 ratification is a process failure.

---

## Appendix G — Glossary (UX usage)

| Term | UX meaning |
|------|------------|
| **Today** | Executive Briefing primary |
| **Briefing** | Content/experience of Today |
| **Decision** | Durable judgement object |
| **Recommendation** | Non-binding proposal |
| **Outcome** | Strategic business-state SoT object |
| **Intent** | Horizon framing context |
| **Action** | Execution commitment |
| **Trust Zone** | Integrations progressive permission UX |
| **Board Mode** | Presentation density posture on Today |
| **Object thread** | Cross-screen continuity of one entity |
| **Deep link** | Surgical navigation into owning screen |
| **Utility** | Non-primary destination |

---



---

## Appendix H — Blueprint Change Control

Amendments to this blueprint require:

1. Explicit statement of which doctrine documents remain unviolated.
2. Updates to affected Screen Inventory rows.
3. Updates to journeys, navigation branches, and empty/loading/error if impacted.
4. Re-run of the UX Validation Checklist for the changed scope.
5. Version bump (v1.x) with a short change note at the top of the file.

Quiet drift — new screens appearing in code without blueprint rows — is a governance defect. The blueprint is the architectural source of truth for experience structure until replaced by a later major version.

*UX Blueprint v1 — Complete experience architecture for ExecutiveOS. Judgement first. Six doors. One centre. Human authority. Clarity carried forward.*
