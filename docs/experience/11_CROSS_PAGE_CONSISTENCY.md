# 11. Cross-page Consistency Rules

**Phase 36 · Experience Alignment**  

If a screen violates these rules, it is **not** ExecutiveOS-aligned — regardless of visual polish.

---

## 11.1 Icons

| Rule | Statement |
|------|-----------|
| I-01 | One concept → one Lucide icon everywhere |
| I-02 | KPI icon = nav icon = page header icon = related card icon |
| I-03 | Registry: `@/experience/icons` (EXECUTIVE_ICONS) |
| I-04 | Do not invent emoji as primary iconography |
| I-05 | Stroke weight ~1.75; muted colour on labels |

### Canonical map

| Concept | Icon |
|---------|------|
| Today | Calendar |
| Organisation Health | Building |
| Executive Value | Gem |
| Strategic Outcomes / Strategy | Target |
| Priority Decisions / Decisions | Brain |
| Critical Risks | Shield Alert |
| Customer Health | Handshake |
| System Health | Server |
| People Health / Team | Users |
| Commercial Health | Trending Up |
| Knowledge | Book Open |
| Reports | File Text |
| Administration | Settings |
| Executive Priorities | Compass |
| Activity Feed | Activity |
| Executive Pulse | Pulse / HeartPulse |

---

## 11.2 Colours

| Rule | Statement |
|------|-----------|
| C-01 | Interface remains neutral (canvas + white surfaces) |
| C-02 | Green = positive trend only |
| C-03 | Red = negative / critical only |
| C-04 | Amber = attention required |
| C-05 | Blue = navigation / interactive |
| C-06 | Grey = neutral / meta |
| C-07 | **Never** colour entire KPI cards |
| C-08 | Never use colour as decoration or brand gradient theatre |

---

## 11.3 Motion

| Rule | Statement |
|------|-----------|
| M-01 | Continuity over animation |
| M-02 | Same page-dive between all modules |
| M-03 | Soft KPI highlight on change only |
| M-04 | Respect `prefers-reduced-motion` |
| M-05 | No celebratory confetti, bounce, or parallax |

---

## 11.4 Cards

| Rule | Statement |
|------|-----------|
| K-01 | Identical padding, radius, shadow tokens |
| K-02 | Identical hover elevation |
| K-03 | Identical focus ring |
| K-04 | One primary action |
| K-05 | Scannable in &lt;5 seconds |
| K-06 | Today Priorities: max 5 |

---

## 11.5 Headers & breadcrumbs

| Rule | Statement |
|------|-----------|
| H-01 | Module icon + title on every workspace |
| H-02 | BrandMark identity line present in shell |
| H-03 | No breadcrumbs on Today |
| H-04 | L3 breadcrumbs include L2 parent |
| H-05 | Section headers use EXS label + icon |

---

## 11.6 Tables

| Rule | Statement |
|------|-----------|
| T-01 | L2/L3 only |
| T-02 | Status via semantic tokens, not row paint |
| T-03 | One clear row action |
| T-04 | Empty states match EXS |

---

## 11.7 Status, confidence, risk, opportunity

| Concept | Consistency rule |
|---------|------------------|
| Status | Same words: Improving, Softening, Waiting, Watch, High, Healthy, Clear |
| Confidence | Always %; show when metric is judgment-grade |
| Risk | Shield Alert + amber/red; short impact line |
| Opportunity | Gem/Trending + expected impact one line |
| Executive Value | Gem + currency + trend; Reports/Value home |
| Activity | Activity icon; time + headline + Open → |

---

## 11.8 Writing style

| Rule | Statement |
|------|-----------|
| W-01 | Chief of Staff voice — confident, brief, actionable |
| W-02 | No jargon, no engineering internals |
| W-03 | Prefer verbs executives use: decide, protect, focus, contain |
| W-04 | Cut narrative ~30–40% vs essay style |
| W-05 | Every sentence helps a decision |

---

## 11.9 Navigation language

| Allowed | Forbidden |
|---------|-----------|
| Open → | View details |
| Open Strategy → | Go to strategy page |
| Open Decisions → | Manage decisions |
| Back to Command Centre (optional L3) | Home · Dashboard |

---

## 11.10 Layout inheritance

| Surface | Must inherit from Today |
|---------|-------------------------|
| Spacing rhythm | EXS space scale |
| Card system | EXS cards |
| Icon language | EXECUTIVE_ICONS |
| Semantic colour | EXS trend tokens |
| Motion | EXS page + hover |
| Brand | BrandMark |

---

## 11.11 Definition of done (any future screen)

A screen is done only when:

1. Uses EXS primitives (or thin wrappers)  
2. Uses permanent icons  
3. Answers its workspace questions  
4. Declares drills and return to Today  
5. Passes the journey QA checklist  
6. Feels like the same product as Command Centre  

---

## 11.12 Self-review (platform)

Ask before shipping any screen:

- Does ExecutiveOS feel like infrastructure rather than software?  
- Would an executive instantly recognise the product?  
- Is branding memorable?  
- Is the icon language consistent?  
- Can every card be understood in under five seconds?  
- Does every interaction reinforce trust?  
- Does every page feel part of the same platform?  
- Would this be credible from a $100M+ ARR company?  

If any answer is **No** — continue refining against this documentation.

---

## Authority

This document set (`docs/experience/*`) is the **definitive blueprint** for remaining ExecutiveOS screens.  
Today remains the Command Centre. Every other page is a dedicated workspace.

**Confidence Through Clarity.**
