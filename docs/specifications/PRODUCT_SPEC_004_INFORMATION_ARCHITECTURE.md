# PRODUCT_SPEC_004 — Information Architecture

**Status:** Formal product specification (conceptual information architecture)  
**Version:** 1.0  
**Role:** Translates Product Doctrine into coherent product structure — where information lives, why, and how executives move through the Decision Operating System  
**Authority:** Bound by Constitution · Narrative v1.1 · Product Strategy · Product Principles · Core Executive Loop · PRODUCT_SPEC_001–003 · Executive Experience Blueprint · ADR-004 and related ADRs  

**Nature:** Conceptual IA — not UI design, navigation mockups, wireframes, technical architecture, database design, or engineering.

This specification and the Constitution agree: **exactly six primary destinations**. Outcomes, Intent, and Settings are essential product areas — they are **not** seventh primary items. Placement is a judgement about cognitive load, not a denial of importance.

---

## 1. Information Architecture Philosophy

### Why IA is critical to a Decision Operating System

A Decision Operating System fails when structure competes with judgement.

If every capability demands equal top-level presence, the product becomes a suite. Suites optimise for feature discovery. DecisionOS optimises for **ranked understanding under time pressure**. Information Architecture is therefore not a map of everything the company built. It is a deliberate reduction of the world into places an executive can hold in working memory while answering:

1. What requires my attention?  
2. Why?  
3. What should I do?

The Core Executive Loop needs a home:

```
Intent → Observe → Understand → Decide → Execute → Learn → Refine Intent
```

IA assigns each stage a place — without requiring the executive to tour the loop as a museum of modules. **Today** synthesises. Other areas deepen. Chrome (Outcome Health) persists without becoming a destination war.

### Why IA should reduce cognitive load rather than expose functionality

Product Principles bind IA:

- **Reduce Cognitive Load** — six primary items, not twelve  
- **Calm Over Noise** — structure that invites scanning everything has already failed  
- **Every Screen Answers One Question** — each area has a job; orphans do not get nav seats  
- **Progressive Disclosure** — depth is earned by need, not by equal menu weight  
- **Outcome Before Interface** — Outcomes organise attention even when Outcomes is not a primary tab  

Exposing functionality is the default instinct of software organisations. Reducing cognitive load is the discipline of DecisionOS. When those conflict, **reduction wins**.

Narrative’s discipline to say no applies here: another top-level item that does not strengthen executive judgement should not be added — even if a team wants “discoverability.”

### IA as experience contract

PRODUCT_SPEC_003 requires that mornings boot judgement, not browse modules. IA is how that contract is kept: Logo → Today; six peers; utility for the rest; deep links from Briefing into Decisions, Outcomes, Intent, Actions — then return.

### IA and the discipline to say no

Every mature product organisation accumulates “just one more top-level item”: Marketplace, Automations, AI Hub, Inbox, Apps, Favourites. Each item is locally rational. Collectively they destroy DecisionOS.

This specification’s philosophy is therefore negative as well as positive: **the default answer to a new primary destination is no.** The burden of proof is on the proposer to show that executive judgement fails without it — and that utility, chrome, or disclosure cannot serve the need.

### IA versus sitemap thinking

A sitemap lists pages. Information Architecture for DecisionOS assigns **jobs** and **ownership**. Pages may multiply behind progressive disclosure; jobs at the primary layer must not. When UX asks “where does this page go?”, the first answer is “which job does it serve?” — not “which menu has space?”

---

## 2. Primary Navigation

### Canonical primary destinations (exactly six)

| Primary | Job in one line |
|---------|-----------------|
| **Today** | Boot judgement — Executive Briefing |
| **Decisions** | Register and advance leadership judgement |
| **Insights** | Depth of explained intelligence (advisor craft, not chat-home) |
| **Actions** | Commitments that execute judgement toward Outcomes |
| **Knowledge** | Memory and connected context for understanding |
| **Reports** | Leadership narrative outward (board / ELT / periodic) |

### Why each exists

