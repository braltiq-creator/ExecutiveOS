# 10 — Manufacturing Reasoning Rules

**EIPF:** `reasoningRules()` (+ decision frameworks)  
**Rule:** Rules teach judgement; they do not hard-code ERP workflows.

---

## Decision frameworks (pack-level)

### DF-01 — Scarcity arbitration

**Applies to outcomes:** dealer, share, lead-time, utilisation  
**Steps:**

1. Quantify scarce build slots vs order bank  
2. Apply published allocation policy  
3. Overlay strategy mix constraints  
4. Surface dealer performance exceptions with expiry  
5. CEO arbitrate residual politics  

**Escalation triggers:** Policy override requested; two strategic dealers conflict; OTTP breach cluster

---

### DF-02 — Working capital posture

**Applies to:** inventory, working capital, margin  
**Steps:**

1. Separate service-critical stock from discretionary build  
2. State forecast confidence band  
3. Choose build / hold / destock / clearance  
4. Set margin floor and time box  
5. Assign review trigger (KPI or date)

**Escalation triggers:** E&O % above threshold; CCC breach; board question

---

### DF-03 — Capacity honesty

**Applies to:** utilisation, lead-time, margin  
**Steps:**

1. State demonstrated capacity envelope  
2. Compare promises and order bank  
3. Prefer re-promise / reallocate before overtime  
4. If overtime, attach expiry and quality watch  
5. Recur → convert to capacity decision (expand/flex/freeze)

**Escalation triggers:** Overtime above cap 3 weeks; quality escape with OT; frozen-window thrash

---

### DF-04 — Transformation stage gate

**Applies to:** future-fit, working capital  
**Steps:**

1. Evidence pack required (milestones, pilot metrics)  
2. Ops readiness (COO)  
3. Capital readiness (CFO)  
4. Strategy still true (CSO)  
5. Fail closed on missing evidence  

**Escalation triggers:** Spend continues after missed gate; ROI variance unexplained

---

## Reasoning rules catalogue

| ID | Title | Description | Evaluate key | Related outcomes | Ontology |
|----|-------|-------------|--------------|------------------|----------|
| `mfg-rr-01` | No build on bad forecast | Block aggressive build-ahead when forecast bias/WAPE outside band without CFO+CRO joint note | `no_build_on_bad_forecast` | forecast, inventory, working capital | Order Bank, Forecast |
| `mfg-rr-02` | Overtime is not capacity | Flag overtime as exception; recurrent OT must open capacity decision | `overtime_not_capacity` | utilisation, margin, lead-time | Capacity Envelope, Build Slot |
| `mfg-rr-03` | Allocation needs policy | Scarcity recommendations must cite allocation rules | `allocation_needs_policy` | dealer, share | Allocation, Dealer |
| `mfg-rr-04` | Service floor on destock | Destock options must preserve A-class fill-rate floor | `service_floor_destock` | inventory, dealer | Inventory, Safety Stock |
| `mfg-rr-05` | Dual-source critical path | Single-source critical parts require resilience option set | `dual_source_critical` | supply-resilience | Part, Supplier |
| `mfg-rr-06` | Clearance has margin floor | Incentives/clearance require margin floor + factory signal protection | `clearance_margin_floor` | margin, dealer, inventory | Dealer, Model |
| `mfg-rr-07` | Mix needs capacity proof | Strategy mix shifts must be manufacturable on named lines | `mix_needs_capacity` | share, utilisation, future-fit | Model, Line, Build Slot |
| `mfg-rr-08` | Commodity posture time-boxed | Price absorb/pass decisions require explicit end date/review | `commodity_timebox` | margin, share | Commodity |
| `mfg-rr-09` | Board honesty on inventory | Material CCC/E&O exposure must offer board narrative option | `board_honesty_inventory` | working capital | Working Capital, E&O |
| `mfg-rr-10` | Gate fails closed | Transformation capital cannot recommend “advance” without milestone evidence | `gate_fails_closed` | future-fit | Automation, Electrification |
| `mfg-rr-11` | Sell-out over sell-in | Prefer dealer sell-out signals over factory sell-in when they diverge | `sellout_over_sellin` | forecast, dealer | Dealer, Order Bank |
| `mfg-rr-12` | Construction as leading indicator | Regional resets should consider construction activity when relevant | `construction_leading` | forecast, dealer | Construction Activity, Region |

---

## Recommendation quality pattern

Every manufacturing recommendation narrative should answer:

1. **What changed** (event / KPI breach)  
2. **Why it matters** (outcomes)  
3. **Options** (≥2)  
4. **Cash vs service vs share trade-off**  
5. **Who will disagree** (Council role)  
6. **Review trigger**

---

## Anti-patterns (reasoning must reject)

- “Maximise utilisation” without margin/quality  
- “Hit the forecast” by stuffing dealers  
- “Protect share” via undisciplined discounting  
- “Transform” without gates  
- “Be resilient” by infinite inventory  
