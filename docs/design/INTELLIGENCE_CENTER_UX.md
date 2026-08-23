# Executive Intelligence Center — UX Specification

## Purpose

The Intelligence Center (`/dashboard`) is the **product**. Every other module feeds it. The experience must feel like opening a sealed morning brief from a trusted Chief of Staff — not a SaaS dashboard.

---

## Information Hierarchy (Data Priority)

| Priority | Content | Source |
|----------|---------|--------|
| P0 | Critical attention items | Health, initiatives, calendar conflicts, billing |
| P1 | Top priority insight (single hero) | Prioritization engine |
| P2 | Active digest (time-aware) | Morning / lunch / EOD / weekly |
| P3 | Advisor summaries (top 3) | Multi-agent framework |
| P4 | Category cards (grouped) | 9 executive card types |
| P5 | Executive timeline | Calendar, decisions, initiatives |
| P6 | Health score + metrics strip | Portfolio health |

**Rule:** P0–P2 above the fold on 1440×900. P3–P4 visible with minimal scroll.

---

## Visual Hierarchy (Layout Grid)

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: Greeting + Health/Insights metrics + "Ask Advisors" │
├─────────────────────────────────────────────────────────────┤
│ DIGEST PANEL: Time-aware brief + digest switcher            │
├─────────────────────────────────────────────────────────────┤
│ PRIORITY STRIP (Ink 900): #1 insight + score + 2–3 sub      │
├──────────────────────────────┬──────────────────────────────┤
│ ADVISOR SUMMARIES (3 cards)  │ HEALTH + DECISION QUEUE      │
├──────────────────────────────┴──────────────────────────────┤
│ EXECUTIVE CARDS (2-col grid, grouped by category)           │
├─────────────────────────────────────────────────────────────┤
│ TIMELINE (tabbed: Today | This Week | Next Week)            │
└─────────────────────────────────────────────────────────────┘
```

**Desktop:** 12-column grid, 24px gutter, max-width 1152px  
**Tablet:** Single column; priority strip full-width  
**Mobile:** Bottom nav; digest collapses to summary line

---

## Hero Section

**Not a marketing hero.** An executive greeting block.

| Element | Specification |
|---------|---------------|
| Overline | `EXECUTIVE INTELLIGENCE CENTER` — 11px, tracking 0.18em, Slate 500 |
| Greeting | "Good morning, Alex" — h1, Ink 900, preferred name always |
| Subline | Job title · Company — body-sm, Slate 600 |
| Metrics | 3 compact metric tiles: Health score, Insight count, Plan name |
| Primary CTA | "Ask Advisors" — secondary to reading intelligence first |
| Meta | "Intelligence refreshed [time]" — caption, Slate 400 |

**No:** Stock photography, animated gradients, chat input in hero.

---

## Priority Strip (P0/P1)

**Visual:** Full-width Ink 900 (`#0F1419`) panel, white text — the "briefing moment."

| Element | Spec |
|---------|------|
| Label | `PRIORITY INTELLIGENCE` — overline, zinc-400 |
| Headline | Top insight title — 18–20px semibold white |
| Summary | 2 lines max — 14px zinc-300 |
| Score | Large mono number — top-right, white pill on zinc-800 |
| Sub-insights | Up to 3 compact tiles — category + title + score |

**Interaction:** Entire strip clickable → relevant module. Sub-tiles independent links.

**Animation:** Fade-in 300ms on load; score counts up 0→N in 400ms (respect reduced motion).

---

## Priority Cards (Executive Cards)

| Property | Specification |
|----------|---------------|
| Layout | 2-column grid desktop; 1-column mobile |
| Card | White surface, Slate 200 border, radius-lg, elevation-1 |
| Header | Category overline + priority score badge (Ink 900 pill) |
| Title | h3, max 2 lines |
| Body | 3 lines max; truncate with expand |
| Badge | Semantic color only (critical/warning/success) |
| Footer | Single text link: "Review →" or module-specific action |