**Today** exists because the Decision Operating System needs a daily boot sequence (ADR-004, PRODUCT_SPEC_001–003). Without Today as default, ExecutiveOS collapses into a tool drawer.

**Decisions** exists because judgement must have a durable home linked to Outcomes (ADR-002). Briefing prepares; Decisions commits and remembers.

**Insights** exists because understanding sometimes needs depth beyond the Briefing’s sparse survivors — always explain-before-recommend; never an AI playground as identity (Constitution vocabulary: Insights over “AI”).

**Actions** exists because Decide without Execute is theatre. Commitments close the loop toward Outcomes (Execution Engine direction; Actions as product language).

**Knowledge** exists because Learn requires memory. Graph/memory metaphors live inside Knowledge; the word in nav is Knowledge, not Graph.

**Reports** exists because organisational judgement must sometimes be communicated outward without turning Today into a BI pack builder.

### Why Outcomes is not a seventh primary

Outcomes are the **personalisation and business-state axis** (ADR-001). That makes them *more* important than many primary items — and that is why they must not fight for a seventh tab.

Outcomes appear as:

- Persistent **Outcome Health** chrome (not a nav item)  
- Briefing sections and deep links  
- Utility / command destination (`/outcomes`) for portfolio and detail  

Elevating Outcomes to primary would either:

- Dilute the Briefing’s role as synthesis, or  
- Create two “homes” for morning attention  

Constitution Article III forbids a seventh primary. This specification upholds that rule.

### Why Intent is not a seventh primary

Intent **frames** the system (ADR-006). Its daily exposure is the Briefing Intent strip. Full Intent detail is a **utility** destination (`/intent`). Making Intent primary would invite OKR-gardening behaviour and compete with Today’s boot job.

### Why Settings is not primary

Settings, organisation, billing, integrations, team, and admin are **Account / Organisation utility**. They enable Progressive Trust and tenancy; they do not prepare morning judgement. Primary nav that includes Settings trains “configure first” behaviour — the opposite of Value Before Commitment and Briefing-first doctrine.

### Rule for additional top-level navigation

No additional primary destination may exist unless it **strengthens executive judgement** *and* cannot be served by:

- Today synthesis, or  
- One of the five peer primaries, or  
- Utility / chrome / progressive disclosure  

Feature teams do not earn nav seats by shipping. They earn placement by surviving Product Principles review and, if needed, Constitution amendment.

### Shell chrome (not primary nav)

| Chrome | Role |
|--------|------|
| **Logo / wordmark** | Always → Today |
| **Outcome Health** | Persistent portfolio signal → Outcomes utility |
| **Account** | Utility cluster (Intent, Outcomes, Settings, org, billing, integrations, team) |
| **Command palette** | Jump to primary + utility without expanding primary set |
| **Attention Budget** (when shipped) | Companion to health — cognitive load signal, not a destination |

---

## 3. Purpose of Every Area

### 3.1 Today (Executive Briefing)

| | |
|--|--|
| **Purpose** | Daily boot of judgement — Confidence Through Clarity |
| **Questions answered** | What requires my attention? Why? What should I do? What is our Intent? |
| **Information it presents** | Derived synthesis: Intent context, lead judgement, Outcome Health, overnight change, priority decisions, sparse insights/actions, calendar context |
| **Information it deliberately excludes** | Chat-home, equal widgets, charts-first, setup/admin, full graph, Non-Focus noise, fabricated completeness (PRODUCT_SPEC_001 §6) |
| **Owns** | Nothing as business-state SoT — **derives only** (ADR-001, ADR-003) |
| **Relationships** | Consumes Intent, Outcomes, Decisions, Actions, Insights, signals via Decision Intelligence Engine; deep-links out; Logo returns here |

**Experiential note:** Today is allowed to feel complete even when other primaries are immature. A useful Briefing with thin Insights/Reports is coherent DecisionOS. A rich Insights primary with a weak Today is not.

### 3.2 Decisions

