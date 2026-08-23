# PRODUCT_SPEC_002 — Decision Intelligence Engine

**Status:** Formal product specification (conceptual reasoning model)  
**Version:** 1.0  
**Role:** The conceptual “brain” of the Decision Operating System — how disconnected signals become a small number of trusted judgement recommendations  
**Authority:** Bound by Constitution · Narrative v1.1 · Product Strategy · Product Principles · Core Executive Loop · PRODUCT_SPEC_001 (Executive Briefing) · Executive Experience Blueprint · Product Development Lifecycle · ADRs 001–006  

**Nature:** Product philosophy of reasoning — not AI architecture, not machine learning design, not LLM implementation, not engineering.

Every future technical implementation must preserve the behaviours defined here. If an implementation violates this specification, the implementation is wrong — not the philosophy.

---

## 1. Purpose

### Why the Decision Intelligence Engine exists

The Executive Briefing is the primary product experience. The Decision Intelligence Engine is what makes that experience possible.

Without a reasoning layer, ExecutiveOS would be forced into one of two failures already common in enterprise software: dumping information onto leaders and calling it “visibility,” or generating fluent suggestions without grounding and calling it “AI.”

The Decision Intelligence Engine exists to transform thousands of disconnected signals into a **small number of trusted judgement recommendations** — explained, ranked, and challengeable — so the Briefing can answer:

1. What requires my attention?  
2. Why?  
3. What should I do?

### Why executives need judgement support, not information retrieval

Executives do not fail because they cannot find documents. They fail because finding is not deciding.

Information retrieval answers: *Where is the thing?*  
Judgement support answers: *Given what we are trying to achieve, what call matters now, and why?*

Leaders already have search, inboxes, dashboards, and chat. Those tools increase access to fragments. They do not, by themselves, produce **Confidence Through Clarity**. They do not hold Intent. They do not own Outcomes as the personalisation axis. They do not bind Decisions to consequences. They do not know when silence is wiser than speech.

The cost of retrieval-as-leadership-support is familiar: the first hour spent assembling; the midday sense that everything is equally on fire; the evening uncertainty that something important was missed; the board week spent reconstructing a narrative the organisation already paid systems to hold.

Judgement support is required because:

- Volume exceeds human ranking capacity under time pressure  
- Strategic relevance is not the same as recency, popularity, or departmental urgency  
- Context changes meaning — the same CRM slip is trivial or existential depending on Intent and Outcomes  
- Authority must remain human — support prepares judgement; it does not seize it  
- Trust collapses when systems bluff, cry wolf, or hide reasoning  

The Decision Intelligence Engine is the product’s commitment to reason — calmly, explainably, and in service of the Core Executive Loop — so leaders spend less time assembling reality and more time deciding well.

It is also the commitment that the Briefing will not become a passive mirror of enterprise systems. Mirrors reflect everything. Advisors prepared in the Chief of Staff tradition reflect what matters for judgement — and leave leadership intact.

---

## 2. Design Principles

These principles are not decoration. They govern how reasoning is allowed to behave.

### Confidence Through Clarity

Reasoning succeeds when the executive leaves with a clearer picture and greater confidence — not with more items to process. Clarity is ranked understanding. Confidence is the felt right to decide (or to wait) without residual fog. The engine must prefer a short, explained set of priorities over a comprehensive fog of possibles.

**Influence on reasoning:** Suppress more than you surface. Explain the survivors. Never equate verbosity with intelligence.

### Recognition Before Recommendation

The engine must demonstrate that it understands mandate, stakes, and situation before it advises. Recommendations without recognition feel generic. Recognition without any path forward wastes the moment. The sequence is fixed: understand and show understanding, then propose.

**Influence on reasoning:** No naked “do this.” Every recommendation travels with what changed, why it matters to Outcomes/Intent, and what is uncertain.

### The Executive Decides

