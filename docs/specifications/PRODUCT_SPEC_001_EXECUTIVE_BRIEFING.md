# PRODUCT_SPEC_001 — Executive Briefing

**Status:** Formal product specification (pre-UX / pre-engineering)  
**Version:** 1.0  
**Product surface:** Executive Briefing (Today — default landing)  
**Authority:** Bound by Constitution · Narrative v1.1 · Product Strategy · Product Principles · Core Executive Loop · Executive Experience Blueprint · Product Development Lifecycle · ADRs 001–006  

**Nature:** Defines the product itself — not UI, not technical design, not an implementation plan.

Every other ExecutiveOS capability exists to support this surface. If a capability does not improve the Briefing’s ability to prepare judgement, it must justify itself elsewhere — or not ship.

---

## 1. Purpose

### Why the Executive Briefing exists

The Executive Briefing is the daily boot sequence of the Decision Operating System. It is the primary product experience — the place a time-poor leader opens to form judgement under pressure.

It exists because executives already have information systems; they lack a trusted, ranked preparation of what requires leadership attention *now*, grounded in strategic Intent and Outcomes.

### What problem it solves

Without the Briefing, leaders reconstruct reality across calendars, CRM, mail, meetings, and memory before they can decide. That reconstruction consumes the first decisive hour, produces equal false urgencies, and leaves authority without a clear question.

The Briefing solves **context collapse at the moment of judgement**: fragmented signals, missing mandate, unexplained recommendations, and decision fatigue from noise.

### What outcome it creates

**Confidence Through Clarity.**

After a successful Briefing, the executive knows what matters, why it matters to outcomes they own, and what judgement (if any) is required — without having opened a scattered set of systems to rebuild the picture.

The Briefing prepares judgement. It does not seize the decision. Authority remains human.

---

## 2. Product Principles Applied

How each Product Principle is expressed in the Briefing:

| Principle | Expression in the Briefing |
|-----------|----------------------------|
| **1. Reduce Cognitive Load** | Few ranked items; one primary question per signal; no equal-weight widget wall |
| **2. Recognition Before Recommendation** | Intent and situation appear before “what to do”; stakes before prescriptions |
| **3. Capture Once / Infer Continuously / Confirm Sparingly** | Overnight change inferred from connected systems; executive confirms Intent and corrections, not raw data re-entry |
| **4. Calm Over Noise** | Sparse surface; silence when nothing requires judgement; urgency rare and explained |
| **5. The Executive Decides** | Recommendations are proposals; commit paths live on Decisions / Actions, not silent auto-resolve |
| **6. Value Before Commitment** | First Briefing must deliver recognition and ranked judgement before demanding more connectors or seats |
| **7. Progressive Trust** | Honest gaps when signals are missing; least-privilege connectors; no fabricated completeness |
| **8. Outcomes Over Activity** | Ranked by strategic Outcomes (framed by Intent), not by clickbait, recency alone, or engagement hooks |
| **9. One Source of Truth** | Briefing derives from Intent, Outcomes, Decisions, Execution — never owns a competing portfolio |
| **10. Every Screen Answers One Question** | Primary question: *What is the single most valuable thing I should know or judge right now?* |
| **11. AI Is an Advisor** | Explain / summarise / recommend inside structure; never chat-home; never operator |
| **12. Simplicity Wins** | Usable under time pressure without training; Board Mode for presentation restraint |
| **13. Trust in Small Moments** | Accurate observations, easy correction, no bluffing |
| **14. Best Interface Often No Interface** | Prefer removing assembly work over adding controls to manage assembly |
| **15. Feel More Capable** | Leave knowing what matters, what can wait, and facing the next call with greater confidence |

---

## 3. User Job To Be Done

**Primary job**

> When I start my day (or reset under pressure), help me know what requires my judgement, why it matters to what we are trying to achieve, and what I should do next — so I can decide with confidence without reconstructing the business from five systems.

**Supporting jobs**