| | |
|--|--|
| **Purpose** | Durable register of leadership judgement linked to Outcomes |
| **Questions answered** | What choice matters? What did we decide? What is deferred? What is the cost of delay? |
| **Information it owns** | Decision records (question, status, evidence, alternatives, stakeholders, history) — on portfolio per ADR-002 |
| **Excludes** | Standalone decisions without Outcomes; task lists; chat threads as decision SoT |
| **Relationships** | Always → Outcomes; may spawn Actions; prepared by Today; alignment with Intent derived via Outcomes |

**Experiential note:** Decisions is where authority is exercised. Today prepares; Decisions commits. Confusing those jobs — deciding inside an ephemeral chat, or turning Decisions into a task board — breaks the loop.

### 3.3 Insights

| | |
|--|--|
| **Purpose** | Depth of explained intelligence beyond Briefing sparsity |
| **Questions answered** | What do we understand more deeply? Why this recommendation? What are advisors contributing? |
| **Information it presents** | Insight archives, explained analyses, advisor consultation surfaces — subordinate to OS metaphor |
| **Excludes** | Chat as product home; sparkles; recommendations without explanation; role-ranked “AI features” as identity |
| **Owns** | Insight artefacts as intelligence records — **not** Outcome/Decision business state |
| **Relationships** | Must link to Outcomes where consequential; feeds Today as sparse top insights; never replaces Briefing |

**Experiential note:** Insights is where “explain before recommend” gets room to breathe. It must never siphon the morning boot. If Insights becomes more habitual than Today, IA and experience have inverted.

### 3.4 Actions

| | |
|--|--|
| **Purpose** | Commitments that execute judgement toward Outcomes |
| **Questions answered** | What must happen? What is blocked? Who owns the commitment? |
| **Information it owns** | Execution commitments (when Execution Engine is live) — linked to Outcomes; optionally to Decisions |
| **Excludes** | Generic PM / sprint boards as identity; orphan tasks; initiative WBS as SoT |
| **Relationships** | Outcomes required; Decisions optional parent; Today surfaces recommended actions sparsely |

**Experiential note:** Actions is execution language for executives — commitments and blockers — not engineering issue trackers. Vocabulary and ownership must stay Outcome-linked.

### 3.5 Knowledge

| | |
|--|--|
| **Purpose** | Institutional memory and connected context for Understand / Learn |
| **Questions answered** | What do we know? What is related? What have we learned before? |
| **Information it owns** | Knowledge graph / memory representations — supporting context |
| **Excludes** | Becoming the morning home; replacing Briefing synthesis; document repository identity (Narrative non-goals) |
| **Relationships** | Informs Understand; cited from Decisions/Outcomes; progressive disclosure from Today |

**Experiential note:** Knowledge is for when understanding needs memory. It is not a second Briefing. Graph visuals may live inside; nav label remains Knowledge.

### 3.6 Reports

| | |
|--|--|
| **Purpose** | Outward leadership narrative — board, ELT, periodic review |
| **Questions answered** | What must be communicated? What story matches operating truth? |
| **Information it presents** | Derived narratives from Intent, Outcomes, Decisions, Actions — **does not invent a second portfolio** |
| **Excludes** | BI dashboard suite identity; charts-led primary UX; private morning Briefing replacement |
| **Relationships** | Draws from engines; Board Mode on Today is calm posture, not a substitute for formal Reports when needed |

**Experiential note:** Reports is communication of judgement, not exploration of data. If Reports requires rebuilding truth, ownership has leaked.

### 3.7 Outcomes (utility / chrome-linked)

| | |
|--|--|
| **Purpose** | Portfolio and detail for strategic Outcomes — business-state SoT |
| **Questions answered** | How will we know? How healthy are we? What blocks results? |
| **Information it owns** | Outcome records and portfolio health (ADR-001) |
| **Excludes** | Primary nav seat; OKR % theatre; role-based reordering of priority |
| **Relationships** | Personalisation axis for Today; Decisions/Actions link here; Intent references by id; Health chrome → here |

### 3.8 Intent (utility / Briefing strip)

