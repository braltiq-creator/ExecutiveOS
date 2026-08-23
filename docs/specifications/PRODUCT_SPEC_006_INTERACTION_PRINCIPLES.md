# PRODUCT_SPEC_006 — Interaction Principles

**Status:** Formal product specification (interaction behaviour)  
**Version:** 1.0  
**Role:** Converts Executive Design Language into predictable interaction behaviour — how ExecutiveOS behaves when a human acts  
**Authority:** Bound by Constitution · Narrative v1.1 · Product Strategy · Product Principles · Core Executive Loop · PRODUCT_SPEC_001–005 · ADRs  

**Nature:** Interaction behaviour — not UI design, Design System, visual design, engineering, or component library.

Every future interaction pattern must be explainable using this document. If a proposed interaction cannot be defended here, it does not ship.

---

## 1. Interaction Philosophy

### Interaction as an extension of executive judgement

Interaction in ExecutiveOS is not “using features.” It is the sequence of human acts through which judgement is prepared, exercised, recorded, and refined.

Every tap, keystroke, confirmation, deferral, and correction either:

- Advances recognition, understanding, or a path to decide, or  
- Enables Trust / configuration without ransoming judgement, or  
- Is waste — and waste is a defect  

PRODUCT_SPEC_005 defines behavioural language. This specification defines **what happens when the executive acts**: how navigation commits attention, how decisions bind, how AI yields, how errors recover, how pressure reshapes density without rewriting truth.

### The interaction contract

1. **The product prepares; the human decides.**  
2. **Movement is surgical deepening, not browsing.**  
3. **State is preserved under interruption.**  
4. **Authority is always legible.**  
5. **Silence and stillness are valid responses to action when nothing should change.**  
6. **Corrections are light; commits are clear; reversals are dignified.**  

### Interaction and the Core Executive Loop

| Loop stage | Interaction meaning |
|------------|---------------------|
| **Intent** | Amend framing; confirm drafts; review cadence — utility + Briefing strip |
| **Observe** | Grant/revoke Trust; accept gap honesty — rarely “manage signals” |
| **Understand** | Expand why; challenge rationale; open Insights depth |
| **Decide** | Approve, reject, defer, escalate, delegate, reopen — human commit |
| **Execute** | Own commitments; unblock; link Actions to Outcomes |
| **Learn** | Correct inferences; review history; absorb outcomes of past decisions |
| **Refine Intent** | Explicit review acts — not accidental drift |

Interaction that skips Decide while performing activity theatre is not DecisionOS behaviour.

### Predictability over cleverness

Executives under time pressure need **predictable** interaction. Clever gestures that save one second for power users but surprise everyone else fail Reduce Cognitive Load. Patterns should be learnable once and stable across Solo and Enterprise.

### Interaction is not engagement

Success is clarity carried forward — including short sessions. Interactions must not be designed to maximise return visits, scroll depth, or notification opens. Those optimisations violate Outcomes Over Activity and Calm Over Noise.

### The unit of interaction

The atomic unit of valuable interaction is a **judgement move**:

- Recognise (see Intent/Outcomes stakes)  
- Understand (expand why)  
- Act (approve, defer, deepen, correct, grant Trust)  
- Leave (carry clarity forward)  

Flows that require many moves to achieve one of the above are suspect. Flows that create moves without advancing the Loop are rejected.

### Interaction and Information Architecture

PRODUCT_SPEC_004 defines where information lives. Interaction must respect ownership:

- Do not write Outcome health in Reports via a casual gesture  
- Do not turn recommendations into Decisions without Approve  
- Do not use Today as a place to edit Settings  
- Do not use chat to become the SoT for Decisions  

Interaction that crosses ownership without an explicit human act that matches doctrine is a defect — even if the UI feels convenient.

### Institutional predictability

An executive who learned Decision behaviour on Monday should find the same behaviour on board day, on mobile, and in Enterprise. Edition depth may add escalate/delegate richness; it must not invent a second gesture language for the same authority act.

---

## 2. Navigation Behaviour

### Primary navigation

Exactly six primary destinations behave as **peer jobs**, not as a feature drawer:

Today · Decisions · Insights · Actions · Knowledge · Reports

**Behaviour:**

- Selecting a primary changes the job of attention.  
- Exactly one primary is active; nested routes inherit that primary’s highlight identity (PRODUCT_SPEC_004).  
- Primary navigation never includes Settings, Intent, Outcomes, Calendar, Assistant, or AI Hub.  
- Switching primaries should feel like changing rooms with a known purpose — not like losing context without recovery.  
- Today remains the default landing after authentication and the recovery centre of the OS.