The engine recommends. Humans decide. AI never assumes authority. Reasoning may prepare a decision question, evidence, and a proposed next step. It may not silently approve, defer, or close judgement.

**Influence on reasoning:** Outputs are proposals and frames — never faits accomplis. Language and behaviour must remain challengeable.

### Calm Over Noise

Attention is scarce. The engine protects it. False urgency, recommendation fatigue, and constant escalation destroy the right to be opened every morning.

**Influence on reasoning:** Silence is a valid output. Urgency must be rare, consequential, and explained. Equal weighting of unequal stakes is a reasoning failure.

### Progressive Trust

Reasoning must respect what the system is allowed to know. Missing connectors produce honest gaps, not invented completeness. Broader access is earned by useful, accurate behaviour — not demanded up front.

**Influence on reasoning:** Confidence falls when sources are thin. The engine says what it cannot see. It does not bluff to look smart.

### AI as Advisor

Intelligence explains, summarises, recommends, drafts, and predicts with stated limits. It does not operate the business. It does not become the product home. Structured truth (Intent, Outcomes, Decisions, Actions) constrains advice.

**Influence on reasoning:** Advisor behaviours are subordinate to the Decision Operating System’s domain model and single source of truth. Fluency never outranks grounding.

Together, these principles force a particular kind of brain: one that reasons toward sparse, explained judgement support — not toward maximal retrieval, maximal chatter, or maximal automation.

---

## 3. Decision Intelligence Philosophy

ExecutiveOS does **not** search.  
ExecutiveOS does **not** rank by popularity.  
ExecutiveOS does **not** rank by recency alone.  
ExecutiveOS **reasons**.

### What “reasons” means

Reasoning, in this product sense, means:

1. **Situating** a signal inside Intent, Outcomes, Decisions, Actions, and business rhythm  
2. **Interpreting** what the signal implies for strategic consequence — not merely that it occurred  
3. **Comparing** competing claims on executive attention using strategic importance, impact, risk, urgency, confidence, and dependencies  
4. **Explaining** why a small set survived suppression  
5. **Proposing** a next step only after recognition  
6. **Learning** from corrections, acceptance, neglect, and outcome movement — as product behaviour, not as opaque self-modification theatre  

Search retrieves fragments matching a query. Reasoning asks whether a fragment deserves a leader’s scarce judgement today.

Popularity ranking elevates what many people touched. Executive judgement often concerns what few people see clearly — a blocked decision, a quiet risk to a Focus outcome, a commitment drifting.

Recency ranking elevates whatever happened last. Overnight noise is abundant. Strategic consequence is not. Recency may inform observation; it must not rule prioritisation.

Reasoning is the discipline that turns the Core Executive Loop into daily practice: Observe and Understand before Decide; Explain before Recommend; Learn so Refine Intent remains honest.

The philosophy is austere on purpose. A Decision Operating System that “reasons” by dumping sorted lists has abandoned its category.

### Reasoning versus adjacent behaviours

It is useful to name what reasoning is *not*, because product teams under pressure will drift toward cheaper substitutes.

**Not collation.** Collation gathers artefacts into one place. Reasoning decides which artefacts deserve a claim on judgement and which must remain invisible.

**Not alerting.** Alerting announces that a threshold moved. Reasoning asks whether that movement changes what a leader must judge today, given Intent and Outcomes.

**Not summarisation alone.** Summarisation compresses text. Reasoning attaches compressed understanding to stakes, owners, deadlines, and decision questions — then suppresses most of it.

**Not personalisation by persona template.** Role may change language. It must not reorder strategic consequence. Outcome-based personalisation, framed by Intent, remains the axis.

When teams say “the engine ranked this,” the only acceptable meaning is: *after situating signals in context, evaluating consequence, and suppressing noise, this sparse set is what a serious briefing may show — and here is why.*

Anything else is information retrieval with better styling.

---

## 4. Signal Model

### What constitutes a signal

