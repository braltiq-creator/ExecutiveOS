# 08 — Manufacturing Reality Lab Scenarios

**EIPF:** `realityLab()`  
**Purpose:** Validate manufacturing reasoning **before** customer deployment.

---

## Success measures (suite-level)

1. Every critical event produces Council opinions from all five roles  
2. Operating loop stages complete without manual bridging  
3. Recommendations name alternatives, unknowns, and cash/service trade-offs  
4. Forecast honesty beats optimism in scored judgement quality  
5. Allocation decisions cite policy, not politics alone  
6. Overtime is challenged when structural  
7. Board narrative scenarios surface exposure ranges  

---

## Failure conditions

- Pack recommends build-ahead without forecast confidence band  
- Council CRO and COO never disagree under scarcity  
- Inventory destock ignores fill-rate floor  
- Capex gate passes without milestone evidence  
- Ontology terms leak as Core entity requirements  
- Scenario completes with empty judgement artefacts  

---

## Executive questions (suite)

1. Where should scarce build slots go this month?  
2. Is inventory protecting service — or funding denial?  
3. Can we keep promises without overtime becoming strategy?  
4. Which regional forecast is no longer believable?  
5. What must the board hear about working capital this quarter?  
6. Is electrification demand a mix shift we can actually build?  
7. Which critical parts are one failure away from line-down?  

---

## Scenario library

### RL-MFG-01 — Regional demand collapse

| Field | Content |
|-------|---------|
| **Severity** | critical |
| **Event** | `mfg-evt-demand-collapse` |
| **Trigger** | Construction activity drop + dealer cancel/push spike in two regions |
| **Executive question** | Reset the plan now, or ride it out? |
| **Expected outcomes** | Forecast reset decision surfaced; inventory destock options; utilisation rebalance across plants; CFO cash path; no silent build-ahead |
| **Validation dataset** | `mfg-ds-demand-shock` |
| **Catalogue decisions** | mfg-d-06, mfg-d-03, mfg-d-01 |

### RL-MFG-02 — Demand surge / scarcity

| Field | Content |
|-------|---------|
| **Severity** | high |
| **Event** | `mfg-evt-demand-surge` |
| **Trigger** | Order bank exceeds capacity envelope for 6+ weeks |
| **Executive question** | Which dealers and models get scarce slots? |
| **Expected outcomes** | Allocation decision with policy; COO capacity truth; CSO strategy mix; CEO arbitration path |
| **Validation dataset** | `mfg-ds-scarcity` |
| **Catalogue decisions** | mfg-d-02, mfg-d-01, mfg-d-09 |

### RL-MFG-03 — Critical supplier outage

| Field | Content |
|-------|---------|
| **Severity** | critical |
| **Event** | `mfg-evt-supplier-outage` |
| **Trigger** | Single-source part OTIF collapse; line stop risk in 10 days |
| **Executive question** | Dual-source, buffer, or stop selling? |
| **Expected outcomes** | Resilience decision; cash cost of buffer; customer/dealer promise reset options; board materiality check |
| **Validation dataset** | `mfg-ds-supply` |
| **Catalogue decisions** | mfg-d-05, mfg-d-12, mfg-d-01 |

### RL-MFG-04 — Commodity spike

| Field | Content |
|-------|---------|
| **Severity** | high |
| **Event** | `mfg-evt-commodity-spike` |
| **Trigger** | Input cost +12% sustained; competitor mixed response |
| **Executive question** | Pass through, absorb, or hybrid? |
| **Expected outcomes** | Price/margin options with elasticity; volume risk from CRO; time-boxed posture |
| **Validation dataset** | `mfg-ds-cost` |
| **Catalogue decisions** | mfg-d-08 |

### RL-MFG-05 — Inventory bloat & E&O

| Field | Content |
|-------|---------|
| **Severity** | high |
| **Event** | `mfg-evt-inventory-bloat` (+ E&O spike) |
| **Trigger** | DIO above band; E&O % rising; dealer DIO swollen |
| **Executive question** | Destock how deep, how fast? |
| **Expected outcomes** | Destock vs clearance options; margin floor; factory signal protection; board narrative if material |
| **Validation dataset** | `mfg-ds-inventory` |
| **Catalogue decisions** | mfg-d-03, mfg-d-07, mfg-d-12 |

### RL-MFG-06 — Overtime spiral

| Field | Content |
|-------|---------|
| **Severity** | high |
| **Event** | `mfg-evt-overtime-spiral` |
| **Trigger** | Overtime > cap three weeks; OTTP only held via hot orders |
| **Executive question** | Reject overtime and slip, or accept structural cost? |
| **Expected outcomes** | COO challenge to OT; CFO cost; CRO promise trade-off; schedule recommit |
| **Validation dataset** | `mfg-ds-capacity` |
| **Catalogue decisions** | mfg-d-04, mfg-d-01 |

