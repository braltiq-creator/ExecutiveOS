# 03 — Manufacturing Decision Catalogue

**EIPF:** informs `decisionFrameworks()`, recommendation templates, Reality Lab questions, and future Decision objects  
**Rule:** Every decision links to ≥1 Focus Outcome. No standalone manufacturing theatre.

---

## Catalogue index

| ID | Decision | Primary owner | Primary outcomes |
|----|----------|---------------|------------------|
| `mfg-d-01` | Commit next frozen-window factory schedule | COO | utilisation, forecast, lead-time |
| `mfg-d-02` | Allocate scarce build slots across dealers/regions | CRO / COO | dealer, share, lead-time |
| `mfg-d-03` | Set inventory build / destock posture | CFO / COO | inventory, working capital |
| `mfg-d-04` | Accept or reject overtime to hit promise dates | COO / CFO | utilisation, margin, lead-time |
| `mfg-d-05` | Dual-source or buffer a critical part | COO / CFO | supply-resilience, working capital |
| `mfg-d-06` | Reset regional demand forecast mid-cycle | CRO / CFO | forecast, inventory, utilisation |
| `mfg-d-07` | Approve dealer incentive / clearance programme | CRO / CFO | dealer, margin, inventory |
| `mfg-d-08` | Reprice or absorb commodity shock | CFO / CSO | margin, working capital, share |
| `mfg-d-09` | Shift mix toward / away from strategic models | CSO / CRO | share, margin, future-fit |
| `mfg-d-10` | Gate automation / electrification capex stage | CSO / CFO | future-fit, working capital |
| `mfg-d-11` | Open or freeze a factory capacity expansion | CEO / COO / CFO | utilisation, future-fit, working capital |
| `mfg-d-12` | Escalate board narrative on supply or inventory risk | CEO / CSO / CFO | working capital, supply-resilience |

---

## Decision definitions

### mfg-d-01 — Commit next frozen-window factory schedule

| Field | Definition |
|-------|------------|
| **Purpose** | Lock the near-term build plan so factories, suppliers, and dealers can execute without thrash. |
| **Inputs** | Order bank, capacity envelope, frozen-window policy, material availability, labour roster, prior schedule adherence |
| **Leading indicators** | Schedule stability score; material constraint flags; dealer order-bank coverage days |
| **Lagging indicators** | OTTP; overtime %; expedite rate; utilisation vs plan |
| **Confidence** | High only when forecast bias in band and critical parts OTIF ≥ threshold; else explicit low confidence |
| **Evidence** | APS/MES schedule diff; supplier OTIF; order-bank aging; last frozen-window breach log |
| **Council participation** | COO recommend; CRO challenge demand truth; CFO challenge overtime/cash; CEO break if plants conflict; CSO watch strategic mix |
| **Expected outcome** | Stable frozen window; fewer expedites; utilisation inside band |
| **Success measures** | Frozen-window change rate ↓; OTTP ↑; overtime within cap |

---

### mfg-d-02 — Allocate scarce build slots across dealers/regions

| Field | Definition |
|-------|------------|
| **Purpose** | Assign scarce capacity fairly and strategically when demand exceeds supply. |
| **Inputs** | Available build slots, dealer performance scores, strategic account list, regional share goals, current dealer inventory |
| **Leading indicators** | Slot scarcity index; dealer fill-rate gap; strategic account backorder age |
| **Lagging indicators** | Dealer turn; lost sales; segment share; complaint volume |
| **Confidence** | Requires transparent allocation rules; confidence falls if rules overridden without CEO note |
| **Evidence** | Allocation policy; dealer scorecards; order-bank by dealer; inventory by dealer |
| **Council participation** | CRO propose; COO confirm manufacturability; CSO align to share strategy; CFO note working-capital impact; CEO arbitrate political conflict |
| **Expected outcome** | Scarcity allocated to strategy + performance; channel conflict contained |
| **Success measures** | Strategic fill rate ↑; weak-dealer overstock ↓; escalation count ↓ |

---

### mfg-d-03 — Set inventory build / destock posture

| Field | Definition |
|-------|------------|
| **Purpose** | Decide whether to build ahead, hold, or destock across FG/WIP/parts. |
| **Inputs** | Forecast, DIO by class, E&O aging, cash plan, seasonality, dealer inventory |
| **Leading indicators** | Forecast bias; weeks of cover vs target; E&O creation rate |
| **Lagging indicators** | CCC; inventory $; stockout rate; write-offs |
| **Confidence** | Medium when forecast WAPE elevated — posture must be staged |
| **Evidence** | Inventory class dashboards; cash forecast; destock playbooks; prior write-off history |
| **Council participation** | CFO own cash frame; COO own service risk; CRO own dealer impact; CEO set enterprise posture |
| **Expected outcome** | Intentional inventory trajectory with service floor protected |
| **Success measures** | DIO into band; E&O % ↓; fill rate held |

