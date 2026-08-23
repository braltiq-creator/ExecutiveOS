# ExecutiveOS Design Principles

## The Three Questions

Every screen must answer — in order, within 3 seconds of scanning:

1. **What requires my attention?**
2. **Why?**
3. **What should I do?**

If a design element does not serve one of these three questions, remove it.

---

## Core Principles

### 1. Less but Better (Dieter Rams, applied to executives)

Remove until removing hurts. Executives don't need more data — they need the *right* data.

**In practice:**
- Maximum 6 priority cards above the fold on Intelligence Center
- One primary action per card
- No sidebar widgets "just because we have the data"

### 2. Executive Clarity

Assume the user is reading on an iPhone between meetings. Headlines must stand alone.

**In practice:**
- Card title = complete thought ("Initiative Alpha at risk" not "Alpha")
- Scores always include context ("62/100 portfolio health" not "62")
- Dates always absolute + relative ("Today, 2:00 PM · in 45 min")

### 3. Information Hierarchy Before Layout

Structure content by importance, then design layout — never the reverse.

**Hierarchy order (Intelligence Center):**
1. Critical attention (must act today)
2. Today's rhythm (calendar, timeline)
3. Strategic context (initiatives, objectives)
4. Advisory depth (advisors, graph)
5. Administrative (settings, billing)

### 4. Progressive Disclosure

Show summary → offer depth. Never dump the graph on first view.

**In practice:**
- Card shows headline + one-line why
- "View analysis" expands advisor reasoning
- Graph defaults to subgraph, not full mesh

### 5. Data Before Decoration

Every visual element must encode information. Decoration is permitted only in marketing.

**In practice:**
- Priority score badge = real computed number
- Color = semantic (not brand rainbow)
- Icons = category identification, not illustration

### 6. Confidence Through Whitespace

Whitespace signals control. Dense UI signals chaos — the opposite of executive calm.

**In practice:**
- Minimum 32px between major sections
- Card internal padding minimum 20px
- Never less than 16px between stacked cards

### 7. Motion with Purpose

Animation explains change — it never entertains. See `MOTION_SYSTEM.md`.

### 8. Accessibility First

If it's not accessible, it's not executive-grade. WCAG AA minimum; AAA for body text.

### 9. Decision-First Design

Artifacts exist to support judgment: decisions, recommendations, trade-offs.

**In practice:**
- Empty decision register prompts first decision, not feature tour
- Advisor responses lead with recommendation, not process description
- Buttons say "Review decision" not "Learn more"

### 10. Trust Before Delight

Executives forgive blandness. They do not forgive wrong intelligence.

**In practice:**
- Show data sources when confidence is below threshold
- Never animate fake "thinking" longer than actual processing
- Errors state what happened and what to do — never blame

---

## Anti-Patterns (Never Ship)

| Anti-pattern | Why it fails |
|--------------|--------------|
| Dashboard of 20 equal widgets | No hierarchy; executive paralysis |
| Chat-first landing | Reactive; contradicts proactive promise |
| Pulsing red badges everywhere | Crying wolf; anxiety |
| AI sparkle icons | Commodity AI aesthetic; erodes trust |
| Gamification (streaks, points) | Infantilizes leadership |
| Jargon-heavy empty states | Blocks activation |
| Auto-playing video | Disrespects attention |
| Hamburger menu for primary nav | Hides core executive workflows |

---

## Decision Framework for Designers

When evaluating any design:

```
1. Does it answer What / Why / What to do?
2. Can it be removed without losing meaning?
3. Does it feel calm at 7am on a phone?
4. Would a Fortune 500 CEO show this in a board prep session?
5. Does it meet WCAG AA?
```

Five yes → ship. Any no → revise.

---

*Related: `UX_PRINCIPLES.md`, `INTELLIGENCE_CENTER_UX.md`, `EXECUTIVEOS_DESIGN_BIBLE.md`*