| | |
|--|--|
| **Purpose** | Strategic focus / mandate for the horizon — context, not goal tracker |
| **Questions answered** | What are we trying to achieve this period? What is Non-Focus? What constraints bind? |
| **Information it owns** | Active Intent + history on portfolio (ADR-006) — id refs to Outcomes only |
| **Excludes** | Primary nav; duplicate Outcome health; OKR completion scores |
| **Relationships** | Frames ranking; Briefing strip is daily exposure; full detail at utility `/intent` |

### 3.9 Settings / Account (utility)

| | |
|--|--|
| **Purpose** | Tenancy, Progressive Trust connectors, preferences, billing, team, admin |
| **Questions answered** | What is connected? Who has access? What did we permit? |
| **Information it owns** | Preferences, integration grants, org settings — **not** business judgement state |
| **Excludes** | Primary nav; ransom walls before Briefing value |
| **Relationships** | Enables Observe; graceful degradation when revoked; Trust Zone home |

### 3.10 Insights vs Intent vs Outcomes — placement clarity

| Concept | Nav class | Why |
|---------|-----------|-----|
| Insights | **Primary** | Peer depth for intelligence without making AI the home |
| Outcomes | **Utility + chrome** | SoT axis — too central to become a competing home |
| Intent | **Utility + Briefing strip** | Context lens — daily in Today, full page utility |

---

## 4. Information Ownership

### Single source of truth principle

Business state is not duplicated across areas. Surfaces **derive**. Parallel portfolios are defects (ADR-001, Product Principles §9, Core Executive Loop §6).

### Ownership map

| Concept | Owner (SoT) | Consumers (derive / present) |
|---------|-------------|------------------------------|
| **Intent** | OutcomePortfolio.intent (+ history) | Today strip, Intent utility, ranking weights, alignment badges |
| **Outcomes** | OutcomePortfolio.outcomes + health aggregates | Today, Decisions links, Actions links, Knowledge, Reports, Health chrome |
| **Decisions** | OutcomePortfolio.decisions | Today priority decisions, Decisions area, Outcome detail, Intent alignment via outcomes |
| **Actions** | Portfolio actions store (Execution, when live); until then thin refs derive carefully without dual writes | Today recommended actions, Actions area, Outcome/Decision embeds |
| **Knowledge** | Knowledge / memory domain | Knowledge area; citations into Understand |
| **Reports** | Report artefacts derived from engines | Reports area; exports |
| **Signals** | Observation layer (connected systems + internal state changes) — not a user “Signals app” | Decision Intelligence Engine → Today / Insights |
| **Insights** | Insight records (intelligence artefacts) | Insights area; sparse Today projection |
| **Recommendations** | **Derived outputs** of Decision Intelligence Engine — not a stored second truth competing with Decisions | Today, Insights, Decision detail proposals |
| **Trust / connectors** | Account / Settings (grants, scopes) | Observe availability; gap honesty in Today |
| **Preferences** | Account / Settings | Language, theme, notification principles — never outcome ranking |

### Anti-ownership rules

- Today does not own Outcomes or Decisions  
- Insights do not own Outcome health  
- Reports do not own a shadow portfolio  
- Recommendations are not Decisions until a human commits  
- Intent does not store Outcome business state — only id references and narrative context  

### Ownership and the Core Executive Loop

| Loop stage | Ownership implication |
|------------|----------------------|
| **Intent** | Owned in Intent SoT; Today only presents |
| **Observe** | Signals owned by observation layer; connectors owned by Trust/Settings |
| **Understand** | Insights / Knowledge present understanding; Outcomes remain SoT for health |
| **Decide** | Decisions area owns the register; Today prepares |
| **Execute** | Actions owns commitments; Outcomes remain the why |
| **Learn** | Knowledge / history absorb learning; Outcomes/Decisions update as SoT |
| **Refine Intent** | Intent utility (and review cadence) — not a seventh primary |

### Avoiding duplication in practice

Duplication usually arrives dressed as convenience: “copy Outcome health into the Report,” “store recommended actions as Decisions,” “keep a Briefing cache of Intent.” Convenience creates drift. Drift destroys Confidence Through Clarity.