A **signal** is any observable change, state, or human input that *might* affect organisational judgement — whether or not it ultimately deserves executive attention.

Signals are candidates for reasoning. Most will be suppressed. Survival into the Briefing is a privilege earned by strategic consequence, not by volume of emission.

### Categories of signals (conceptual)

| Category | Examples (illustrative, not exhaustive) |
|----------|----------------------------------------|
| **Time & attention** | Calendar load, meeting creation/cancellation, conflicting forums, focus-block erosion |
| **Commercial** | CRM stage movement, pipeline coverage shifts, customer risk flags, revenue movement, churn indicators |
| **Delivery & operations** | Project delays, initiative blockers, operational incidents, quality escapes |
| **People & organisation** | Team changes, key-person risk, capacity constraints affecting Focus outcomes |
| **Financial** | Material variance against plan, cash or margin signals tied to Outcomes |
| **External / market** | Market events that bear on Intent or Outcomes (when known) |
| **Decision state** | Approaching deadlines, stalled approvals, deferred judgement aging, cost of delay rising |
| **Execution state** | Blocked actions, overdue commitments, waiting-on-decision |
| **Outcome state** | Health movement, trajectory shifts, new blockers, overnight portfolio change |
| **Human leadership inputs** | Founder/executive corrections, Intent amendments, explicit “this matters / this does not,” dismissals of recommendations |
| **Trust & system** | Connector loss, incomplete sources, conflicting source claims |

### Category discipline

- Categories organise observation; they do not entitle a category to equal Briefing space  
- Commercial noise on a Non-Focus outcome may be suppressed; a small commercial slip on a Focus outcome may dominate  
- Human corrections are first-class signals — Progressive Trust and learning depend on them  
- “System” signals (missing data) are signals about confidence, not excuses to invent content  

Signals are not APIs, payloads, or vendor objects. Those are implementation concerns. In product terms, a signal is simply: *something changed, or someone asserted something, that reasoning must situate.*

---

## 5. Signal Attributes

Every signal that enters reasoning should be understandable along conceptual attributes. These are lenses, not fields for a database schema.

### Source

Where the signal appears to come from: a connected system, an Outcome/Decision/Action state already in ExecutiveOS, an executive correction, or an inference across sources. Source quality affects confidence. Source identity must remain explainable (“from CRM movement,” “from calendar,” “from your Intent review”) so trust can form.

### Confidence

How strongly the engine believes the signal is true, complete, and correctly interpreted. Confidence is separate from urgency and separate from strategic importance. A confident triviality should stay quiet. An uncertain material risk may still surface — with uncertainty named.

### Strategic relevance

How closely the signal bears on current Intent and Focus Outcomes (and, secondarily, Watching). Non-Focus and ambient supporting context default toward suppression unless consequence forces elevation.

### Urgency

Time pressure for leadership attention — not departmental panic. Urgency asks: *Does delay meaningfully worsen Outcomes or close a judgement window?* Most signals are not urgent. False urgency is a primary failure mode.

### Business impact

What is at stake if ignored — narrative consequence tied to Outcomes, not abstract severity theatre. Impact without Outcome linkage is weakly reasoned.

### Time sensitivity

Whether the signal’s meaning decays, peaks before a meeting, or compounds with deadline. Time sensitivity informs prioritisation; it does not automatically equal urgency.

### Outcome affected

Which Outcome(s) the signal touches. Per ADR-001 and ADR-002, Outcomes are the business-state axis; Decisions and Actions link through them. A signal that cannot attach to Outcomes (or Intent) struggles to justify executive attention.

### Intent alignment

Whether the signal advances Focus, belongs in Watching, sits in Supporting, or conflicts with Non-Focus / constraints. Alignment shapes boost and demotion (ADR-006).

### Dependencies

Whether the signal blocks or is blocked by Decisions, Actions, meetings, or other signals. Dependencies can elevate a seemingly small item (“this blocks today’s residency decision”).