- Protect my attention from noise that is not strategically consequential  
- Recognise my Intent so recommendations feel grounded, not generic  
- Prepare me for the few conversations that bind today’s judgement  
- Show me when nothing urgent requires me — honestly  
- Give me a calm surface I can trust tomorrow morning again  

**Job the Briefing refuses**

- Entertain, gamify, or occupy screen time  
- Replace the executive’s decision  
- Become the inbox, CRM, or project board  

---

## 4. Emotional Journey

### Before opening

| State | Product obligation |
|-------|-------------------|
| Time-poor | Value must appear quickly; no setup theatre as the price of entry |
| Sceptical | Earn trust through recognition and honesty, not claims |
| Overloaded | Promise calm ranking, not more volume |
| Hopeful | Do not waste the willingness to try with empty dashboards |

They need emotional safety before functionality: *this will not waste my attention or pretend certainty it does not have.*

### During reading

| State | Product obligation |
|-------|-------------------|
| Orienting | Intent visible — “why we’re focusing here” |
| Recognising | Stakes and outcomes feel like *their* business |
| Focusing | One headline judgement path; supporting signals capped |
| Evaluating | Why before recommend; confidence and gaps visible |
| Ready | Clear next judgement — decide, protect focus, unblock, or consciously wait |

The emotional centre is the magic moment from the Experience Blueprint: *This already knows what I’m trying to achieve — and it’s asking me for judgement, not data entry.*

### After closing

| State | Product obligation |
|-------|-------------------|
| Clearer | Know what matters and what can wait |
| Confident | Face the next call without residual fog |
| Unburdened | Not guilty about what was ignored — it was ranked out for reason |
| Willing to return | Tomorrow’s open feels inevitable, not optional busywork |

Failure after closing: residual anxiety, suspicion that something important was buried, or a sense they still need to open five systems to be sure.

---

## 5. Information Hierarchy

Exactly what belongs — ranked by importance. Personalisation follows **strategic Outcomes**, framed by **Intent**. Role does not reorder priority (Constitution / ADR-004 / ADR-006).

| Rank | Content | Why |
|------|---------|-----|
| **1** | **Strategic Intent** | Without mandate, signals cannot be ranked. Recognition before recommendation. Context for everything below. |
| **2** | **Executive summary (lead judgement)** | Single headline: what requires attention, why, and the recommended next step — the Briefing’s primary answer to its one question. |
| **3** | **Outcome Health (portfolio signal)** | Grounds stakes in Outcomes — the business-state axis. Persistent truth, not vanity score. |
| **4** | **Overnight / material changes** | Observe → Understand: what changed that affects Focus (and critical Watching) outcomes. |
| **5** | **Priority Decisions** | The judgement questions that matter today — decision questions first, not charts. |
| **6** | **Insights** | Explained intelligence that deepens understanding; recommend only after why. Cap count. |
| **7** | **Recommended Actions** | Commitments that close the loop from judgement toward outcomes — still sparse. |
| **8** | **Calendar context** | Conversations that bind the above — context, never the hero of the Briefing. |

**Quantity discipline**

- Supporting signals: few (order of ≤3–5 in a normal day), high consequence  
- Prefer one strong lead over many weak equals  
- Progressive disclosure: depth lives on Decision / Outcome / Intent surfaces, not as a second dashboard inside Today  

**Depth rule**

Each item offers one clear path deeper (Decision, Outcome, Intent, or Action when available) — not a maze of modules.

---

## 6. Information That Must Never Appear

What must never distract executives in the Briefing — and why:

| Never | Why |
|-------|-----|
| **Chat-first empty state** | Violates OS metaphor; AI is advisor, not home |
| **Equal-weight widget dashboard** | Signal Over Noise fails; cognitive load rises |
| **Charts above the decision question** | Questions Before Charts |
| **Role-based homes that hide outcome risk** | Outcome-based personalisation only |
| **Vanity engagement** (streaks, scores, “keep exploring”) | Outcomes Over Activity |
| **Unexplained AI commands** | Recognition Before Recommendation; executive decides |
| **Fabricated completeness** when connectors are missing | Trust Zone; Progressive Trust |
| **Full Knowledge graph / admin / billing / integration settings** | Progressive disclosure; utility elsewhere |
| **Inbox, CRM workspace, or project board as centre** | Wrong category; DecisionOS sits above those systems |
| **OKR gardening / % complete Intent theatre** | Intent is mandate, not goal-tracking |
| **Noise from Non-Focus outcomes presented as equal priority** | Intent framing; attention model |
| **Security questionnaires as the first product moment** | Value and calm before commitment theatre |