The correct pattern is always: **one write path; many read paths.** If a surface needs a different shape, it transforms at read time — it does not fork the record.

### Recommendations versus Decisions (ownership edge)

Recommendations are the Engine’s provisional guidance. Decisions are human commitments. IA must keep them visually and structurally distinct:

- Recommendations live as derived intelligence (Today / Insights / Decision proposals)  
- Decisions live as durable register entries  

Promoting a recommendation into a Decision is an act of authority — not an automatic write. That edge protects Executive Decides and prevents the product from silently inventing judgement.

---

## 5. Navigation Philosophy

### When executives move

They move when judgement requires **depth** or **commitment**:

- Briefing → Decision detail to decide  
- Briefing → Outcome detail to understand stakes  
- Briefing → Intent utility to amend mandate  
- Briefing → Action to unblock commitment  
- Peer primary when the day’s job shifts (e.g. Reports before board)  

Movement should feel like surgical deepening — PRODUCT_SPEC_003 — not browsing.

### When they stay

They stay on Today for the morning ritual when sparse survivors suffice. Staying is success. Habit is boot-and-clear, not tour-and-explore.

### When deep links are appropriate

Deep links are the primary path from synthesis to depth:

- Every Briefing survivor should offer **one obvious path** to the owning area  
- Outcome Health chrome → Outcomes portfolio  
- Intent strip → Intent utility  
- Command palette → any primary or utility without expanding primary nav  

Deep links preserve six-item cognition while honouring SoT ownership.

### When progressive disclosure is required

Progressive disclosure is required whenever information would:

- Break Glance → Scan → Read → Deep (PRODUCT_SPEC_003)  
- Force Knowledge/Reports/Settings into the boot sequence  
- Equalise Non-Focus with Focus  
- Expose advisor/chat depth before recognition  

Disclosure is user-chosen need — not system-chosen showcase.

### Navigation anti-patterns

- Seventh primary “for discoverability”  
- Today as dashboard of equal destinations  
- Settings before value  
- Chat as a primary peer to Today  
- Duplicate “Home” and “Briefing” and “Dashboard” labels  

### Movement examples (conceptual)

| Situation | Stay / Move |
|-----------|-------------|
| Morning boot, sparse survivors clear | Stay on Today; exit to leadership work |
| Lead item is a Decision due today | Move to Decisions detail; commit; return or leave |
| Need to amend Focus boundaries | Move to Intent utility; return to Today |
| Outcome Health concerning | Move to Outcomes utility; optionally to linked Decision |
| Preparing formal board pack | Move to Reports; Board Mode on Today for calm rehearsal |
| Grant Salesforce connector after value | Move to Settings/integrations; return — Briefing gaps update |

These patterns train a mental model: **Today is home; other doors are for jobs; jobs end.**

### Cross-primary without losing the centre

Executives may traverse Decisions → Outcomes → Actions in one judgement episode. Nested routes inherit parent primary highlight. The centre remains recoverable via Logo → Today. IA must never strand the executive in a cul-de-sac of utilities without a clear path home.

---

## 6. Information Relationships

### Conceptual model

```
                    Intent (context)
                         │ frames
                         ▼
                   Outcomes (SoT)
                    │         │
         ┌──────────┤         ├──────────┐
         ▼          ▼         ▼          ▼
    Decisions   Insights   Actions   Knowledge
         │          │         │          │
         └──────────┴────┬────┴──────────┘
                         ▼
              Decision Intelligence Engine
                         │
                         ▼
                 Today (Briefing)
                         │
                         ▼
                    Reports (outward)
```

Signals enter from connected systems and human corrections → Engine reasons → Briefing presents sparse survivors → humans decide/act → Outcomes move → Intent may refine → loop continues.

### Relationship rules

| From | To | Rule |
|------|----|------|
| Decision | Outcome | ≥1 Outcome required |
| Action | Outcome | ≥1 Outcome required |
| Action | Decision | Optional parent |
| Intent | Outcome | Id refs only (Focus/Watching/Non-Focus) |
| Insight | Outcome | Preferred for consequential insights |
| Recommendation | — | Derived; becomes Decision/Action only on human commit |
| Report | Engines | Derived narrative only |