**Category order on page:**
1. Critical Attention
2. Recommended Decisions
3. Upcoming Risks
4. Meeting Preparation
5. Strategic Opportunities
6. Remaining categories (collapsed "Show 4 more" if >8 total)

---

## Advisor Panel

**Desktop:** Row of 3 advisor summary cards above card grid  
**Content per card:** Accent dot + name + 2-line insight + confidence % + link to `/advisors`

**Interaction:** Click → `/advisors` with that advisor pre-selected

**Never:** Full advisor chat embedded in dashboard (focus distraction).

---

## Timeline

| Property | Spec |
|----------|------|
| Position | Below cards — rhythm, not priority |
| Tabs | Yesterday · Today · This Week · Next Week |
| Row | Time (fixed width) + type pill + title + summary |
| Empty | "Your timeline populates as calendar and initiatives connect." |
| Interaction | Click row → relevant module |

---

## Health Score

| Property | Spec |
|----------|------|
| Display | Metric tile in header + optional expanded in side panel |
| Format | `72` large mono + `/100` small + trend arrow |
| Color | ≥70 green, 50–69 amber, <50 red (text only, not background) |
| Drill-down | Click → initiatives filtered by health |

---

## Decision Queue

**Side panel (desktop) or below health (mobile):**

- Max 5 pending decisions
- Sorted by review date urgency
- Each row: title + status badge + days until review
- CTA: "Review decisions →" → `/decisions`

**Empty:** "No pending decisions. Log one to track executive judgment."

---

## Quick Actions

Floating action bar — **not FAB**. Subtle bar below header on scroll:

| Action | Icon | Destination |
|--------|------|-------------|
| Log decision | + | `/decisions` new |
| Ask advisor | ◎ | `/advisors` |
| View graph | ◉ | `/graph` |
| Sync calendar | ↻ | Trigger M365 sync |

Maximum 4 actions. Hidden on initial load; appears on scroll up.

---

## Empty States (First-Time)

| Section | Empty state |
|---------|-------------|
| Intelligence Center | Concierge onboarding redirect — not empty dashboard |
| Priority strip | "Complete onboarding to receive your first intelligence briefing." |
| Cards | Illustration (Meridian mark) + "Your first insights appear after objectives and initiatives are set." |
| Timeline | Connection prompt for M365 |
| Advisors | "Advisors activate once executive context is established." |

---

## Loading States

| Section | Loading pattern |
|---------|-----------------|
| Full page | Skeleton matching layout — not spinner |
| Priority strip | Shimmer bar Ink 800 → pulse once |
| Cards | 3 skeleton cards, stagger 50ms |
| Timeline | 4 skeleton rows |
| Refresh | Inline spinner in "Intelligence refreshed" meta line |

**Target:** Meaningful content (skeleton) within 200ms; real data within 2s.

---

## Animations

See `MOTION_SYSTEM.md`. Intelligence Center specific:

- Page enter: 200ms fade
- Priority strip: score count-up
- New insight (refresh): subtle highlight flash 400ms on changed cards
- Digest switch: crossfade 200ms

---

## First-Time Experience

1. Land from concierge onboarding (not raw dashboard)
2. See pre-populated insight from onboarding data
3. Priority strip shows first real scored item
4. Tooltip once: "This is your Intelligence Center — refreshed continuously."
5. No feature tour carousel

---

## Returning Executive Experience

1. Greeting with correct time-of-day
2. Digest auto-selected (morning/lunch/EOD/weekly)
3. **Changes since last visit** — subtle "3 new" badge on priority strip if insights changed
4. Last viewed timestamp in meta
5. Scroll position not preserved (always top — fresh brief ritual)

---

## Success Metrics (UX)

| Metric | Target |
|--------|--------|
| Time to first insight | <2s after skeleton |
| Scroll depth | ≥60% reach timeline |
| Card click-through | ≥30% of visible cards |
| Return within 24h | ≥70% of active execs |

---

*Related: `CONCIERGE_ONBOARDING.md`, `COMPONENT_GUIDELINES.md`, `MOTION_SYSTEM.md`*