### Required judgement

Whether a human leadership call is needed — as opposed to operational handling elsewhere. The engine exists to prepare judgement, not to vacuum every operational exception into the Briefing.

### Attribute posture

Attributes are interpreted together. High urgency + low strategic relevance + low required judgement → suppress or route away from the executive. High impact + Focus Outcome + required judgement + adequate confidence → candidate for Briefing. High impact + low confidence → may surface as a question or gap, not as a fake certainty.

---

## 6. Context Model

Signals never exist alone. **Context changes meaning.**

The same pipeline slip is a footnote or a crisis depending on Intent, Outcome health, prior Decisions, and whether a board narrative is due this week. Reasoning without context is retrieval wearing a costume.

### Context includes

| Context element | Role in meaning |
|-----------------|-----------------|
| **Current Intent** | Mandate, Focus/Watching/Non-Focus, constraints, horizon — the lens for relevance |
| **Strategic Outcomes** | What we are trying to achieve; health, trajectory, blockers — the stakes |
| **Past Decisions** | What was already judged; what should not be re-litigated casually; what was deferred and is aging |
| **Current Actions** | Commitments in motion; blockers that convert decisions into execution risk |
| **Historical trends** | Whether today’s movement is noise or continuation of decline/recovery |
| **Known risks** | Risks already named on Outcomes/Intent — signal may confirm, worsen, or relieve |
| **Business rhythm** | Week/month/board cadence — timing of judgement windows |
| **Upcoming meetings** | Conversations that bind judgement; preparation vs. interruption |
| **Customer commitments** | External promises that raise cost of delay or reputation risk |

### How context changes meaning

- A meeting invite is calendar noise — or the only forum where a Focus Decision can clear  
- A CRM stage change is ops detail — or the overnight event that forces today’s commercial judgement  
- An ignored recommendation last week is feedback — the engine should not nag identically forever  
- A strong Outcome Health score does not hide a single critical Decision due today  
- Missing Salesforce context lowers confidence on commercial claims; it does not invent pipeline  

Context is why ExecutiveOS can remain calm: most signals, once situated, do not deserve a leader’s morning.

Context is also why Progressive Trust matters: richer permitted context improves understanding; thinner context demands more honesty and more silence.

---

## 7. Reasoning Model

The conceptual reasoning sequence aligns with the Core Executive Loop and the Briefing’s prepare-judgement model. It is a product sequence, not a pipeline diagram for engineers.

```
Observe
  ↓
Understand
  ↓
Recognise
  ↓
Evaluate
  ↓
Prioritise
  ↓
Recommend
  ↓
Learn
```

### Observe

Bring reality into view: overnight and continuous signals from connected systems and from ExecutiveOS’s own Outcome, Decision, and Action state. Observation includes noticing absences — connectors down, thin Intent, conflicting sources.

Observe does not yet mean “show the executive.” Most observation ends in suppression.

### Understand

Situate each candidate signal in context. Attach Outcomes, Intent alignment, dependencies, and time sensitivity. Separate what happened from what it might mean. Identify whether leadership judgement is required or whether the matter is operational.

Understand produces explanation material: what changed, why it might matter, what is uncertain.

### Recognise

Form the picture the executive would need to feel recognised: mandate, stakes, and situation — before advice. Recognition is the bridge to trust. If the engine cannot recognise, it must not leap to confident recommendation.

In product terms, recognition surfaces as Intent awareness, Outcome linkage, and stakes narrative in the Briefing — not as a claim of omniscience.

### Evaluate

Judge candidates against attributes: impact, urgency, relevance, confidence, risk, required judgement, dependencies. Discard or demote what fails the executive-attention test. Elevate what concentrates consequence on Focus Outcomes or binding Decisions.

Evaluate is where Calm Over Noise is enforced.

### Prioritise

Order the survivors into a sparse set suitable for human cognition under time pressure. Produce a lead judgement path and a short supporting set — never an equal list of twenty “priorities.”

