# 5. Navigation Contracts

**Phase 36 · Experience Alignment**  

Contracts define **required behaviour** for entry, exit, deep links, and return. Violations are experience defects.

---

## 5.1 Global contracts

| ID | Contract |
|----|----------|
| NAV-01 | BrandMark always navigates to `/today` |
| NAV-02 | Primary nav highlights exactly one item |
| NAV-03 | Nested routes inherit the parent primary highlight |
| NAV-04 | Today never shows breadcrumbs |
| NAV-05 | L2/L3 may show breadcrumb: ExecutiveOS → Parent → Current |
| NAV-06 | Leaving Today uses EXS page dive transition |
| NAV-07 | Returning to Today restores Command Centre context (not a blank slate feel) |
| NAV-08 | Search/command palette only targets registered destinations |
| NAV-09 | Mobile bottom nav mirrors primary six |
| NAV-10 | No orphan pages without a primary or Administration family |

---

## 5.2 Entry contracts (into a workspace)

| Entry type | Required behaviour |
|------------|--------------------|
| KPI click | Land on **destination module + section** defined in KPI contracts |
| Priority Open → | Land on workspace that owns the attention item |
| Activity Open → | Land on source object/module for that event |
| Primary nav | Land on workspace root (default section) |
| Deep link | Show breadcrumb; do not strand user without Up/Today |

### Landing section rule

If a KPI defines a section (e.g. Reports → Value), the workspace **must** scroll/focus that section on entry when `?from=kpi` or equivalent contract is implemented. Until coded, document the intended section so implementation is unambiguous.

---

## 5.3 Exit contracts (from a workspace)

| Exit | Behaviour |
|------|-----------|
| BrandMark | → Today |
| Primary Today | → Today |
| Browser back | Preserve prior workspace/Today history |
| Completed decision / action | Prefer return to Today or Decisions root with confirmation toast (future) |
| L3 Up | → L2 parent, never skip to unrelated module |

---

## 5.4 Return path contract

Every outbound path from Today **must** define a return path:

```
Today → Workspace (section) → [optional L3] → Today
```

Return affordances (any one sufficient; prefer two):

1. BrandMark  
2. Primary nav Today  
3. Explicit “Back to Command Centre” on long L3 flows (optional, EXS link style)

---

## 5.5 Context preservation

| Context | Preserve across drill |
|---------|----------------------|
| Executive identity | Session / shell |
| Organisation | Session / shell |
| Outcome Health ribbon | Non-Today chrome where present |
| Origin | Soft: remember `from=today` for analytics and future “return” CTAs |
| Filters | Workspace-local; do not bleed into Today |

---

## 5.6 Forbidden navigation patterns

- Opening modal editors for L3 work on Today  
- Cross-linking to utility admin without Administration family highlight  
- Different labels for the same destination (“Value” vs “Reports” randomly)  
- Dead ends (page with no path to Today)  

---

**Next:** [Interaction Contracts](./06_INTERACTION_CONTRACTS.md)