**Anti-behaviour:** Seventh primary for discoverability; hiding Decisions behind “More” when six can fit; dynamic reordering of primaries by “engagement.”

### Logo behaviour

**Logo / wordmark always navigates to Today** — the Executive Briefing — never to marketing, never to the last visited novelty, never to Assistant.

This is a hard experience contract (Constitution; PRODUCT_SPEC_003–005). Interaction that breaks Logo → Today breaks the morning boot.

### Deep links

Deep links are the preferred way to move from synthesis to depth:

- Today → Decision detail  
- Today → Outcome detail  
- Today → Intent utility  
- Today → Action commitment  
- Recommendation → owning destination  

**Behaviour:**

- Deep links are surgical: one clear destination that advances judgement.  
- Arrival preserves enough context to know *why* the executive landed (source framing: Briefing item, recommendation, health).  
- Deep links do not open parallel spectacles (chat + graph + admin).  
- After the job completes, return via Logo → Today, explicit return to Briefing, or natural completion — never strand in a utility cul-de-sac without a path home.

### Back behaviour

Back restores the previous meaningful judgement context — not an arbitrary browser stack that dumps the executive into marketing or empty states.

**Behaviour:**

- From detail → parent list or Briefing source when that was the path.  
- Warn before discarding unsaved judgement work.  
- Do not treat Back as Undo of a committed Decision (Undo is an explicit authority act — §4).  
- Back should never silently re-open setup ransom or AI chat as “previous.”  

### Command palette

Command palette / jump search is **chrome interaction**, not a primary destination.

**Behaviour:**

- Accelerates movement across the existing map (primaries + utility).  
- Lands in owning areas; does not invent a perpetual results home.  
- Does not replace Briefing reasoning for “what matters today?” (PRODUCT_SPEC_004 search philosophy).  
- Respects Trust boundaries — no invented results from ungranted sources.  
- Discoverable without becoming a seventh peer labelled Search.

### Cross-navigation

Executives may traverse Decisions → Outcomes → Actions in one judgement episode.

**Behaviour:**

- Cross-navigation preserves the object thread (which Decision, which Outcome).  
- Primary highlight follows the room; the thread remains recoverable.  
- Cross-navigation must not duplicate SoT or spawn shadow copies.  
- Calendar, meetings, and assistant remain secondary surfaces entered from context — not competing homes (PRODUCT_SPEC_004).  

### Utility navigation

Intent, Outcomes, and Settings/Account are reached deliberately:

- From Briefing strip / Outcome Health chrome / Account  
- From command palette  
- From deep links that name the job  

**Behaviour:**

- Utility entry should state the job (amend Intent; review Outcome; manage Trust).  
- Utility exit should make return to Today obvious.  
- Utility must never hijack the first session before Magic Moment value (Value Before Commitment).  
- Settings interaction is enabling, lower emotional temperature — not morning theatre.  

### Navigation state and “where am I?”

The executive should always be able to answer:

1. Which primary job am I in?  
2. Which object am I judging?  
3. How do I return to Today?  

If interaction leaves those questions ambiguous, navigation behaviour has failed — regardless of visual polish.

### Navigation under Board Mode

Board Mode changes density and emphasis — not the navigation map. Primaries remain. Deep links remain honest. Logo still → Today. The interaction difference is restraint of what demands attention, not a second OS.

---

## 3. Selection Behaviour

### Single selection

Default interaction for judgement objects is **single selection**: one Decision, one Outcome, one Action in focus.

**Behaviour:**

- Selecting an object makes it the centre of attention for the region.  
- Selection reveals progressive disclosure paths (why, evidence, related).  
- Single selection matches One Centre of Attention (PRODUCT_SPEC_005).  
- Bulk leadership judgement is rare; v1 doctrine prefers acting on items individually (executive accountability).

### Multi-selection

Multi-selection is allowed only when it serves a clear executive job without diluting authority:

- Exporting a defined set for Reports  
- Bulk administrative acts in Settings (team invites) — never bulk “approve all decisions”  
- Explicit portfolio filters that are not silent commits  

**Forbidden multi-select patterns:**

- Approve / reject many Decisions in one gesture without individual recognition  
- Gamified “clear the queue”  
- Multi-select that becomes the primary way Decisions are handled  

### Context preservation

Selection and navigation must preserve context across interruption:

- Unsaved drafts remain recoverable  
- Scroll/expand state restores where it aids resume (without replaying noise)  
- The object under judgement remains identifiable after a phone call mid-decision  
- Switching primaries and returning should not wipe Briefing-derived framing when still relevant  

Context preservation is not “remember every expansion forever.” It is **resume judgement without reconstruction homework**.

### Focus management

Focus (keyboard and attentional) follows hierarchy:

1. Lead question / primary action region  
2. Supporting explanation  
3. Secondary disclosure controls  
4. Chrome (nav, account) without stealing the triad on load  

**Behaviour:**

- Opening a detail moves focus to the authority region (decide / amend), not to decorative chrome.  
- Dismissing overlays returns focus to the invoking control.  
- Focus order matches the triad — what / why / what to do — not visual novelty order.  
- Modals and confirmations trap focus until resolved or cancelled; they never leave focus in an invisible void.  

Focus management is accessibility and Design Language together: if focus order contradicts judgement order, interaction has failed.

### Hover, press, and preview (behavioural rules without UI)

Where pointing devices exist:

- Preview that reveals why must not auto-commit.  
- Press-and-hold must not become a hidden approve.  
- Hover alone never changes organisational state.  

Where touch is primary:

- Targets for Approve/Reject must be unmistakably intentional.  
- Swipe gestures, if any, map to navigation or defer — never to silent Approve.  
- Accidental edge swipes must not bind Decisions.  

### Selection and progressive disclosure

Selecting an object is permission to deepen — not an obligation.

**Behaviour:**

- First selection: enough to judge whether to deepen.  
- Explicit expand: evidence, alternatives, advisor rationale.  
- Collapse restores the centre without losing the object identity.  

Selection that immediately dumps Knowledge graph or full audit floods violates Progressive Disclosure.

---

## 4. Decision Behaviour

Decision interaction is where Executive Decides becomes tactile. Recommendations may propose; only these acts (and equivalents) bind organisational judgement.

### Approve (Decide / Commit)

**Behaviour:**

- Explicit human commit.  
- Outcome linkage already required (ADR-002); interaction refuses orphan commits.  
- Confirmation is calm clarity — not celebration.  
- After approve: state is unmistakably decided; rationale and actor are attributable.  
- Approve never happens silently from AI streaming completion.

### Reject (Decline)

**Behaviour:**

- Explicit decline of a proposed path or Decision option.  
- May capture brief reason when it improves Learn — without interrogation.  
- Decline is dignified; no punishment motion or guilt copy.  
- Rejected recommendations do not become Decisions; they remain intelligence history if retained.

### Defer

**Behaviour:**

- Valid leadership act: not now, with optional revisit cue.  
- Defer removes false urgency without deleting stakes.  
- Deferred items remain findable in Decisions; they do not haunt Today as equal urgency unless time makes them consequential again.  
- Defer is not ignore-forever; nor is it a shame state.

### Escalate

**Behaviour:**

- Moves judgement to a higher or adjacent authority with context intact.  
- Escalation carries Outcome stakes, explanation, and confidence — not a naked ping.  
- Escalation does not auto-decide.  
- Enterprise-only richness may deepen here; Solo may map escalate to “park with note.”

### Delegate

**Behaviour:**

- Transfers ownership of preparation or execution — not silent transfer of accountability for organisational Decision unless role model allows.  
- Delegation of Actions is natural; delegation of Decisions must make remaining authority clear.  
- Delegate never impersonates the executive’s commit.

### Undo

**Behaviour:**

- Undo reverses recent reversible acts (e.g. accidental status change, mistaken defer) within a clear window where stakes allow.  
- Undo is not time travel that invents alternate history; audit remains honest.  
- High-stakes published board narratives and legally binding acts may require **reopen / reverse Decision** rather than casual undo.  
- Undo must be offered for destructive or easy-to-misclick acts; it must not become a way AI silently rewrites commits.

### Reopen

**Behaviour:**

- Explicit act to return a closed Decision to active judgement when reality changes.  
- Reopen preserves prior history; it does not erase the past commit.  
- Reopen requires human intent — not automatic thrash from every new signal.

### Review

**Behaviour:**

- Scheduled or intentional revisit of Decision quality and Outcome impact (Learn).  
- Review surfaces what was decided, why, and what changed — without gamified scoring of the executive.  
- Intent review cadence (ADR-006) is a related but distinct review act on framing, not on every Decision.

### Decision interaction principles (summary)

| Act | Authority | Feel |
|-----|-----------|------|
| Approve | Human bind | Settled clarity |
| Reject | Human refuse | Dignified close |
| Defer | Human timing | Urgency removed, stakes kept |
| Escalate | Human route | Context preserved |
| Delegate | Human assign | Ownership clear |
| Undo | Human reverse (limited) | Recoverable mistake |
| Reopen | Human renew | History intact |
| Review | Human learn | Accountable reflection |

AI may draft options and language for these acts. AI may not complete them.

### Decision behaviour on Today versus in Decisions

