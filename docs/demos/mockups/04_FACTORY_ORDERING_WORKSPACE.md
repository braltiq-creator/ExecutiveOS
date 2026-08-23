# Mockup 04 — Factory Ordering Workspace

**Type:** High-fidelity concept (documentation only)  
**Primary Domain Advisors:** Production Planning · Demand Planning · Inventory · Supply Chain · Dealer Network  
**Decision:** Recommended factory orders for the frozen window  

---

## Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Factory Ordering                                                          │
│  Finite capacity · outcome-ranked slots · capital visible                  │
├──────────────────────────────────────────────────────────────────────────┤
│  Recommended Orders                                                        │
│  • Plant 2: + Model H slots (Option B: limited overtime)                   │
│  • Defer: two long-tail variants                                           │
│  • Hold: H-XL build pending liquidation plan                               │
├───────────────────────────────┬──────────────────────────────────────────┤
│  Reasoning                    │  Financial Impact                          │
│  Finite capacity true         │  Overtime $ · Capital release $            │
│  West service protected       │  Revenue timing protection                 │
│  Mix aligned to strategy      │                                            │
├───────────────────────────────┼──────────────────────────────────────────┤
│  Risk                         │  Confidence                                │
│  A-part lead time             │  Moderate                                  │
│  Dealer communication if opaque│ ↑ if Supply Chain clears part            │
├───────────────────────────────┴──────────────────────────────────────────┤
│  Executive Council Discussion (summary)                                    │
│  CEO · CFO · COO · CRO · CSO stances (collapsed cards)                     │
├──────────────────────────────────────────────────────────────────────────┤
│  Advisor Contributions                                                     │
│  Demand │ Production │ Inventory │ Dealer │ Supply Chain                   │
│  (expand: evidence · challenge · confidence)                               │
├──────────────────────────────────────────────────────────────────────────┤
│  Expected Business Outcomes                                                │
│  Protect West fill · Reduce ageing capital · Preserve strategic mix        │
│                                                                            │
│  [Accept recommendation]  [Revise]  [Escalate to CEO judgement]             │
│  AI advises. You decide.                                                   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Block definitions

| Block | Purpose |
|-------|---------|
| **Recommended Orders** | Concrete, capacity-true actions |
| **Reasoning** | Why these orders — outcome-ranked |
| **Council Discussion** | Permanent five only |
| **Advisor Contributions** | Specialists — clearly not seats |
| **Expected Business Outcomes** | What should move |
| **Financial Impact** | CFO-legible, not a full P&L |
| **Risk** | Named, with owner path |
| **Confidence** | Band + falsifiers |

---

## Interaction principles

- Accepting a recommendation **records a decision** — does not auto-write ERP without human authority path  
- Revise returns to Demand / Inventory contexts  
- Escalate emphasises CEO enterprise judgement  

---

## Motion

1. Recommended orders settle first  
2. Advisor contributions cascade  
3. Confidence band fills last  

---

*Confidence Through Clarity.*
