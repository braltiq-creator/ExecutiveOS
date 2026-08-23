# Executive Experience Blueprint

**Status:** Workshop 15 preparation — design only  
**Audience:** Founders · Product · Design · Engineering · Enterprise GTM · Security  
**Nature:** End-to-end product experience — not a UX specification, wireframe set, or UI kit  
**Aligned with:** [Constitution v1](../architecture/EXECUTIVEOS_CONSTITUTION_v1.md) · [Core Executive Loop](../architecture/CORE_EXECUTIVE_LOOP.md) · ADRs 001–006 · Frontend Decision Record · Information Architecture  

---

## Who this is for

The primary user is an executive who is:

| Trait | Implication for the experience |
|-------|--------------------------------|
| **Time poor** | Value in minutes, not weeks of configuration |
| **Highly intelligent** | Respect judgment; never lecture or oversimplify stakes |
| **On Microsoft 365, Teams, Salesforce** | Work already lives there; ExecutiveOS interprets, does not replace |
| **Wants immediate value** | First Briefing must feel consequential |
| **Won’t tolerate unnecessary setup** | Infer first; confirm lightly; never interrogate |
| **Expects enterprise-grade security** | Trust is a prerequisite for attention, not a footer claim |

---

## 1. Product philosophy

ExecutiveOS is **the operating system for executive decision making**.

It does not compete to be the place with the most data. It exists so a leader can answer, under time pressure:

1. What requires my attention?  
2. Why?  
3. What should I do?

Philosophy in practice:

- **Operating system, not dashboard** — infrastructure for judgment (Constitution Art. I).  
- **Intent frames; Outcomes measure** — strategic focus explains *why*; outcomes remain how we know (ADR-001, ADR-006).  
- **Decisions always serve outcomes** — no orphan judgment (ADR-002).  
- **Briefing is the daily boot sequence** — Today is home (ADR-004).  
- **Restraint earns confidence** — calm surfaces; urgency in content (design principles).  
- **AI is subordinate** — explains and drafts; never replaces judgment (Core Executive Loop §9).

The Core Executive Loop is the experiential spine:

```
Intent → Observe → Understand → Decide → Execute → Learn → Refine Intent
```

Every moment in this blueprint should strengthen a stage of that loop — or the executive’s trust that the loop is working.

---

## 2. The “magic moment”

The magic moment is **not** “AI said something clever.”

It is the first time the executive opens ExecutiveOS and thinks:

> *This already knows what I’m trying to achieve — and it’s asking me for judgment, not data entry.*

Concretely, that moment has four simultaneous qualities:

| Quality | Experience |
|---------|------------|
| **Recognised** | Intent and outcomes reflect their actual mandate (inferred, then lightly confirmed) |
| **Ranked** | Attention is ordered by strategic consequence, not inbox volume |
| **Explained** | Every priority answers *why* before *what to do* |
| **Actionable** | A clear next call exists — decide, protect focus, or unblock — without opening five other systems |

```
Magic moment (first successful Briefing)
───────────────────────────────────────
  Sees own strategic Intent
           +
  Sees 1–3 judgment calls that matter today
           +
  Understands stakes on real outcomes
           +
  Knows the next move in under two minutes
───────────────────────────────────────
  → Trust opens · Habit becomes possible
```

If the first session feels like onboarding theatre or a empty dashboard, the product has failed — regardless of feature completeness.

---

## 3. First-time experience

### Principles

- **Concierge, not questionnaire** — short path; human or guided assist acceptable for enterprise rollout.  
- **Connect before configure** — Microsoft 365 / Teams (and Salesforce when available) before elaborate forms.  
- **Show the Briefing early** — even with partial data, with honest confidence.  
- **Never block on perfection** — a useful Briefing with gaps beats a perfect empty state.

### Journey

```
Invite / SSO
    ↓
Identity recognised (org + role context only)
    ↓
Connect Microsoft 365 (+ Teams)   ← optional Salesforce soon after
    ↓
Intent drafted from available signals
    ↓
Confirm / lightly edit Intent + focus outcomes
    ↓
Land on Today — first Executive Briefing
```