Chrome relationships

Outcome Health is a **window** onto Outcomes SoT, not a separate health database. Intent strip is a **window** onto Intent SoT.

### Relationship integrity checks

Before shipping a new object type, ask:

- Which SoT owns it?  
- Which primary or utility presents it?  
- How does Today derive or ignore it?  
- What happens if it is duplicated?  

If ownership is “everywhere a little,” stop. Duplication is how DecisionOS becomes a suite of partial truths.

---

## 7. Progressive Disclosure

### Always immediately visible (boot layer)

- Today as default landing  
- Six primary destinations  
- Outcome Health chrome  
- Intent context on Today  
- Lead judgement path on Today  
- Honest gaps when trust/connectors limit Observe  

### Always hidden until needed

- Full Intent history and constraint essays (unless strip CTA)  
- Full Outcome portfolio grids (unless Health deep link)  
- Full Decision evidence rooms  
- Knowledge graph exploration  
- Report builders  
- Settings, billing, integrations, admin  
- Advisor/chat depth  
- Notification centres as lifestyle feeds  
- Non-Focus operational detail  

### Disclosure ladder

```
Shell          Who I am / health / account
Today glance   Intent + lead + health
Today scan     Change + priority decisions
Today read     Sparse insights/actions/calendar
Deep primary   Decisions / Insights / Actions / Knowledge / Reports
Utility        Outcomes / Intent / Settings
```

Each step down is voluntary. Forcing lower steps into higher layers violates PRODUCT_SPEC_003 experience principles.

### Disclosure and enterprise scale

Enterprises have more objects. Progressive disclosure — not more primary tabs — is how scale is absorbed. A thousand Outcomes still yield a sparse Briefing; portfolio tools live in Outcomes utility.

### Always-visible vs always-hidden (executive attention test)

Ask of every proposed element:

1. Does this help answer the Briefing triad *right now*? → candidate for always-visible on Today  
2. Does this help only after a human chooses depth? → hide until deep link  
3. Does this help configure the OS? → Settings utility  
4. Does this help the company sell features? → reject  

If the answer is (4), it is not IA — it is marketing pressure on structure.

### Mobile IA

The same six primaries apply. Prefer a scannable tab pattern over hiding Decisions or Insights behind “More.” Utility remains behind Account. Today remains default. Cognitive load constraints are stricter on small surfaces — disclosure must be more aggressive, not less.

---

## 8. Search Philosophy

### How search fits DecisionOS

Search is a **finding aid**, not the intelligence product.

Executives sometimes need to retrieve a known Decision, Outcome name, or Report. Command palette / search serves jump and recall.

Search does not replace Decision Intelligence reasoning (PRODUCT_SPEC_002): ExecutiveOS does not rank the morning by search relevance, popularity, or recency alone.

### When search is appropriate

- “Find the Helix decision”  
- “Jump to Intent”  
- “Open billing”  
- Retrieve a known artefact by name  

### When reasoning should replace search

- “What matters today?”  
- “What should I do about enterprise ARR?”  
- “What’s urgent?”  

Those are Briefing / Engine jobs. Sending the executive to search for judgement is category collapse into retrieval software.

### Search anti-goals

- Search-as-home  
- AI chat-as-search-as-home  
- Search results that invent business state  

### Search placement in the shell

Search / command palette belongs in **chrome**, not as a primary destination. It accelerates movement across the existing map. It must never appear as a seventh peer labelled “Search” or “Find” that competes with Today.

Results should land the executive in the owning area (Decision detail, Outcome detail, Intent utility, Settings) — not in a perpetual results page that becomes a second home.

### Search and Progressive Trust

Search must respect Trust Zone boundaries. Unconnected systems do not invent results. Empty or honest “not connected” states beat hallucinated artefacts. Search is subject to the same gap honesty as Briefing.