If content does not improve the answer to *what should I know or judge right now?*, it does not belong in the Briefing.

---

## 7. Decision Model

The Briefing prepares **judgement**. It does not make decisions.

### What “preparing judgement” means

1. **Frame the question** — especially for Priority Decisions  
2. **Attach stakes** — Outcomes, Intent alignment, business impact, cost of delay where known  
3. **Explain** — why this ranks here; what changed; what is uncertain  
4. **Recommend** — a next step the executive can accept, amend, or reject  
5. **Path to commit** — when ready, move into Decision / Action surfaces where authority is exercised  

### What the Briefing must not do

- Auto-approve, auto-defer, or silently close judgement  
- Present recommendations as faits accomplis  
- Hide the reasoning that would allow a capable executive to disagree  
- Substitute activity lists for decision questions  

### Relationship to the Core Executive Loop

```
Intent (visible) → Observe (overnight) → Understand (explained signals)
        → Decide (prepared here; committed elsewhere)
        → Execute (recommended actions point forward)
        → Learn / Refine (honest gaps and corrections feed tomorrow)
```

The Briefing is the daily synthesis point of the loop — not a bypass around Decide.

---

## 8. Trust Model

### How trust is earned

| Behaviour | Effect |
|-----------|--------|
| Accurate recognition of Intent and Outcomes | “This knows my business” |
| Ranked consequence over loudness | Attention feels protected |
| Explain before recommend | Advice feels challengeable |
| Honest gaps (“pipeline signals limited”) | Credibility over theatre |
| Easy correction when wrong | Partnership, not bluffing |
| Consistency with Outcome Health elsewhere | One source of truth |
| Restraint — silence on quiet days | No cry-wolf training |

Trust is requested nowhere. It is accumulated in small moments (Product Principles).

### How confidence is displayed

- Confidence is **stated**, not performed with visual panic  
- Prefer calm language and clear ownership over alarming chrome  
- Distinguish *system confidence in the assessment* from *executive confidence to decide*  
- High confidence still leaves the decision human  

### How uncertainty is communicated

- Label inferred vs confirmed  
- Name missing sources when they materialise affect ranking  
- Prefer “we do not know X” over invented completeness  
- When signals conflict, surface the conflict as the judgement — do not average into false peace  

**Confidence Through Clarity** means the executive can see both the picture and its limits.

---

## 9. AI Behaviour

AI inside the Briefing is an advisor within the Decision Operating System — never the operator, never the home.

### How AI should behave

- **Explain** why a signal ranks and what Outcomes it touches  
- **Summarise** overnight change without stripping stakes  
- **Recommend** only after explanation  
- **Draft** language when deepening into decisions/reports (secondary to Briefing core)  
- **Predict** trajectories only with stated confidence and challengeable assumptions  
- Remain subordinate to structured Intent / Outcomes / Decisions truth  

### When AI should remain silent

- When structured ranking already suffices  
- When confidence is too low to add value beyond honesty  
- When speaking would create noise or false urgency  
- When the day requires no judgement — calm empty-enough state, not filler prose  
- When AI services are unavailable — Briefing continues on structured portfolio truth  

### When AI should ask questions

- Rarely, and only when confidence is low and stakes are high  
- Prefer confirm/edit of drafted Intent or a single clarifying judgement prompt  
- Never interrogate for CRM/ERP re-entry or profile completion in the Briefing path  

### When AI should recommend

- After recognition and explanation  
- On sparse, high-consequence items  
- Always as a proposal the executive can reject  

### When AI should explain