### What “done with setup” means

The executive has:

1. Authenticated into their organisation.  
2. Granted the minimum scopes needed to observe calendar and collaboration context.  
3. Confirmed (or accepted) a draft Strategic Intent and focus outcomes.  
4. Seen a Briefing that contains at least one real judgment-worthy item **or** an honest explanation of what is still missing.

They have **not** been asked to rebuild their CRM, map every initiative, or complete a 40-field profile.

---

## 4. First 5 minutes

| Minute | Experience | Loop stage |
|--------|------------|------------|
| **0–1** | Sign-in / SSO. Immediate sense of institutional calm — not a consumer splash. | — |
| **1–2** | “Connect Microsoft 365” as the primary action. One sentence on why (calendar + meetings → better judgment context). Salesforce deferred or one-click later. | Observe (enable) |
| **2–3** | Draft Intent appears: title, short narrative, proposed focus outcomes. Labels: *Inferred — confirm or edit.* | Intent |
| **3–4** | Confirm Intent. Optional: mark one outcome Watching or Non-Focus. No OKR builder. | Intent |
| **4–5** | **Today.** Intent strip + ranked priorities. Magic moment attempted. | Observe → Understand |

**Success in five minutes:** the executive has made one confirmation (Intent) and understood one priority that matters today.

**Failure in five minutes:** stuck in connectors, permissions, or empty states that demand more work before any judgment support.

---

## 5. First Executive Briefing

The first Briefing is the product’s handshake. It must feel like a chief of staff who has done the reading — not like a demo of modules.

### Composition (experiential, not layout)

```
┌─────────────────────────────────────────────┐
│ Strategic Intent (why we’re focusing here)  │
├─────────────────────────────────────────────┤
│ Executive summary — one headline judgment   │
├─────────────────────────────────────────────┤
│ Outcome Health — portfolio signal           │
├─────────────────────────────────────────────┤
│ Overnight / material changes                │
├─────────────────────────────────────────────┤
│ Priority Decisions — questions that matter  │
├─────────────────────────────────────────────┤
│ Insights — explained, then recommended      │
├─────────────────────────────────────────────┤
│ Recommended Actions — commitments           │
├─────────────────────────────────────────────┤
│ Calendar context — conversations that bind  │
└─────────────────────────────────────────────┘
```

### Rules for the first Briefing

1. **Intent before noise** — mandate visible at the top.  
2. **Few items, high consequence** — Signal Over Noise.  
3. **Explain Before Recommend** on every signal.  
4. **Honest gaps** — “Salesforce not connected — pipeline signals limited” is better than silence or fabrication.  
5. **One path deeper** — each item opens Decision, Outcome, or Intent — not a maze.  
6. **Board Mode available** — for the executive who must present in ten minutes.

### Emotional close of first Briefing

The executive should leave with either:

- A decision they will take today, or  
- A clear reason nothing needs their judgment yet — and confidence that the system will surface it when it does.

---

## 6. First week

The first week converts magic into habit.

```
Day 1   Magic moment · confirm Intent · 1–2 decisions touched
Day 2   Briefing trusted enough to open before email
Day 3   Outcome alignment felt (Focused vs Watching)
Day 4   A decision moves; execution commitment visible
Day 5   Weekly pattern emerging · optional Intent review note
```

### Week-one jobs-to-be-done

| Job | Experience marker |
|-----|-------------------|
| Orient | Intent still feels true |
| Triage | Briefing replaces “scan everything” |
| Decide | At least one Decision advanced |
| Protect focus | Calendar context used to defend judgment time |
| Trust data | No unexplained contradiction with M365/Salesforce reality |

### What we deliberately defer in week one

- Full Knowledge graph exploration  
- Heavy reporting / board pack generation  
- Exhaustive initiative administration  
- AI chat as a daily home  

---

## 7. Daily operating rhythm

ExecutiveOS is designed around a **morning judgment boot** and light touchpoints thereafter.