### Search versus Assist

Conversational assist may help phrase a question. It still must not replace structure. If assist answers “what matters today?” by dumping a search index, it has failed PRODUCT_SPEC_002. Assist points into Briefing reasoning and owned destinations; it does not become the OS map.

---

## 9. AI within the Architecture

### Where AI belongs

- Inside Decision Intelligence reasoning as **advisor** behaviours: explain, summarise, recommend, draft, predict with limits  
- Inside Insights depth — still explain-before-recommend  
- Inside Reports drafting — human authority on publish  
- Optionally as assistive language on Decision/Action detail  

### Where AI does not belong

- As a primary navigation destination  
- As the Today empty state or product home  
- As operator of Intent, Decisions, or Outcomes  
- As a justification for seventh nav (“AI Hub”)  

### How AI supports navigation without becoming navigation

AI may **suggest a deep link** (“Open Decision X”) as part of a recommendation.  
AI may **not** become the map of the product.

Navigation remains human-legible structure: six primaries, utility, chrome. AI serves content within that structure.

Constitution: avoid as lead — “AI-powered,” assistant-first home. IA enforces that structurally.

### AI and destination classes

| Destination class | AI role |
|-------------------|---------|
| **Today** | Synthesis and sparse recommendation — never chat-home |
| **Decisions** | Evidence summary, alternative framing — human commits |
| **Insights** | Depth of explained intelligence — primary home for advisor craft |
| **Actions** | Draft commitments, blocker explanations — human owns |
| **Knowledge** | Retrieval and connection suggestions — not invention of memory as fact without provenance |
| **Reports** | Draft narrative from SoT — human publishes |
| **Utility (Intent/Outcomes)** | Clarify framing; never silently rewrite mandate or health |
| **Settings** | Explain permissions; never auto-grant Trust |

### AI as navigation support (allowed patterns)

- “This recommendation concerns Decision D-12 — open it”  
- “Outcome Health declined on Helix — review Outcome”  
- “Intent review is due — open Intent”  

These are **pointers into structure**, not replacements for structure.

### AI as navigation replacement (forbidden patterns)

- “Ask anything” as the only way to find Decisions  
- Dynamic nav generated per user that hides Outcomes utility or invents primaries  
- Ranking primary destinations by “engagement” with AI features  

ExecutiveOS remains a Decision Operating System with a stable map. AI is weather inside the rooms — not a redraw of the floor plan.

---

## 10. Scalability

One mental model scales. Depth and governance grow — not a new map per segment.

| Stage | What stays | What deepens |
|-------|------------|--------------|
| **Solo** | Six primaries; Today boot; Intent/Outcomes/Decisions loop | Lighter Insights/Reports; fewer connectors |
| **Growing** | Same map | Shared Outcomes/Decisions; Actions matter more; Teams/CRM observe |
| **Enterprise** | Same map | Trust Zone in Settings; Reports/Board Mode; delegated coverage; more objects behind progressive disclosure |

### What must not change with scale

- Today as default  
- Six primary labels  
- Outcomes as SoT axis (utility + chrome)  
- Intent as context (strip + utility)  
- Executive Decides  
- Sparse Briefing survivors  

### What may change with scale

- Volume behind disclosure  
- Connector set and admin surfaces  
- Team seats and entitlements (role = context, not ranking)  
- Formal Reports cadence  

Product Strategy editions (Solo / Business / Enterprise) share this IA. Editions change capability depth, not the DecisionOS map.

### Scaling failure modes

| Failure | Result |
|---------|--------|
| Enterprise edition adds primary tabs | Two products; broken habit transfer |
| Solo edition removes Decisions | Loop breaks; Briefing cannot commit |
| “AI edition” adds AI Hub primary | Category collapse |
| Vertical packs (SalesOS nav) | Fragmented DecisionOS |

Scaling correctly feels boring: same doors, richer rooms, stricter disclosure, stronger Trust Zone. That boredom is a feature.

---

## 11. Information Architecture Principles