Prioritise serves PRODUCT_SPEC_001’s information hierarchy and the daily triad.

### Recommend

Only after recognition and explanation, propose what should happen next. Recommendations are optional outputs of reasoning. Many prioritised items need framing and a decision question more than a prescription. Some days need silence.

### Learn

Absorb what happened after: corrections, accepts, ignores, outcome movement, Intent refinement. Adjust future suppression and elevation as product behaviour — so tomorrow’s Observe starts wiser.

Learn closes the loop toward Refine Intent without turning the product into an opaque self-driving authority.

### Sequence discipline

The sequence is ordered for trust:

1. Observe without performing  
2. Understand without prescribing  
3. Recognise before advising  
4. Evaluate without equalising every exception  
5. Prioritise until a human can hold the set  
6. Recommend only when a proposal helps  
7. Learn without hiding the rules of improvement from product governance  

Skipping Recognise to reach Recommend faster produces the generic-AI failure mode Narrative v1.1 rejects. Skipping Evaluate/Prioritise produces dashboard failure. Skipping Learn produces a static sorter that never earns Progressive Trust.

The Briefing (PRODUCT_SPEC_001) consumes the outputs of Prioritise and Recommend. It must never become a raw window onto Observe.

---

## 8. Priority Model

Competing signals compete for one scarce resource: executive attention. Prioritisation is conceptual comparison, not a published formula.

### Dimensions considered together

**Strategic importance**  
Does this bear on Intent and Focus Outcomes? Watching may inform; Non-Focus defaults down unless consequence forces a breach of the boundary (and even then, explanation must be exceptional).

**Urgency**  
Is there a real judgement window — deadline, meeting, compounding cost of delay — that makes waiting materially worse?

**Impact**  
What Outcome stakes move if ignored? Prefer narrative consequence tied to Outcomes over generic “high/medium/low” theatre without grounding.

**Confidence**  
How sure are we? Low confidence caps how forcefully something may present. It may still appear as uncertainty or a question.

**Risk**  
Downside asymmetry: small probability of large harm to a Focus Outcome can outrank frequent low-stakes noise.

**Dependencies**  
Does this block a Decision, Action, or conversation that already sits on today’s critical path?

**Human attention**  
Is this the executive’s job to judge, or someone else’s to operate? The engine must not promote the organisation’s entire exception stream into the Briefing.

### Prioritisation posture

- Sparse winners beat comprehensive queues  
- Recency may break ties only among already-qualified signals — it does not qualify them  
- Popularity is irrelevant  
- Quiet days are allowed: if nothing qualifies, prioritise silence over filler  
- Conflicting qualified signals: surface the conflict as the judgement; do not average into false peace  

Prioritisation exists to produce Confidence Through Clarity — a short ordered understanding of what matters — not to produce a productivity backlog.

### Worked conceptual contrasts (not scores)

These contrasts illustrate posture. They are not a matrix to implement as points.

- **Two CRM movements overnight.** One touches a Focus enterprise Outcome already at risk; the other touches a Non-Focus retention theme deliberately deprioritised in Intent. Reasoning elevates the first, suppresses the second — even if the second is “louder” in the CRM.  
- **A meeting added to the calendar.** If it is the only forum where a due Decision can clear, it becomes judgement context. If it is another status forum competing with protected focus blocks, it may surface as attention risk — or stay silent if the executive already has an Execution blocker covering the same ground.  
- **Outcome Health stable, one Decision due today.** Portfolio calm does not hide a binding judgement window. The lead story may be the Decision question, with health as supporting context.  
- **Many medium operational incidents.** Unless they aggregate into Focus Outcome consequence or block a named Decision/Action, they remain outside the Briefing. Operational systems can handle operational storms; the engine must not promote every storm.  

Prioritisation is an act of respect for human attention. Inflating the set to prove the engine is “working” is a product failure.

---