```
Evening prior     Systems sync (unattended)
     ↓
Morning           Open Today · Intent strip · Briefing triage (5–15 min)
     ↓
Day               Deep-dive only on Priority Decisions / blocked execution
     ↓
Pre-meeting       Calendar context → preparation, not a second calendar app
     ↓
End of day        Optional: mark decision status · note for tomorrow
     ↓
Overnight         Observe → next Briefing
```

### Daily non-goals

- Not a place to live all day  
- Not a Teams replacement  
- Not a Salesforce workspace  
- Not an inbox  

The daily win: **fewer context switches to reach a confident call.**

---

## 8. Weekly operating rhythm

```
Monday     Intent check (cadence) · set judgment posture for the week
Midweek    Decision queue hygiene · unblock execution on focus outcomes
Friday     Learn: what moved Outcome Health · what to carry forward
Pre-board  Board Mode on Briefing / Intent / critical Decisions
```

Weekly Intent review (per Intent `reviewCadence`) is a **mandate check**, not a goal-scoring ritual:

- Still the right focus?  
- What should move to Watching or Non-Focus?  
- Which constraints still bind?

---

## 9. Monthly operating rhythm

```
Month start    Refine or reaffirm Intent for the horizon
Through month  Outcomes and Decisions accumulate institutional memory
Month end      Reporting narrative for board / ELT
               Learn → Refine Intent if reality shifted
```

Monthly experience emphasises:

- **Narrative over charts** — Questions Before Charts  
- **Outcome Health trajectory** — explained, not gamified  
- **Decision archive** — what we chose and why  
- **Alignment** — Intent still matches how the enterprise actually spent leadership attention  

---

## 10. Executive attention model

Attention is the scarce resource. ExecutiveOS budgets it.

### Attention hierarchy

```
P0  Judgment required today (linked to Focus outcomes)
P1  Blockers that stop Focus execution
P2  Material overnight changes on Focus / Watching outcomes
P3  Calendar commitments that bind the above
P4  Watching / Supporting context (available, not loud)
—   Non-Focus · noise · vanity metrics → suppressed or utility-only
```

### Personalisation axis

Priority follows **strategic outcomes**, framed by **Intent** (Constitution Art. II.10, ADR-006).  
Role may change language and entitlements — **not** the ranking of what matters.

### Attention Budget (product principle)

When Attention Budget chrome ships, it should answer: *How many open judgment items am I carrying vs a sane load?*  
It must never become a gamified streak or productivity score.

### Progressive disclosure

```
Glance   Intent strip + headline + 1–3 priorities
Scan     Briefing sections
Read     Decision / Outcome detail
Deep     Knowledge, history, evidence, board narrative
```

---

## 11. How ExecutiveOS earns trust

Trust is cumulative and fragile.

| Trust builder | Mechanism |
|---------------|-----------|
| **Correct stakes** | Outcomes and Intent match how the executive actually leads |
| **Explainability** | Why before recommend; sources and confidence visible |
| **Restraint** | Does not cry wolf; Silent days are honest |
| **Consistency** | Same outcome health everywhere (single source of truth) |
| **Reversibility** | Easy to correct Intent, decision status, wrong inference |
| **Security posture** | Enterprise controls visible and real (see §16–17) |
| **No theatre** | No fake certainty, no anthropomorphised “AI coworker” brand lead |

Trust destroyers to avoid: fabricated pipeline facts, hidden ranking logic, chatty interruptions, setup that feels like unpaid consulting, and any second copy of “the truth” that drifts from Outcomes.

---

## 12. How ExecutiveOS reduces effort

| Friction today | ExecutiveOS reduction |
|----------------|------------------------|
| Reconstruct context from email + Teams + Salesforce | Briefing synthesises overnight |
| Remember what we’re trying to achieve | Intent strip every morning |
| Decide what matters | Outcome-ranked priorities |
| Re-explain stakes in every meeting | Decision and Outcome detail as shared memory |
| Chase whether work followed the decision | Execution commitments linked to outcomes (when shipped) |
| Build board narrative from scratch | Reporting pulls from the same loop |
| Re-learn the tool after travel | Same six destinations; Today is always home |