- Always before or with a recommendation  
- Whenever ranking might look arbitrary  
- Whenever uncertainty or missing connectors affect the picture  

---

## 10. Executive Experience

Ideal experience — no interface description; only what it should feel like to live through.

The executive opens Today as they would open the day’s operating picture — not a marketplace of modules.

Within moments, they recognise their Strategic Intent. The business feels seen. A single lead line tells them what judgement matters most. Outcome Health anchors stakes without demanding a tour of every metric. Overnight change is already interpreted against Focus outcomes. A short set of Priority Decisions appears as questions with consequence. Insights and actions, if present, are few and explained. Calendar context orients the conversations that bind those judgements — then gets out of the way.

They may enter Board Mode when they must present with restraint. They may go deeper on one Decision or Outcome. They are never forced through a feature gallery to earn clarity.

They leave with Confidence Through Clarity: they know what matters, why, and what to do next — or they know, honestly, that nothing requires them yet. Tomorrow, they return because the Briefing earned the first minutes of the day.

The experience matches software designed around the principles of an exceptional Chief of Staff: prepare judgement; protect attention; do not replace leadership.

---

## 11. Success Metrics

Avoid vanity metrics (time-on-site, message volume to AI, widget clicks).

### Behavioural metrics

| Metric | Intent |
|--------|--------|
| Opens Today as first (or early) leadership surface | Habit formation |
| Time to first recognised priority | Cognitive load reduction |
| Depth into one Priority Decision / Outcome when needed | Judgement path used |
| Return next morning / weekly return | Trust and habit |
| Corrections to Intent or ranking without abandonment | Healthy challenge, not churn from distrust |

### Outcome metrics

| Metric | Intent |
|--------|--------|
| Decisions advanced with outcome linkage after Briefing exposure | Judgement → Decide |
| Reduction in “assembly work” before first important decision | Success definition from Narrative |
| Executive-reported clarity: know what matters / what can wait | Confidence Through Clarity |
| Quiet-day honesty accepted (no forced filler) | Calm Over Noise |

### Customer metrics

| Metric | Intent |
|--------|--------|
| Design-partner / customer statement: stakes match reality | Trust |
| Willingness to grant next Progressive Trust connector after value | Value before commitment |
| Briefing cited in leadership ritual (not only “tried once”) | Operating system adoption |

**Anti-metrics (do not optimise)**

- Longer sessions  
- More notifications opened  
- More AI turns  
- More sections expanded “for engagement”  

---

## 12. Non Goals

The Executive Briefing deliberately refuses to become:

| Non-goal | Why |
|----------|-----|
| **A dashboard** | Visibility without ranked judgement is noise |
| **A chatbot home** | AI is advisor; OS boots via Briefing |
| **An inbox** | Mail is an observation source, not the centre |
| **A CRM or pipeline workspace** | Systems of record stay systems of record |
| **A project / task manager** | Actions support outcomes; Briefing is not a sprint board |
| **A BI suite** | Charts never lead the experience |
| **A notification firehose** | Calm Over Noise; Attention protection |
| **An OKR / goal-tracking product** | Intent frames; Outcomes measure; no % theatre |
| **A replacement for human leadership or human Chief of Staff** | Prepares judgement; does not replace it |
| **A place to complete enterprise setup before value** | Value before commitment |

---

## Specification Gate

Before UX design or engineering begins on the Briefing, confirm:

- [ ] Aligns with Narrative v1.1 success definition and Confidence Through Clarity  
- [ ] Information hierarchy in §5 respected; §6 exclusions enforced  
- [ ] Product Principles checklist (foundations) passed  
- [ ] Decision model prepares judgement; does not seize decisions  
- [ ] AI behaviour matches §9  
- [ ] Success metrics are behavioural/outcome — not vanity  

Deviations require founder Decide (Product Development Lifecycle Stage 2) and explicit amendment of this specification.

---

*PRODUCT_SPEC_001 — Executive Briefing. Reference before UX and engineering. Implementation details belong in later specifications and ADRs, not here.*
