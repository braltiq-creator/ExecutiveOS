# 10. Component Standards

**Phase 36 · Experience Alignment**  
**Code home:** `src/experience/exs/` · Today is the reference implementation  

Future pages **inherit** these components. Do not invent parallel card/header systems.

---

## 10.1 Foundation

| Primitive | Role |
|-----------|------|
| `BrandMark` | Product identity in shell |
| `.exs-card` | Base surface + hover/focus/active |
| `ExsKpiCard` | Metric gateway |
| `ExsPriorityCard` | Attention item |
| `ExsOpenLink` | Standard drill CTA |
| `ExsTrend` | Semantic movement mark |
| `ExsSectionHeader` | Section label + optional icon |
| `ExsPageTransition` | Module dive continuity |
| EXS tokens (`tokens.css`) | Colour, space, type, motion |

---

## 10.2 Typography

| Role | Class / token | Rules |
|------|---------------|-------|
| Display | `ex-display` / workspace hero | Rare; workspace title only |
| Title | `exs-title` | Card headlines, section titles |
| Value | `exs-value` | Large numbers; tabular nums |
| Body | `exs-body` | One–two lines max on L1 |
| Label | `exs-label` | Short; **minimal uppercase** |

**Copy density:** Every card understandable in **&lt;5 seconds**.

---

## 10.3 Cards

### KPI card structure

```
[Icon]                    [timestamp]
Label
Primary Value
[Trend] Status            Confidence%
```

- Entire card clickable  
- Neutral surface — **never** colour-wash the card  
- Identical padding via `--exs-card-pad`

### Priority card structure

```
[Icon] Headline                    Open →
Summary (one line)
Business impact (one line)
```

- Action always in header — never below the fold  
- Max **five** on Today  

### Workspace cards

Same EXS base. May add secondary meta, but keep scan structure.

---

## 10.4 Headers

| Header | Standard |
|--------|----------|
| Shell page title | Module icon + title |
| Today mission header | “Executive Command Centre” label · greeting · health |
| Section | `ExsSectionHeader` with permanent icon |
| Breadcrumb | L2/L3 only |

---

## 10.5 Buttons & links

| Type | Use |
|------|-----|
| Ghost / quiet | Shell Search, secondary |
| Accent text link | `Open →` family |
| Primary button | Rare — commit actions in L2/L3 only |
| Forbidden on Today | Multi-button toolbars, pill clusters |

---

## 10.6 Tables

| Rule | Standard |
|------|----------|
| Where | L2/L3 only — never Today |
| Density | Calm row height; one primary action per row |
| Status | Semantic badge / trend — not row colour floods |
| Empty | EXS empty state |
| Sort/filter | Allowed; preserve clarity |

---

## 10.7 Status badges

| Tone | Meaning |
|------|---------|
| Positive / green | On track, improving |
| Attention / amber | Watching, waiting |
| Critical / red | At risk, overdue, high risk |
| Neutral / grey | Steady, informational |
| Nav / blue | Interactive affordance only |

Badges label **state**; they do not decorate.

---

## 10.8 Confidence

| Rule | Standard |
|------|----------|
| Display | Percentage near metric or Pulse “Overall Confidence” |
| Visual | Quiet meta — not a hero bar on Today KPIs |
| Honesty | Lower confidence → more caution in copy |
| Forbidden | Fake precision; hiding confidence when low |

---

## 10.9 Risk & opportunity

| Concept | Visual | Language |
|---------|--------|----------|
| Risk | Shield Alert · red/amber trend | Brief impact; judgment CTA |
| Opportunity | Gem / Trending Up · green when positive | Expected impact one line |
| Placement | Priority cards + workspace; not long essays on Today |

---

## 10.10 Executive Value

| Rule | Standard |
|------|----------|
| Icon | Gem |
| Today | KPI → Reports (Value section) |
| Deep | `/value` inherits EXS |
| Display | Currency + trend + confidence |

---

## 10.11 Activity

| Rule | Standard |
|------|----------|
| Icon | Activity |
| Today | Sole scrolling region |
| Row | Time · headline · `Open →` |
| Order | Newest first |
| Live | Subtle indicator — not theatrical |

---

## 10.12 Executive Pulse

| Rule | Standard |
|------|----------|
| Icon | HeartPulse / Pulse |
| Placement | Permanent beneath KPI bar |
| Content | Headline + ≤4 signals + Overall Confidence |
| Role | First orientation after KPI scan |

---

## 10.13 Loading & skeletons

Match card radius and spacing. Prefer skeleton blocks over spinners. Today retains preparing sequence before EXS reveal stagger.

---

## 10.14 Motion

| Pattern | Use |
|---------|-----|
| Reveal stagger | Enter Today / workspace |
| KPI flash | Value change |
| Card hover elevation | Afford clickability |
| Page dive | Cross-module navigation |
| Reduced motion | Honour OS preference |

---

**Next:** [Cross-page Consistency Rules](./11_CROSS_PAGE_CONSISTENCY.md)