---

### mfg-d-04 — Accept or reject overtime to hit promise dates

| Field | Definition |
|-------|------------|
| **Purpose** | Choose whether overtime is justified to protect lead-time promises. |
| **Inputs** | Promise breaches at risk, overtime premium, quality escape history, alternative slot moves |
| **Leading indicators** | Hot-order queue; labour fatigue markers; quality first-pass yield trend |
| **Lagging indicators** | Overtime cost; contribution margin; warranty/rework; OTTP |
| **Confidence** | Low if overtime is recurrent rather than exceptional |
| **Evidence** | Cost model; quality trend; customer/dealer criticality; alternate allocation options |
| **Council participation** | COO recommend; CFO cost challenge; CRO customer criticality; CEO if pattern becomes structural |
| **Expected outcome** | Overtime used as exception with expiry, not as capacity strategy |
| **Success measures** | Overtime % of hours ↓ over quarter; OTTP maintained on critical orders |

---

### mfg-d-05 — Dual-source or buffer a critical part

| Field | Definition |
|-------|------------|
| **Purpose** | Reduce single-source disruption risk with dual source and/or intentional buffer. |
| **Inputs** | Part criticality, supplier concentration, lead time, buffer cost, qualification time |
| **Leading indicators** | Supplier risk score; incoming defect rate; geopolitical/commodity alerts |
| **Lagging indicators** | Line stoppages; recovery days; expedite freight; buffer $ |
| **Confidence** | Requires true criticality ranking — not all parts deserve dual source |
| **Evidence** | BOM criticality; supplier OTIF; dual-source qualification plan; cash impact |
| **Council participation** | COO propose; CFO fund/buffer challenge; CSO strategic supplier view; CEO if board-visible concentration |
| **Expected outcome** | Critical path resilience improved with known cash cost |
| **Success measures** | Dual-source/buffer coverage on critical parts ↑; unplanned stops ↓ |

---

### mfg-d-06 — Reset regional demand forecast mid-cycle

| Field | Definition |
|-------|------------|
| **Purpose** | Correct a materially wrong demand plan before factories and inventory compound the error. |
| **Inputs** | Dealer sell-out, construction activity, commodity signals, order-bank trajectory, prior bias |
| **Leading indicators** | Forecast bias trend; dealer inventory days; cancel/push rates |
| **Lagging indicators** | WAPE; schedule churn; E&O; lost sales |
| **Confidence** | State confidence band explicitly; do not reset on anecdote alone |
| **Evidence** | Regional sell-out; macro construction index; CRM/dealer pipeline; statistical forecast residual |
| **Council participation** | CRO own reset; CFO challenge cash/inventory; COO challenge schedule feasibility; CSO market narrative; CEO if board forecast committed |
| **Expected outcome** | Shared demand truth; schedule and inventory posture realigned |
| **Success measures** | Bias returns to band within 2 cycles; schedule stability recovers |

---

### mfg-d-07 — Approve dealer incentive / clearance programme

| Field | Definition |
|-------|------------|
| **Purpose** | Clear channel inventory or stimulate retail without destroying margin and factory signal. |
| **Inputs** | Dealer DIO, aging stock, margin floor, factory build commitments, prior programme ROI |
| **Leading indicators** | Aging weeks; dealer distress signals; competitive promotions |
| **Lagging indicators** | Sell-through; margin leakage; factory pull-forward hangover |
| **Confidence** | High only with exit criteria and factory signal protection |
| **Evidence** | SKU aging; contribution by model; prior clearance postmortems |
| **Council participation** | CRO propose; CFO margin gate; COO factory signal; CSO brand/position risk; CEO if national programme |
| **Expected outcome** | Targeted clearance with margin floor and no false demand spike |
| **Success measures** | Aged stock ↓; margin above floor; no subsequent E&O rebound |

---

### mfg-d-08 — Reprice or absorb commodity shock