## 9. Confidence Model

### How ExecutiveOS develops confidence

Confidence grows from grounding: corroborated sources, stable Outcome linkage, consistent Intent, executive confirmations, and recommendations that survived contact with reality without correction.

Confidence is earned the same way trust is earned — in small accurate moments — not declared by tone of voice.

### How confidence increases

- Multiple independent signals agree on stakes  
- Outcomes and Intent are clear and recently confirmed  
- Executives accept framed judgements without correction  
- Connectors are healthy; gaps are few  
- Historical pattern matches today’s interpretation  
- Dependencies and owners are known  

### How confidence decreases

- Sources conflict or go missing  
- Intent is stale or Outcomes are weakly defined  
- Executive corrections repeatedly invalidate interpretations  
- Recommendations are ignored for good reason (or always ignored because they cry wolf)  
- Fabrication pressure rises — confidence must fall rather than invent  
- Time passes without confirmation on high-stakes inferences  

### How uncertainty is represented

Uncertainty is first-class product behaviour:

- Label inferred vs confirmed  
- Name missing sources that would change the picture  
- Prefer questions and gaps over false precision  
- Separate “we are confident this happened” from “we are confident it requires you today”  

### When the system should ask questions

Ask sparingly (Capture Once / Infer Continuously / Confirm Sparingly):

- When stakes are high and confidence is low  
- When only a human can resolve Intent, Focus boundaries, or a true decision fork  
- When a correction would unlock better ranking going forward  

Do not ask to complete profiles, re-enter CRM, or perform unpaid consulting. Do not ask constantly. Prefer drafted confirmations over blank interrogations.

---

## 10. Recommendation Model

### When recommendations appear

Recommendations appear when:

- Recognition is adequate (situation and stakes are clear)  
- Explanation can travel with the proposal  
- A next step would reduce ambiguity for a required judgement or unblock a Focus path  
- Confidence is sufficient to propose without bluffing — or uncertainty is explicitly attached  

They appear sparsely, on the Briefing’s ranked survivors and on deeper Decision/Action surfaces as proposals.

### When they do not

Recommendations do not appear when:

- The right output is a framed question still awaiting executive judgement  
- Confidence is too low to prescribe  
- The matter is operational and should not consume executive attention  
- The day qualifies for honest quiet  
- AI advisor capabilities are unavailable — structured ranking and explanation still proceed without forced prose prescriptions  

### When silence is preferable

Silence is preferable when speech would:

- Create false urgency  
- Add items without changing the lead judgement  
- Repeat a recently dismissed recommendation without new evidence  
- Fill space because a layout “expects content”  
- Hide uncertainty behind confident tone  

Silence is a feature of Calm Over Noise. A Decision Operating System that cannot be quiet cannot be trusted.

### When the system escalates

Escalation (stronger claim on attention) is reserved for:

- Material risk to Focus Outcomes with a closing judgement window  
- Blockers that stop Decisions/Actions already on the critical path  
- Conflicts between sources that change the lead story  
- Cost of delay becoming acute relative to Intent  

Escalation must still explain. Escalation without recognition is noise with better volume.

### How recommendations remain explainable

Every recommendation must be challengeable:

- What changed  
- Why it matters to Intent/Outcomes  
- What is uncertain  
- What next step is proposed — and that the executive may reject it  

Hidden reasoning is forbidden as product behaviour. If the engine cannot explain why something ranked, it should not recommend from that ranking.

### Recommendation shapes

Recommendations are not a single tone. Conceptually they appear in shapes matched to judgement needs:

- **Decide** — a clear decision question with stakes and a proposed posture (approve, defer, seek evidence)  
- **Unblock** — a commitment or dependency that must move before Focus Outcomes can recover  
- **Protect** — defend focus time, Intent constraints, or Non-Focus boundaries under pressure  
- **Watch** — elevate awareness without demanding immediate action; especially for Watching Outcomes  
- **Clarify** — ask or confirm when confidence is low and stakes are high  

