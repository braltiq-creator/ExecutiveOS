# 6. Interaction Contracts

**Phase 36 · Experience Alignment**  

---

## 6.1 Principles

1. **One question per component**  
2. **One primary click per component**  
3. **Motion communicates continuity**, never theatre  
4. **Colour communicates meaning**, never decoration  
5. **Trust > delight** — restraint wins  

---

## 6.2 Click contracts

| Element | Click behaviour |
|---------|-----------------|
| KPI card | Navigate to destination module/section |
| Priority card header Open → | Navigate to owning workspace |
| Activity row | Navigate to source module/object |
| Primary nav item | Navigate to workspace root |
| BrandMark | Navigate to Today |
| Table row (L2/L3) | Open detail or expand per workspace pattern |
| Destructive admin action | Confirm; never one-click destroy |

### CTA language

| Context | Label |
|---------|-------|
| Priorities / Feed | `Open →` |
| Named module CTA | `Open Strategy →` · `Open Decisions →` · `Open Knowledge →` · `Open Reports →` · `Open Administration →` |
| Forbidden | View details · Learn more · Click here · See more |

---

## 6.3 Hover contracts

| Element | Hover |
|---------|-------|
| EXS card | Gentle elevation (`translateY(-1px)` + shadow-2); border slightly stronger |
| Nav item | Quiet highlight; no colour wash |
| Links | Underline or accent intensify (blue/nav token) |
| Disabled | No elevation; cursor not-allowed |

---

## 6.4 Focus contracts

| Element | Focus |
|---------|-------|
| Interactive card / link | Visible ring using nav/accent token |
| Skip link | Standard accessible focus |
| Keyboard | Full operability for nav, KPIs, Priorities, Feed |

---

## 6.5 Loading contracts

| Surface | Loading |
|---------|---------|
| Today first paint | “Preparing your Executive Brief” sequence retained |
| After prepare | Stagger: Header → KPIs → Pulse → Priorities → Feed |
| Workspace | Elegant EXS skeletons — same radius/spacing as cards |
| Forbidden | Spinners as primary metaphor; layout jump |

---

## 6.6 Live / update contracts

| Event | Behaviour |
|-------|-----------|
| KPI value change | Soft value flash; trend arrow updates; timestamp refresh |
| Activity | Newest first; Live indicator pulse (subtle) |
| Pulse confidence | Updates with source confidence — no fake jitter |
| Reduced motion | Disable non-essential animation |

---

## 6.7 Page transition contracts

| Transition | Behaviour |
|------------|-----------|
| Module change | EXS page dive (subtle scale/opacity) |
| Today → Workspace | Feel of diving deeper |
| Workspace → Today | Feel of returning to control room |
| Forbidden | Hard cuts, full-screen page wipes, playful bounce |

---

## 6.8 Scroll contracts

| Surface | Scroll |
|---------|--------|
| Today | **No page scroll** in normal laptop use; Activity Feed independent scroll only |
| Workspaces | Page may scroll; prefer one-viewport summary + scroll for tables |
| Modals/dialogs | Trap focus; body scroll lock |

---

## 6.9 Empty & error contracts

| State | Behaviour |
|-------|-----------|
| Empty Priority | Honest empty — “No priorities elevated” + path to Strategy/Decisions |
| Empty Feed | “No overnight movement” — calm, not alarming |
| Error | EXS error state; retry where safe; never expose internals |
| Partial data | Show confidence; do not invent certainty |

---

**Next:** [Drill-down Architecture](./07_DRILL_DOWN_ARCHITECTURE.md)