**Effort we refuse to add:** duplicate data entry, OKR gardening, widget configuration as a prerequisite to value.

---

## 13. What information is inferred

Inferred means: proposed by the system from connected signals and organisation context — always labelled as such until confirmed.

| Inferred | Examples |
|----------|----------|
| **Draft Intent** | Horizon focus from strategy docs, recent decisions, calendar load patterns |
| **Focus vs Watching outcomes** | Which results absorb leadership time and risk |
| **Priority order** | Overnight changes, deadlines, Outcome Health, Intent weights |
| **Meeting relevance** | Which conversations bind Focus outcomes |
| **Decision candidates** | Questions emerging from slips, blockers, approvals |
| **Owners / stakeholders** | From calendar, Salesforce opportunities, org directory |
| **Confidence** | How complete the evidence base is |

Inference is never silent authority. The executive can override in one move.

---

## 14. What information is confirmed

Confirmed means: the executive (or delegated chief of staff) explicitly accepts or edits.

| Confirmed | Why it must be human |
|-----------|----------------------|
| **Strategic Intent** | Mandate is judgment, not statistics |
| **Focus / Watching / Non-Focus** | Attention policy |
| **Decision outcome** | Approve, defer, decide — leadership call |
| **Critical constraints** | Capital, board, risk bounds |
| **“This is wrong” corrections** | Training signal for trust |
| **Sharing / export for board** | Accountability boundary |

Confirmation UX stays light: accept draft, edit sentence, change badge — not a workflow engine.

---

## 15. What information is never requested

Do not ask the executive for:

| Never request | Reason |
|---------------|--------|
| Full CRM re-entry | Salesforce is the system of record |
| Exhaustive initiative WBS | Not a PM tool |
| Personality / coaching quizzes | Wrong category |
| Daily stand-up theatre | Wrong ritual |
| Permission to “be their AI” | Violates OS metaphor and trust |
| Chart colour preferences before value | Outcome Before Interface |
| Duplicate passwords / shadow IT stores | Enterprise security |
| Personal life data unrelated to judgment | Privacy and focus |

If a field is not required for Intent, Observe, Understand, Decide, Execute, Learn, or Refine Intent — it does not belong in the critical path.

---

## 16. Enterprise trust model

Enterprise buyers and executives trust systems that are **clear about tenancy, identity, and data use**.

```
┌──────────────────────────────────────────────┐
│ Organisation tenancy                         │
│  ├── Identity (SSO / Entra ID)               │
│  ├── Role & entitlement (context, not rank)  │
│  ├── Connected systems (M365, Teams, SFDC) │
│  └── Audit & admin visibility                │
└──────────────────────────────────────────────┘
           ↓
   Executive workspaces inherit org policy
           ↓
   Briefing / engines operate inside tenancy
```

### Trust promises (experience-level)

1. **My organisation’s data stays in my organisation’s boundary.**  
2. **I know which systems are connected and what they contribute.**  
3. **Admins can see access, connectors, and health — without reading my judgment diary as gossip.**  
4. **I can revoke a connector and understand what the Briefing loses.**  
5. **Vendors do not train public models on my decisions by default** (contractual + product default; communicate plainly).

Trust UI is calm and institutional — never playful about security.

---

## 17. Enterprise security considerations

Security is part of the executive experience: if it feels unsafe, attention will not land.

| Consideration | Experience implication |
|---------------|------------------------|
| **SSO / Entra ID** | Default path; password sprawl discouraged |
| **Least privilege scopes** | Ask only for calendar/mail/Teams/Salesforce scopes needed for Observe |
| **Encryption in transit and at rest** | Assumed; available for security review |
| **Tenant isolation** | No cross-customer leakage in product behaviour |
| **Audit logs** | Admin-visible access and connector events |
| **Data residency / contractual controls** | Enterprise packaging; no surprise regions |
| **Secrets handling** | No tokens in client narratives or Briefing copy |
| **Dormant access** | Clear session and device expectations |
| **Board / guest access** | Controlled Board Mode / export paths — not open links by default |
| **AI processing boundaries** | Where prompts go, what is retained, what is redacted |