**Today** prepares: surfaces priority Decisions, explains stakes, offers deep link. Light acts (defer from Briefing, open to decide) are allowed when they reduce friction without hiding authority.

**Decisions** commits and remembers: full register behaviour, history, reopen, review.

**Behavioural rule:** Do not turn Today into the only place Decisions can be committed if that creates hidden state. Prefer: Briefing → deep link → clear commit in Decision context — unless a single explicit Briefing commit is unmistakably the same authority act with full Outcome linkage and attribution.

Convenience that creates dual write paths is forbidden (PRODUCT_SPEC_004 ownership).

### Alternatives and recommendations in Decision interaction

When alternatives exist:

- Present as options to choose among — not as pre-ticked AI preference without recognition.  
- Explain tradeoffs relative to Outcomes.  
- Allow “none of these / defer” as valid.  

Recommendations adjacent to Decisions remain proposals until Approve.

### Audit interaction

Without designing UI:

- Executives (and enterprise auditors where entitled) must be able to retrieve who decided what, when, with what stated rationale.  
- Interaction that erases attribution to “clean the UI” fails institutional ethos.  
- Learn depends on durable history; interaction must not encourage silent rewrite of the past.  

---

## 5. AI Interaction Behaviour

### When AI appears

AI appears as advisor craft inside structure:

- Explain why something ranked  
- Summarise consequential change  
- Ground in Intent/Outcomes  
- Draft Decision/Report language on deepen  
- Suggest deep links to owning destinations  

Appearance is sparse, institutional, challengeable (PRODUCT_SPEC_003 §6; PRODUCT_SPEC_005 §6).

### When AI disappears

AI disappears when structured truth already carries the moment, when the day is quiet, when confidence is too low to add value beyond a named gap, when speech would fill space, or when capabilities are unavailable.

**Interaction implication:** The executive can complete navigation, Decision commits, and Briefing boot **without** AI. AI absence is not an error state for the OS.

### Streaming

If streaming is used:

- It must not block the triad from being scannable via structured content already present.  
- It must not perform “thinking” as entertainment.  
- It must be interruptible.  
- Partial streamed text is provisional until settled; it never auto-commits.  
- Prefer streaming for long drafts in depth contexts — not for the morning lead judgement if it delays clarity.

### Confidence

AI confidence interacts with PRODUCT_SPEC_002 confidence model:

- High confidence → clearer proposals still marked as proposals  
- Low confidence → questions, drafts, or silence — not fluent fiction  
- Confidence is visible enough to challenge; never theatrical gauges that become the product  

Interaction must allow the executive to distrust and override without ceremony.

### Interruptions

Executives interrupt AI as freely as they interrupt any subordinate preparation:

- Cancel generation  
- Edit drafts mid-flight  
- Navigate away without saving AI theatre as debt  
- Resume human path without completing the model’s output  

Interrupted AI does not punish with badges or “unfinished generation” guilt.

### Drafts

Drafts are the preferred AI contribution pattern:

- Draft Intent, draft Decision narrative, draft Action, draft Report section  
- Human confirms, edits, or discards  
- Drafts are visually and behaviourally distinct from committed Decisions  

Capture Once / Infer Continuously / Confirm Sparingly lives here as interaction.

### Human overrides

Overrides are first-class:

- Correct ranking perception via defer/focus amendment  
- Edit inferred Intent/Focus  
- Reject recommendation  
- Replace AI wording entirely  

Overrides feed Learn. They must feel light (PRODUCT_SPEC_005 reversibility). Override is not “fighting the product”; it is teaching the OS.

### AI interaction anti-patterns

- Chat as the only interaction path  
- Streaming that auto-approves  
- Uninterruptible generation walls  
- AI that must be dismissed before Today is usable  
- Confidence theatre that replaces Outcome stakes  

### Asking versus telling

When AI asks:

- Rare  
- High stakes, low confidence  
- Prefer draft-and-confirm over blank interrogation  
- Questions feel like respect for judgement, not ticket forms (PRODUCT_SPEC_003)  

When AI tells:

- Only after recognition and explanation  
- Always challengeable  
- Never in command tone that impersonates the executive  

### Assistant as secondary interaction surface

Chief-of-Staff / assistant conversational UI, when present:

- Is not primary nav  
- Is entered from Today, Insights, or command palette  
- Must deep-link into owning destinations for consequential acts  
- Must not become the SoT for Decisions or Outcomes  
- Must yield when the executive opens structured Decision commit flows  

Conversation proposes; structure binds.

---

## 6. Loading Behaviour

### Loading

Loading should be honest, brief in presence, and hierarchy-preserving.

**Behaviour:**