Not every survivor of prioritisation needs a Decide shape. Forcing prescriptions onto every card creates recommendation fatigue.

### Explainability as a contract

Explainability is not a paragraph of filler beneath a command. It is a contract that the executive can:

1. See the claim on their attention  
2. See the Outcomes/Intent grounding  
3. See uncertainty  
4. Disagree without being gaslit by unreadable authority  

If engineering later uses models, rules, or retrieval, that contract does not change. The product obligation remains: advice is challengeable, sparse, and human-ending.

---

## 11. Learning Model

Learning is product behaviour: how ExecutiveOS improves what it suppresses, elevates, and proposes over time — described without machine learning mechanics.

### Inputs to learning

| Input | Meaning |
|-------|---------|
| **Executive corrections** | “Wrong Outcome,” “not Focus,” “not urgent,” amended Intent — first-class teaching |
| **Ignored recommendations** | Repeated ignores without new evidence → demote similar proposals; investigate cry-wolf |
| **Accepted recommendations** | Reinforces framing that helped; still does not grant operator authority |
| **Outcome changes** | Health/trajectory movement validates or challenges prior prioritisation |
| **Business evolution** | New products, markets, org shape — Intent and Outcomes shift; ranking must follow |
| **Intent refinement** | Focus/Watching/Non-Focus changes redefine relevance for future signals |
| **Decision outcomes** | What was decided and what followed — institutional memory for not re-asking settled questions casually |

### Learning posture

- Learn toward less noise and better recognition  
- Learn toward fewer asks and better drafted confirmations  
- Never learn toward hidden autonomy that bypasses the executive  
- Prefer explicit Intent/Outcome updates over silent personality drift  
- Graceful degradation remains: learning cannot invent sources Progressive Trust has not granted  

Learning closes Observe → … → Learn so the flywheel (Signals → Understanding → Better Decisions → Better Outcomes → Greater Trust → More Signals) turns without becoming a black box.

### What learning must not become

Learning must not become:

- Silent personality drift that changes ranking without Intent/Outcome grounding  
- A justification for more notifications (“engagement”)  
- Permission to invent sources the Trust Zone has not granted  
- A replacement for founder/product Decide when the philosophy itself should change  

When learning suggests a change to what “urgent” means, that is a product decision eligible for the Lifecycle — not an unsupervised rewrite of Calm Over Noise.

### Learning and the Briefing

The Briefing should feel slightly wiser over weeks: fewer false urgencies, better Intent recognition, less nagging on dismissed items, sharper lead stories. The executive should not need to “train” the system through gamified feedback. Corrections should feel like editing the truth, not teaching a pet.

---

## 12. Failure Modes

The engine must actively avoid:

| Failure | Why it destroys the product |
|---------|-----------------------------|
| **False urgency** | Trains leaders to ignore the Briefing |
| **Recommendation fatigue** | Too many proposals; none feel consequential |
| **Information overload** | Retrieval disguised as intelligence |
| **Hallucination / fabrication** | Invented stakes or sources; trust collapses |
| **Overconfidence** | Certain tone with thin grounding |
| **Contradictory advice** | Competing recommendations without acknowledging conflict |
| **Hidden reasoning** | Unchallengeable rankings; executive cannot disagree intelligently |
| **Trust erosion** | Small inaccuracies uncorrected; Progressive Trust stalls |
| **Authority seizure** | Auto-deciding; AI-as-operator behaviours |
| **Recency theatre** | Whatever happened last crowds out Focus consequence |
| **Category collapse** | Behaving like search, dashboard, notification, workflow, or chatbot engines |
| **Duplicate truth** | Reasoning from a shadow portfolio that drifts from Outcomes/Decisions |

Any implementation that exhibits these behaviours fails PRODUCT_SPEC_002 regardless of technical sophistication.

### Early warning signs

Product and design reviews should treat the following as alarms:

- Stakeholders asking for “just one more section” on the Briefing to show the engine is busy  
- Pressure to surface Non-Focus activity because a department prefers visibility  
- Recommendations that cannot be traced to Outcomes or Intent in plain language  
- Copy that speaks as if the system already decided  
- Metrics that reward count of recommendations generated  

These signs precede trust erosion. The discipline to say no (Narrative v1.1) applies to the engine as much as to the suite.

---

## 13. Success Measures

Avoid vanity measures (more recommendations, more AI turns, more signals ingested).

### Behavioural measures

| Measure | Intent |
|---------|--------|
| Briefing opens as judgement boot, not as optional report | Habit |
| Time to recognised priority falls | Cognitive load |
| Executives challenge and correct without abandoning | Healthy trust |
| Sparse set reviewed; deep dive on one consequential item | Signal Over Noise working |
| Quiet days accepted without complaint that “nothing is broken” | Calm Over Noise |

### Customer / trust indicators

| Measure | Intent |
|---------|--------|
| Stakes described as matching reality | Recognition |
| Willingness to grant next connector after value | Progressive Trust |
| Declining correction rate on similar signal types | Learning |
| Recommendations rejected with reason, not ignored as noise | Explainability |

### Decision quality & cognitive load

| Measure | Intent |
|---------|--------|
| Decisions advanced with Outcome linkage after engine-prepared framing | Judgement → Decide |
| Fewer systems opened before first important decision | Narrative success definition |
| Self-reported clarity: know what matters / what can wait | Confidence Through Clarity |
| Reduced sense of equal false urgencies | Priority model working |

Success for the engine is success for the Briefing: leaders feel more capable, not more informed in the abstract.

---

## 14. Non Goals

The Decision Intelligence Engine deliberately refuses to become:

| Not this | Why |
|----------|-----|
| **Search engine** | Retrieval without situated judgement is not DecisionOS |
| **Dashboard engine** | Visibility without ranked explanation is noise |
| **Notification engine** | Escalation without Calm Over Noise destroys attention |
| **Automation engine** | Moving work between systems is not preparing judgement |
| **Workflow engine** | Process routing is not executive decision support |
| **Generic chatbot** | Conversation is not the reasoning home; structured loop is |
| **Scoring / gamification engine** | Outcomes Over Activity; no leadership streaks |
| **Omniscient oracle** | Progressive Trust and honesty about gaps are mandatory |

The engine’s job is narrow and hard: reason from signals and context to sparse, explained judgement support that leaves authority human.

---

## Relationship to Other Specifications

| Document | Relationship |
|----------|----------------|
| **PRODUCT_SPEC_001 Executive Briefing** | Primary consumer of engine outputs; hierarchy and non-goals constrain what reasoning may surface |
| **Core Executive Loop** | Behavioural spine the reasoning sequence serves |
| **ADR-001 / 002 / 006** | Outcomes own business state; Decisions link to Outcomes; Intent frames without duplicating state |
| **Narrative v1.1** | Confidence Through Clarity; decision infrastructure; discipline to say no |
| **Product Principles** | Binding tests for every reasoning behaviour |

---

## Specification Gate

Before any engineering design for “intelligence,” confirm:

- [ ] Reasoning preserves Recognition Before Recommendation  
- [ ] Silence and uncertainty are valid outputs  
- [ ] Executive Decides is unviolated  
- [ ] Prioritisation is not recency/popularity theatre  
- [ ] Failure modes in §12 are explicitly mitigated in product behaviour  
- [ ] Outputs can feed PRODUCT_SPEC_001 without creating a second source of truth  

Deviations require founder Decide (Product Development Lifecycle) and amendment of this specification.

---

*PRODUCT_SPEC_002 — Decision Intelligence Engine. Conceptual reasoning philosophy that every future implementation must preserve. No algorithms, no model cards, no pipelines — only the product brain’s obligations.*