Security should **not** manifest as a 30-minute questionnaire before first Briefing. It manifests as enterprise defaults, admin clarity, and zero theatrics.

---

## 18. AI’s role in the experience

AI is **not** the product and **not** the home screen.

```
ExecutiveOS (OS for judgment)
    └── AI capabilities (subordinate)
            Explain · Summarise · Recommend · Draft · Predict
```

| Allowed in experience | Forbidden in experience |
|-----------------------|-------------------------|
| “Why this is ranked here” | Chat-first product home |
| Draft decision language | Anthropomorphised coworker brand lead |
| Summarise overnight change | Fake certainty without confidence |
| Suggest next step after explanation | Silent auto-decisions |
| Board narrative draft | Sparkles / “AI magic” marketing in-product |

The executive remains accountable for Intent, Decision, and risk acceptance. AI accelerates understanding; it does not perform leadership.

---

## 19. Failure scenarios

Design for failure without shame or silence.

| Scenario | Executive experience |
|----------|----------------------|
| **Connector down** | Briefing states what’s missing; ranks on remaining truth; CTA to reconnect |
| **Thin data (day one)** | Partial Briefing + clear “confirm Intent” and “connect Salesforce” |
| **Wrong inference** | One-click correct; Intent/outcome badges easy to change; no lecture |
| **Everything on fire** | Still ranked; Board Mode; no red kaleidoscope |
| **Nothing urgent** | Calm empty-enough state: “No judgment required — watching X” |
| **Conflicting sources** | Surface conflict as the decision; do not average into false peace |
| **Executive away** | Delegate pattern (future): Briefing remains coherent for covering leader within policy |
| **Over-permissioned fear** | Scope explanation in human language at connect time |
| **AI unavailable** | Core loop still works on structured portfolio + rules; degraded gracefully |

Failure copy stays institutional and brief. Never blame the executive.

---

## 20. Success criteria

### Experiential success (executive)

| Horizon | Criterion |
|---------|-----------|
| **5 minutes** | Confirmed Intent; understood one real priority |
| **First Briefing** | Magic moment: recognised + ranked + explained + actionable |
| **First week** | Opens Today before or instead of “scan all systems”; at least one Decision advanced |
| **First month** | Weekly Intent cadence felt natural; Outcome Health trusted enough to cite in leadership forums |
| **Habit** | Daily boot is Briefing; deep tools used on demand |

### Product success (aligned to governance)

| Criterion | Reference |
|-----------|-----------|
| Strengthens Core Executive Loop | CORE_EXECUTIVE_LOOP.md |
| Outcomes remain SoT; Intent remains context | ADR-001, ADR-006 |
| Decisions linked to outcomes | ADR-002 |
| Briefing is default landing | ADR-004 |
| No seventh primary nav item | Constitution Art. III |
| AI subordinate to OS metaphor | Constitution Art. I · Loop §9 |
| Enterprise trust not optional | §§16–17 of this blueprint |

### Anti-success (hard fails)

- Feels like another dashboard  
- Feels like OKR software  
- Feels like a chatbot with plugins  
- Requires a project to “implement” before any judgment help  
- Contradicts Salesforce/M365 without explanation  
- Trains the executive to ignore alerts  

---

## Closing

ExecutiveOS succeeds when a time-poor leader trusts it with the first minutes of their day — because it protects attention, respects judgment, and turns the noise of Microsoft 365, Teams, and Salesforce into a clear call to decide.

That is the experience Workshop 15 should protect: not more screens, but a sharper loop from **intent → understanding → judgement → execution**.

---

*Design only. Implementation follows separate phase approval. This blueprint does not authorise UI mock-ups, wireframes, or code.*