- Preserve layout of the triad regions so scanning structure appears before full data.  
- Prefer structured placeholders over blank anxiety.  
- Never make the executive wait on personality animation to see what matters.  
- Loading is not brand theatre (PRODUCT_SPEC_005 motion).  

### Partial loading

Partial truth is a first-class success state.

**Behaviour:**

- Show what is known; label what is loading or unknown.  
- Do not wait for all connectors to present a useful Briefing.  
- Partial loading must not flicker false completeness then retract into chaos.  
- Ranked items may appear as soon as they are trustworthy enough to show; they must update calmly if ranking changes.  

### Offline

**Behaviour:**

- Declare offline honestly.  
- Allow review of last trusted Briefing/Decisions where locally available.  
- Block commits that cannot be durable with clear explanation — or queue with explicit “will sync” only when safe.  
- Never invent live connector truth while offline.  

### Slow connections

**Behaviour:**

- Prefer progressive reveal of structured lead content over waiting for heavy Insights depth.  
- Today’s triad outranks Knowledge graph richness.  
- Timeouts degrade gracefully into gap labels and retry — not endless spinners.  
- Slow is not an excuse for reduced honesty.  

### Missing data

Missing data is not an error when Trust was never granted or inference is incomplete.

**Behaviour:**

- Gap labels over fabricated metrics.  
- Smallest Progressive Trust ask **after** partial value — never as ransom before any Briefing.  
- Missing data must not force configuration-first interaction loops.  

### Stale data behaviour

When data may be stale:

- Indicate freshness in behavioural terms (“as of…”, “sync unavailable”) without metric obsession.  
- Do not present stale connector truth as live.  
- Allow manual refresh as an explicit act — not a nervous default animation loop.  
- Stale-but-honest beats fresh-but-fabricated.  

### Race conditions in interaction

If the executive commits while ranking is still updating:

- Commit applies to the Decision object identity they confirmed.  
- Do not silently swap the object under them mid-approve.  
- If the world changed materially, confirm with calm re-recognition rather than completing a bait-and-switch.  

---

## 7. Notification Behaviour

### Philosophy

Notifications are rare instruments of judgement — not engagement hooks. Calm Over Noise binds every alert.

### Alerts

Alerts interrupt only when consequence requires attention that cannot wait for the next natural Briefing open.

**Behaviour:**

- Explained stakes required.  
- Deep link to owning object.  
- Cap frequency; refuse marketing.  
- Alert copy answers why this matters to Outcomes/Intent.  

### Recommendations

Recommendations are primarily **in-product Briefing/Insights proposals**, not push spam.

**Behaviour:**

- Push/email recommendations only when explicitly valuable and opted into Progressive Trust channels.  
- Recommendation notifications never auto-commit.  
- Prefer waiting for Today when the matter can wait hours.  

### Warnings

Warnings signal risk to Outcomes, Trust, or integrity (connector failure, permission loss, conflicting state).

**Behaviour:**

- Calm, specific, recoverable.  
- Distinguish “business risk” from “product broken.”  
- Warnings do not cry wolf with equal severity.  

### Urgent events

Urgency is rare by doctrine.

**Behaviour:**

- Urgency requires explanation and Outcome consequence.  
- Urgent ≠ loud decoration; urgent = interaction priority and clarity.  
- Board days may elevate composure needs (Board Mode) without inventing false urgency.  

### Quiet mode

Quiet mode (and Board Mode’s attention restraint) reduces proactive interruption.

**Behaviour:**

- Suppress non-critical alerts.  
- Preserve ability to open Today and decide.  
- Quiet mode is not “hide bad news”; it is “do not interrupt unless judgement truly cannot wait.”  
- Exiting quiet restores deliberate hierarchy — not a flood of pent-up badges.  

### Notification hierarchy

| Level | When | Interaction |
|-------|------|-------------|
| **Silent** | Default for most change | Wait for Briefing |
| **In-product badge/meta** | Mild consequential | Visible on next open |
| **Alert** | Rare true urgency | Interrupt + deep link |
| **Forbidden** | Marketing, streaks, AI novelty | Never |

### Digests versus interrupts

Periodic digests (if any) are opt-in summaries that invite opening Today — they are not a parallel OS.

**Behaviour:**

- Digest points into Briefing/Decisions.  
- Digest does not contain silent commits.  
- Digest frequency respects Calm; daily maximum attention caps apply in spirit even when channels vary.  

### Recommendation fatigue

If the executive repeatedly defers or rejects a class of recommendation:

- Interaction should learn (PRODUCT_SPEC_002 Learn) — reduce nagging.  
- Do not escalate volume to “drive engagement.”  
- Revisit only when Outcome stakes materially change.  

Notification systems that ignore human overrides violate Progressive Trust and Recognition Before Recommendation.

---

