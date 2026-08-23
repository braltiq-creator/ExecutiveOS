# ExecutiveOS Concierge Onboarding

## Philosophy

Onboarding is not data entry — it is **the creation of an Executive Digital Twin** through a guided conversation with the Chief of Staff advisor.

The executive should feel like they hired a world-class Chief of Staff who asks the right questions, listens carefully, and delivers a first intelligence briefing before the conversation ends.

**Duration target:** 12–18 minutes active; value at minute 8.

---

## Journey Map

```
Invite → Welcome → Identity → Strategy → Context → Connect → Build → Reveal → Ritual
  │         │          │          │         │         │        │        │        │
 Day 0    Day 0      Day 0      Day 0     Day 0    Day 0–1  Day 1   Day 1   Day 2+
```

| Stage | Emotion | Outcome |
|-------|---------|---------|
| Welcome | Trust | "This is professional, not a toy" |
| Identity | Recognition | "It knows who I am" |
| Strategy | Investment | Objectives captured |
| Context | Depth | Challenges + systems understood |
| Connect | Confidence | Calendar linked |
| Build | Anticipation | Graph + memory generating |
| Reveal | **Aha** | First real insight delivered |
| Ritual | Habit | Tomorrow morning expectation set |

---

## Conversation Flow

### Act 1 — Welcome (Chief of Staff voice)

**Screen:** Full-viewport calm canvas. Meridian mark centered. No form fields.

```
Chief of Staff:
"Welcome to ExecutiveOS. I'm your AI Chief of Staff.

Over the next few minutes, I'll learn how you lead — your objectives,
your priorities, and how your organization operates.

Everything you share builds your Executive Digital Twin: the intelligence
layer that powers your daily brief, your advisors, and your knowledge graph.

Shall we begin?"

[Begin →]
```

**Design:** Ink 900 CTA on white. No progress bar yet — conversation feel, not wizard.

---

### Act 2 — Identity (Conversational form)

**Pattern:** One question per screen. Chief of Staff asks; executive answers. Progress dots subtle (8 steps).

| Step | Question | Input |
|------|----------|-------|
| 1 | "What should I call you?" | Preferred name |
| 2 | "What's your role?" | Job title |
| 3 | "Which organization do you lead?" | Company name |
| 4 | "What industry?" | Select or type |
| 5 | "Where are you based?" | Country + timezone (auto-detect) |
| 6 | "How large is your organization?" | Company size band |
| 7 | "What's your revenue scale?" | Revenue band (optional skip) |
| 8 | "How many people report to you, directly or indirectly?" | Team size |

**UX:** Large input fields. Chief of Staff avatar dot (Meridian blue, not face). Back arrow always visible.

---

### Act 3 — Strategy (Highest value capture)

| Step | Question | Input |
|------|----------|-------|
| 1 | "What are your top three strategic objectives this year?" | 3 objective fields with priority |
| 2 | "What's the single biggest challenge facing the business?" | Textarea |
| 3 | "What's your greatest leadership challenge right now?" | Textarea |
| 4 | "What would reclaiming 5 hours per week enable you to do?" | Textarea (aspirational anchor) |

**Chief of Staff response after objectives:**
"I've recorded your objectives. I'll track initiative health and risks against each of these."

---

### Act 4 — Operating Context

| Step | Question | Input |
|------|----------|-------|
| 1 | "Which systems does your executive office rely on?" | Multi-select: M365, Salesforce, Notion, etc. |
| 2 | "Who assembles your executive brief today?" | CoS / EA / Self / Other |
| 3 | "What decision are you currently weighing?" | Optional — seeds first decision |

---

### Act 5 — Microsoft 365 Connection

**Screen:** Split — left conversation, right calendar preview skeleton.

```
Chief of Staff:
"Connecting your calendar lets me prepare you for meetings,
detect conflicts, and link your schedule to initiatives and decisions.

Your data stays within your organization. ExecutiveOS never trains
models on your information."

[Connect Microsoft 365]
[Skip for now — I'll remind you tomorrow]
```

**On connect:** OAuth flow → return to onboarding with success animation (Meridian line draws 600ms).

---

### Act 6 — Knowledge Graph Creation (Loading)

**Full-screen build animation — the "magic moment" but earned, not fake.**

```
Building your Executive Digital Twin...

✓ Executive profile established
✓ Strategic objectives linked
◐ Knowledge graph generating...
○ Executive memory initializing
○ Advisors calibrating to your context
```

**Visual:** Graph nodes appear one-by-one (max 12 visible) — executive, 3 objectives, placeholder initiative nodes, calendar node. Lines draw between them.

**Duration:** 8–15 seconds real processing. Never fake longer than actual.

**Backend:** Trigger graph rebuild, intelligence center build, advisor context prep.

---

### Act 7 — Executive Memory Creation

Auto-create initial memory entries from onboarding:

| Memory Type | Source |
|-------------|--------|
| Insight | Top objective summary |
| Commitment | "Track progress against [objective 1]" |
| Observation | Industry + company size context |

User does not see this step directly — happens during graph build.

---

### Act 8 — AI Welcome (Advisor Introduction)

Brief appearance of Chief of Staff + Strategy Advisor (2 cards, not all 10).

```
Chief of Staff:
"Your Executive Digital Twin is ready. I've identified your first priority."

Strategy Advisor:
"Based on your objectives, I recommend focusing on [top objective]
this week. One initiative should be defined to advance it."
```

---

### Act 9 — First Insight Reveal (Aha Moment)

**Transition to Intelligence Center with onboarding overlay dismissed.**

Priority strip pre-populated with real scored insight from their data:

Example:
```
PRIORITY INTELLIGENCE
Advance Q3 revenue objective — no active initiative tracked
Score: 78 · Strategic alignment: High
```

**Chief of Staff overlay (once):**
"This is your Intelligence Center. I'll refresh this continuously.
Open it tomorrow morning before your first meeting."

[Enter ExecutiveOS →]

---

### Act 10 — First Recommendation

Advisor panel shows one concrete recommendation:

```
Strategy Advisor · 82% confidence
Define an initiative for "[Objective 1]" with a target date this quarter.
→ Create initiative
```

**CTA links to initiative form pre-filled.**

---

## Loading Animations

| State | Animation |
|-------|-----------|
| Step transition | 200ms slide left |
| M365 connecting | Pulse on calendar icon |
| Graph building | Nodes + edges draw (see Act 6) |
| Insight reveal | Priority strip fade-up 400ms |

All respect `prefers-reduced-motion`.

---

## Empty → Populated Transition

Onboarding must leave **no empty dashboard**. Minimum after completion:

- ≥3 objectives
- ≥1 initiative (prompted if not created)
- ≥1 decision or memory entry
- ≥1 calendar event (if M365 connected)
- ≥20 graph nodes
- ≥1 priority insight

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Completion rate | ≥85% |
| Time to complete | ≤18 min median |
| M365 connect rate | ≥70% |
| "Aha" moment rating | ≥4.5/5 (post-onboarding micro-survey) |
| Day 2 return | ≥75% open Intelligence Center |

---

## Failure Recovery

| Failure | Response |
|---------|----------|
| Abandon mid-flow | Email: "Continue building your Executive Digital Twin" + resume link |
| M365 denied | Continue with manual meeting entry prompt on Day 2 |
| Graph build fails | Show insight from profile-only data; retry in background |

---

*Related: `INTELLIGENCE_CENTER_UX.md`, `MOTION_SYSTEM.md`, `ONBOARDING_PLAYBOOK.md` (business)*