### RL-MFG-07 — Allocation conflict

| Field | Content |
|-------|---------|
| **Severity** | high |
| **Event** | `mfg-evt-allocation-conflict` |
| **Trigger** | Top strategic dealer vs high-turn dealer fighting same slots |
| **Executive question** | Whose scarcity rules win? |
| **Expected outcomes** | Policy-cited allocation; CEO path if political; share vs performance trade-off explicit |
| **Validation dataset** | `mfg-ds-scarcity` |
| **Catalogue decisions** | mfg-d-02 |

### RL-MFG-08 — Electrification mix shift

| Field | Content |
|-------|---------|
| **Severity** | high |
| **Event** | `mfg-evt-electrification-shift` |
| **Trigger** | Strategy model order bank jumps; legacy model dealers resist |
| **Executive question** | Rebalance mix and capex gates this quarter? |
| **Expected outcomes** | Mix decision with capacity proof; inventory risk on legacy; stage-gate implication |
| **Validation dataset** | `mfg-ds-strategy` |
| **Catalogue decisions** | mfg-d-09, mfg-d-10 |

### RL-MFG-09 — Line down / safety stop

| Field | Content |
|-------|---------|
| **Severity** | critical |
| **Event** | `mfg-evt-line-down` / `mfg-evt-safety-stop` |
| **Trigger** | Major line unavailable; promise breaches cascading |
| **Executive question** | Reallocate, declare channel impact, restart criteria? |
| **Expected outcomes** | Disruption huddle pack; OTTP triage; safety-first restart; board if material |
| **Validation dataset** | `mfg-ds-disruption` |
| **Catalogue decisions** | mfg-d-01, mfg-d-02, mfg-d-12 |

### RL-MFG-10 — Board inventory challenge

| Field | Content |
|-------|---------|
| **Severity** | high |
| **Event** | `mfg-evt-board-inventory` |
| **Trigger** | Board asks for inventory remediation before pack freeze |
| **Executive question** | What honest narrative and remediation do we take? |
| **Expected outcomes** | Exposure range; remediation owners; no optimistic language; CCC path |
| **Validation dataset** | `mfg-ds-governance` |
| **Catalogue decisions** | mfg-d-12, mfg-d-03 |

### RL-MFG-11 — Capacity expansion temptation

| Field | Content |
|-------|---------|
| **Severity** | moderate |
| **Event** | `mfg-evt-competitor-capacity` + high utilisation |
| **Trigger** | Competitor announces capacity; local utilisation hot |
| **Executive question** | Expand, flex, or freeze? |
| **Expected outcomes** | Scenario-based capacity posture; forecast confidence gate; stranded capital risk named |
| **Validation dataset** | `mfg-ds-capacity` |
| **Catalogue decisions** | mfg-d-11 |

### RL-MFG-12 — Normal operations baseline

| Field | Content |
|-------|---------|
| **Severity** | moderate |
| **Event** | (steady-state) |
| **Trigger** | KPIs mostly in band; minor variances |
| **Executive question** | What deserves attention when nothing is on fire? |
| **Expected outcomes** | Quiet Command Centre; Council watches not alarms; no false urgency |
| **Validation dataset** | `mfg-ds-baseline` |
| **Catalogue decisions** | none forced — preparation quality measured |

---

## Validation datasets

| ID | Label | Scenario ids | Description |
|----|-------|--------------|-------------|
| `mfg-ds-demand-shock` | Demand shocks | RL-MFG-01, RL-MFG-02 | Collapse and surge |
| `mfg-ds-scarcity` | Scarcity & allocation | RL-MFG-02, RL-MFG-07 | Slot politics |
| `mfg-ds-supply` | Supply resilience | RL-MFG-03 | Supplier failure |
| `mfg-ds-cost` | Cost shocks | RL-MFG-04 | Commodity |
| `mfg-ds-inventory` | Working capital | RL-MFG-05, RL-MFG-10 | Bloat and board |
| `mfg-ds-capacity` | Capacity stress | RL-MFG-06, RL-MFG-11 | OT and expansion |
| `mfg-ds-strategy` | Future-fit | RL-MFG-08 | Electrification |
| `mfg-ds-disruption` | Ops disruption | RL-MFG-09 | Line/safety |
| `mfg-ds-governance` | Board readiness | RL-MFG-10 | Disclosure |
| `mfg-ds-baseline` | Normal ops | RL-MFG-12 | Quiet excellence |

---

## Expected outcome registry (EIPF shape)

Each scenario above contributes an `expectedOutcomes[]` entry:

```
{ scenarioId, expectation }
```

Pack authors must keep expectations testable (artefacts present / behaviours exhibited), not vague aspirations.