## 8. Error Behaviour

### Recoverable errors

**Behaviour:**

- Name what failed in plain language.  
- Preserve what remains true.  
- Offer smallest next step (retry, edit, open Settings Trust).  
- Do not shame.  
- Do not clear the executive’s draft work unless durability requires it — and then say so.  

### Fatal errors

**Behaviour:**

- Admit the OS cannot continue the current act.  
- Provide recovery path (reload Today, sign in again, contact support for enterprise).  
- Never pretend success.  
- Never dump technical theatre as the only message; include human-usable meaning.  

### Validation

**Behaviour:**

- Validate before commits that would create orphan Decisions, empty Intent nonsense, or Trust-scope violations.  
- Validation messages teach the rule briefly (e.g. Decision needs Outcomes) — not a form war.  
- Inline clarity preferred over multi-page punishment.  

### Trust failures

Connector revoked, token expired, scope insufficient:

**Behaviour:**

- Graceful degradation of Observe.  
- Briefing continues with gap honesty.  
- Clear path to Settings/Trust Zone.  
- No zombie metrics from dead Trust.  
- No ransom that blocks Today until reconnected.  

### Missing permissions

**Behaviour:**

- Explain what cannot be done and who can grant.  
- Enterprise: route to admin without stranding.  
- Solo: plain upgrade/permission path without dark patterns.  
- Missing permission is not framed as personal failure.  

### Error interaction principles

Truth Before Convenience: a clear error that preserves Confidence Through Clarity beats a masked failure that invents completeness.

### Conflict errors

When two truths conflict (e.g. local draft vs server Decision state):

**Behaviour:**

- Surface the conflict plainly.  
- Prefer human choice with context over automatic “last write wins” on leadership Decisions.  
- Preserve both sides until resolved when stakes are high.  
- Never discard a human commit silently.  

### Validation timing

**Behaviour:**

- Validate authority constraints at the moment of commit (Outcome linkage, permissions).  
- Do not block scanning/reading with premature validation walls.  
- Allow exploration of drafts with soft warnings; hard block only when binding would violate doctrine.  

---

## 9. Accessibility Behaviour

Accessibility is institutional respect — part of Executive Design, not an appendix (PRODUCT_SPEC_005).

### Keyboard navigation

**Behaviour:**

- All judgement paths operable by keyboard: navigate primaries, open details, expand why, commit Decision acts, cancel.  
- Command palette reachable by keyboard.  
- No authority act available only via hidden gesture.  
- Shortcuts accelerate; they do not become the only path.  

### Screen readers

**Behaviour:**

- Name objects with complete thoughts (Decision question, Outcome stakes) — not cryptic IDs alone.  
- Announce state changes that matter (decided, deferred, offline, Trust gap).  
- Do not rely on visual hierarchy alone for meaning.  
- AI proposals announced as proposals, not as faits accomplis.  

### Focus order

Focus order follows judgement order: lead → why → act → secondary → chrome.

**Behaviour:**

- Skip repetitive chrome where appropriate without removing access to nav.  
- Dialog focus trap with escape/cancel.  
- Return focus on close.  

### Reduced motion

**Behaviour:**

- Honour reduced-motion preferences.  
- Clarity of state change remains without animation.  
- No information solely in motion.  

### High contrast / contrast-independent meaning

Without prescribing colours:

**Behaviour:**

- Meaning must not depend on a single sensory channel.  
- Status (decided, at risk, deferred) has textual/structural expression.  
- Urgency is explained in language, not only in emphasis styling.  

### Accessibility interaction anti-patterns

- Drag-only workflows for core commits  
- Time-limited unpauseable toasts as the only undo  
- Focus lost after AI stream completes  
- “Click the red thing” as the sole instruction  

### Time and cognitive accessibility

Executives include people under extreme cognitive load — that is the default user, not an edge case.

**Behaviour:**

- Avoid interactions that require holding many transient steps in working memory.  
- Prefer named states over invisible multi-phase gestures.  
- Provide durable draft saving for long Decision narratives.  
- Do not expire critical undo so fast that only the fastest users recover.  

Designing for the interrupted, sceptical, accountable executive *is* accessibility for DecisionOS.

### International and language behaviour (interaction-level)

Without prescribing locale UI:

- Authority verbs (Approve, Defer) must remain unambiguous when translated.  
- Do not encode critical meaning only in idioms or playful microcopy.  
- AI drafts follow the executive’s language preferences from Settings — still as drafts.  

---

## 10. Behaviour Under Pressure

### Board meetings

**Behaviour:**