1. **Six primaries. No seventh for fashion.**  
2. **Today boots judgement; everything else deepens or enables.**  
3. **Logo always returns to Today.**  
4. **Outcomes own business state; they do not need a primary tab to matter.**  
5. **Intent frames; it lives in Briefing + utility, not primary nav.**  
6. **Settings enable Trust; they never ransom the morning.**  
7. **One source of truth; surfaces derive.**  
8. **Deep links over menu sprawl.**  
9. **Progressive disclosure over equal discovery.**  
10. **Search finds; reasoning judges.**  
11. **AI advises inside structure; AI is not structure.**  
12. **Same mental model from Solo to Enterprise.**  
13. **Vocabulary: Today/Briefing, Insights not AI, Knowledge not Graph in nav.**  
14. **Chrome informs without becoming destinations.**  
15. **If a new area does not strengthen judgement, it does not get a door on the front of the OS.**  

---

## 12. Specification Gate

Before UX design of navigation, shell, or information placement begins, confirm:

| # | Criterion | Pass? |
|---|-----------|-------|
| 1 | Primary nav is exactly: Today · Decisions · Insights · Actions · Knowledge · Reports | |
| 2 | Outcomes and Intent are utility/chrome — not primary | |
| 3 | Settings/Account are utility — not primary | |
| 4 | Today derives; does not own Outcome/Decision SoT | |
| 5 | Ownership map in §4 has no dual writes for business state | |
| 6 | Briefing exclusions (SPEC_001) remain unviolated by IA pressure | |
| 7 | Experience principles (SPEC_003) — boot not browse — preserved | |
| 8 | Engine philosophy (SPEC_002) — reasoning not search-home — preserved | |
| 9 | Progressive disclosure ladder defined for proposed screens | |
| 10 | No AI Hub / Dashboard / Inbox primary proposed | |
| 11 | Solo→Enterprise scalability does not fork mental model | |
| 12 | Constitution Article III remains intact (or formal amendment path exists) | |

Any proposal for a seventh primary requires founder Decide, Constitution amendment, and explicit rewrite of this specification — not a quiet UX exception.

### Gate failure examples

| Proposal | Gate result |
|----------|-------------|
| Add “Calendar” as primary | Fail — feeds Today; remains utility |
| Add “AI Hub” as primary | Fail — AI is not a destination class |
| Make Outcomes primary “for discoverability” | Fail — Constitution + competing home risk |
| Split Insights into Advisors + Digests as two primaries | Fail — disclosure inside Insights |
| Settings in primary for enterprise admins | Fail — utility; edition depth only |

Passing the gate does not authorise wireframes that contradict PRODUCT_SPEC_003 experience principles. UX begins only after structure is ratified.

---

## Relationship to Prior IA Documents

| Document | Relationship |
|----------|----------------|
| `docs/design/INFORMATION_ARCHITECTURE.md` | Canonical design IA; this SPEC is product-doctrine confirmation and expansion (ownership, AI, search, scale) |
| ADR-004 | Briefing-first IA decision — upheld |
| ADR-001 / 002 / 006 | Ownership of Outcomes, Decisions, Intent — upheld |
| PRODUCT_SPEC_001–003 | Content and experience constraints on Today — upheld |

Where design IA and this SPEC describe the same rules, they agree. Where this SPEC adds ownership and doctrine detail, UX and engineering treat it as governing product structure.

---

## Appendix — Destination Classes

| Class | Members |
|-------|---------|
| **Primary** | Today, Decisions, Insights, Actions, Knowledge, Reports |
| **Utility** | Intent, Outcomes, Settings/Account cluster, org, billing, integrations, team, admin |
| **Chrome** | Logo→Today, Outcome Health, Account entry, command palette, Attention Budget (future) |
| **Derived synthesis** | Briefing sections, recommendations, alignment badges |
| **Not destinations** | Signals feed, AI Hub, Dashboard alias (redirects to Today), Graph alias (Knowledge) |

---

*PRODUCT_SPEC_004 — Information Architecture. Structure in service of judgement. Fewer doors; clearer rooms; one operating system.*