| Field | Definition |
|-------|------------|
| **Purpose** | Decide price pass-through vs absorption when commodities move materially. |
| **Inputs** | Commodity curves, contract terms, competitive pricing, margin bridge, dealer elasticity |
| **Leading indicators** | Commodity spot/forward move; supplier surcharges; competitor price actions |
| **Lagging indicators** | Contribution margin; volume; share; working capital |
| **Confidence** | Scenario-based; present absorb / pass / hybrid options |
| **Evidence** | Margin bridge; elasticity history; competitor intel; hedge position |
| **Council participation** | CFO frame economics; CRO volume risk; CSO positioning; COO cost-to-serve; CEO final posture |
| **Expected outcome** | Explicit price/margin posture with time box |
| **Success measures** | Margin defended within policy; volume loss within plan |

---

### mfg-d-09 — Shift mix toward / away from strategic models

| Field | Definition |
|-------|------------|
| **Purpose** | Use allocation and incentives to move mix toward strategy without breaking factories. |
| **Inputs** | Strategy model list, capacity by line, dealer appetite, margin by model, electrification roadmap |
| **Leading indicators** | Mix vs strategy gap; build-slot requests by model; dealer resistance |
| **Lagging indicators** | Segment share; margin; transformation milestones |
| **Confidence** | Requires capacity proof — strategy models must be buildable |
| **Evidence** | Mix dashboards; line constraints; CSO roadmap; dealer feedback |
| **Council participation** | CSO set intent; CRO gate commercial reality; COO capacity; CFO margin/cash; CEO portfolio call |
| **Expected outcome** | Deliberate mix shift with capacity and cash feasibility |
| **Success measures** | Strategy mix % ↑; no chronic expedite on strategy models |

---

### mfg-d-10 — Gate automation / electrification capex stage

| Field | Definition |
|-------|------------|
| **Purpose** | Advance, hold, or kill transformation capex at stage gates. |
| **Inputs** | Business case, milestone evidence, risk register, cash plan, operational readiness |
| **Leading indicators** | Milestone slip; pilot OEE; integration defect rate |
| **Lagging indicators** | ROI vs plan; labour productivity; quality; safety |
| **Confidence** | Gate fails closed on missing evidence |
| **Evidence** | Stage-gate pack; pilot metrics; contingency cost; board prior commitments |
| **Council participation** | CSO sponsor; CFO capital gate; COO operational readiness; CEO board alignment |
| **Expected outcome** | Capital released only when evidence clears gate |
| **Success measures** | Gate compliance 100%; ROI variance explained |

---

### mfg-d-11 — Open or freeze factory capacity expansion

| Field | Definition |
|-------|------------|
| **Purpose** | Decide whether to add capacity or freeze expansion under demand uncertainty. |
| **Inputs** | Long-range demand, utilisation trajectory, capex, lead time to capacity, regional strategy |
| **Leading indicators** | Sustained utilisation above envelope; deferred demand; competitor capacity moves |
| **Lagging indicators** | ROIC; utilisation after expansion; stranded capital risk |
| **Confidence** | Low if forecast accuracy historically poor — prefer flexible capacity |
| **Evidence** | LRP scenarios; plant OEE; capital model; alternative outsourcing options |
| **Council participation** | CEO own; COO capacity truth; CFO capital; CRO/CSO demand/strategy |
| **Expected outcome** | Capacity posture matched to credible demand scenarios |
| **Success measures** | No stranded capacity within 24 months; service levels held |

---

### mfg-d-12 — Escalate board narrative on supply or inventory risk

| Field | Definition |
|-------|------------|
| **Purpose** | Decide whether inventory, supply, or overtime risk is board-material now. |
| **Inputs** | Risk register, cash exposure, customer impact, prior board language, legal/disclosure constraints |
| **Leading indicators** | CCC breach; single-source alert; material OTTP miss cluster |
| **Lagging indicators** | Board questions; write-offs; customer claims |
| **Confidence** | Prefer honest early language over late surprise |
| **Evidence** | Exposure quant; scenario range; mitigation plan; draft disclosure |
| **Council participation** | CSO/CEO narrative; CFO numbers; COO facts; CRO customer impact |
| **Expected outcome** | Board hears truthful range with mitigation owners |
| **Success measures** | No board surprise; mitigation tracked to closure |

---

## Decision quality bar (all catalogue entries)

A Manufacturing pack recommendation is incomplete unless it states:

1. Focus Outcome(s) moved  
2. Options in play (≥2)  
3. Unknowns  
4. Trade-offs ( esp. cash vs service vs share )  
5. Council dissent likely from which role  
6. Time box / review trigger  

This bar is enforced later via validation rules (doc 11) and EIPF `validationRules()`.