- Board Mode: same truth, restrained density, presentation composure (PRODUCT_SPEC_003).  
- Quiet mode compatible.  
- Deep links still honest; avoid opening noisy secondary surfaces mid-presentation.  
- Commits during board are explicit and rare; prefer note/defer unless decision is the meeting’s purpose.  
- Reports primary for formal narrative; Board Mode does not become BI pack theatre.  

### Mobile

**Behaviour:**

- Same six primaries; prefer visible peers over hiding Decisions/Insights.  
- Triad scannable in first viewport of attention.  
- Decision commits remain explicit despite smaller surface — never accidental approve.  
- Progressive disclosure more aggressive; density lower.  
- Logo → Today remains.  

### Poor connectivity

Align with §6 slow/offline:

- Lead structured content first  
- Honest gaps  
- No invented live truth  
- Commits only when durable or explicitly queued  

### Time pressure

**Behaviour:**

- Optimise for scan → one act → leave.  
- Do not require multi-step configuration to reach judgement.  
- Defer is a first-class escape valve.  
- Interruptibility everywhere.  
- Short session that yields clarity is success — do not invent “one more thing” walls on exit.  

### Pressure anti-patterns

- Demo-ware motion under board scrutiny  
- Mobile chat-home replacement for Today  
- Offline false confidence  
- Time pressure used to justify autopilot commits  

### Concurrent leadership contexts

An executive may bounce between 1:1 notes, ELT, and Today.

**Behaviour:**

- Multiple contexts should not corrupt Decision identity.  
- Board Mode on one device should not leave another session in a noisy default without clarity.  
- Session restore prefers last judgement context with easy return to Today.  

### Security pressure (enterprise)

Under security review or incident:

- Interaction may require re-authentication for sensitive commits.  
- Re-auth must explain why — not appear as random punishment.  
- Security friction must not become configuration-first onboarding by stealth.  
- Trust Zone remains the home for permission clarity.  

---

## 11. Interaction Principles

Approximately twenty-five timeless principles. Reference before shipping any interaction.

1. **Interaction extends judgement** — if it does not prepare, decide, execute, learn, or enable Trust, remove it.  
2. **Prepare, don’t decide for them** — proposals never silently bind.  
3. **Logo returns to Today** — always.  
4. **Six primaries; no seventh by interaction cleverness.**  
5. **Deepen surgically** — deep links over menu sprawl.  
6. **Back restores judgement context** — not marketing, not AI guilt.  
7. **Command palette jumps; it does not judge.**  
8. **One centre of selection** by default; multi-select never bulk-decides leadership.  
9. **Preserve context under interruption.**  
10. **Focus order follows the triad.**  
11. **Approve is explicit, calm, attributable.**  
12. **Reject and defer are dignified leadership acts.**  
13. **Escalate and delegate carry context; they do not auto-commit.**  
14. **Undo recovers mistakes; reopen renews history — neither erases truth.**  
15. **Review teaches; it does not gamify the executive.**  
16. **AI appears to explain and draft; AI disappears when silence is wiser.**  
17. **Streaming is interruptible and never auto-approves.**  
18. **Drafts confirm; commits bind.**  
19. **Overrides are light and first-class.**  
20. **Partial truth beats delayed fiction.**  
21. **Offline and Trust gaps are honest.**  
22. **Notifications are rare, explained, and opted with Progressive Trust.**  
23. **Quiet mode suppresses interruption, not integrity.**  
24. **Errors name failure, preserve truth, offer the smallest next step.**  
25. **Keyboard and assistive paths can complete every authority act.**  
26. **Under pressure: same truth, less density, no autopilot.**  
27. **Short clear sessions win** — no exit ransom.  
28. **Predictability over cleverness.**  
29. **Every interaction must be defendable under Confidence Through Clarity.**  

### How to use these principles in review

Before a critique or design review, pick the three principles most at risk in the proposal. If any fail, redesign. Do not average them away (“mostly calm except for this badge flood”).

Interaction review questions:

- What judgement move does this complete?  
- Who holds authority at the end of the gesture?  
- What happens if the executive is interrupted mid-flow?  
- What happens if AI is unavailable?  
- What happens if Trust is partial?  
- Does Logo still return to Today after this pattern exists?  

If reviewers cannot answer, the interaction is not ready for UX detailing.

### Principles versus patterns

Principles endure. Patterns may evolve. A future pattern library must cite which principles it obeys. A pattern that cites none is decoration. A pattern that violates one requires founder-level exception — not quiet shipping.

---

## 12. Specification Gate

Before UX interaction design begins, confirm:

| # | Criterion | Pass? |
|---|-----------|-------|
| 1 | Interactions reflect Product Doctrine and PRODUCT_SPEC_005 Design Language | |
| 2 | Navigation obeys Logo → Today, six primaries, utility rules (SPEC_004) | |
| 3 | Decision acts are explicit; AI cannot bind | |
| 4 | Deep links and Back preserve judgement context | |
| 5 | Selection defaults to single centre; no bulk leadership approve | |
| 6 | AI appearance/disappearance/streaming/overrides match §5 | |
| 7 | Loading/partial/offline/missing data prefer honesty over completeness theatre | |
| 8 | Notification hierarchy is calm; quiet mode defined | |
| 9 | Errors recoverable with dignity; Trust failures degrade gracefully | |
| 10 | Accessibility: keyboard, focus order, reduced motion, non-colour-only meaning | |
| 11 | Pressure behaviours (board/mobile/slow/time) preserve truth | |
| 12 | No anti-pattern from SPEC_005 §9 required for the interaction to work | |
| 13 | Interaction Principles §11 applied to every proposed gesture | |
| 14 | Confidence Through Clarity remains the outcome of the interaction sequence | |

Pixels and components begin only after interaction behaviour is ratified.

### Gate failure examples

| Proposal | Result |
|----------|--------|
| Swipe right to approve Decision | Fail — accidental authority |
| Assistant as default after login | Fail — Logo/Today contract; chat-first |
| “Mark all recommendations done” | Fail — bulk leadership decide |
| Block Today until Salesforce connected | Fail — Value Before Commitment; ransom |
| Unskippable AI stream on Briefing | Fail — interruptibility; silence |
| Hide Back after deep link | Fail — stranded utility |
| Celebrate Decision with streak points | Fail — gamification; Outcomes Over Activity |
| Offline show live pipeline numbers | Fail — Truth Before Convenience |

### Relationship to UX start

Passing this gate authorises interaction-pattern exploration and UX flows that **implement** these behaviours. It does not authorise visual invention that reintroduces SPEC_005 anti-patterns. Design System work remains subordinate.

---

## Relationship to Other Documents

| Document | Relationship |
|----------|----------------|
| PRODUCT_SPEC_005 | Behavioural language — this SPEC is interaction enactment |
| PRODUCT_SPEC_004 | Where movement is allowed — this SPEC how movement behaves |
| PRODUCT_SPEC_003 | Briefing experience feelings — this SPEC general interaction rules |
| PRODUCT_SPEC_002 | Engine reasoning — this SPEC human/AI interaction at the edge |
| Product Principles | Philosophical tests — interaction must pass them |
| Design System / components (future) | Must implement these behaviours; cannot invent conflicting gestures |

---

## Appendix — Interaction Anti-Patterns (Quick Reference)

| Anti-pattern | Reject because |
|--------------|----------------|
| Accidental approve on scroll/swipe | Executive Decides |
| Chat as navigation | SPEC_004/005 |
| Uninterruptible AI wall | Calm; human authority |
| Badge flood after quiet mode | Calm Over Noise |
| Bulk decide | Accountability |
| Back = Undo commit | Authority clarity |
| Loading as entertainment | Motion philosophy |
| Offline invented metrics | Truth Before Convenience |
| Mobile hides Decisions | IA / judgement path |
| Exit “one more connector” wall | Value Before Commitment |

---

## Appendix — Decision Act Matrix (Behavioural)

| Act | Requires recognition? | AI may draft? | AI may complete? | Typical next state |
|-----|----------------------|---------------|------------------|--------------------|
| Approve | Yes | Yes | No | Decided (attributed) |
| Reject | Yes | Optional reason | No | Closed / declined |
| Defer | Yes | Optional revisit cue | No | Deferred (findable) |
| Escalate | Yes + context pack | Yes | No | Awaiting authority |
| Delegate | Yes + ownership clarity | Yes | No | Owned by assignee |
| Undo | Prior act reversible | No | No | Prior state (audited) |
| Reopen | Explicit intent | No | No | Active again (history kept) |
| Review | Historical context | Summary draft | No | Learnings recorded |

This matrix is binding for interaction design. Convenience that collapses columns is rejected.

---

## Appendix — Session Arc (Interaction)

A healthy session, behaviourally:

```
Enter (Today)
  → Scan triad
  → Optional deepen (deep link)
  → Optional authority act (decide / defer / correct / trust)
  → Return or leave with clarity
```

Unhealthy session arcs to refuse:

```
Enter → Configure → Configure → Configure → Maybe Briefing
Enter → Chat → Chat → No Decision record
Enter → Feed scroll → No centre → Exhaustion
Enter → AI wall → Wait → Missed meeting
```

Interaction design is the craft of making the healthy arc the path of least resistance — without autopilot.

---

*PRODUCT_SPEC_006 — Interaction Principles. Predictable acts. Human authority. Judgement under pressure.*
