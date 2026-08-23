# 11 — Validation Criteria & Learning Loops

**EIPF:** `validationRules()` · `learningRules()`  
**Purpose:** Prove manufacturing judgement quality and improve it over time — inside Reality Lab first, then Design Partner.

---

## Validation rules

| ID | Severity | Description | Evaluate key |
|----|----------|-------------|--------------|
| `mfg-val-outcomes-linked` | blocker | Every recommendation links ≥1 manufacturing Focus Outcome | `outcomes_linked` |
| `mfg-val-council-complete` | blocker | Under critical severity, all five Council roles produce opinions | `council_complete` |
| `mfg-val-alternatives` | blocker | Judgement includes ≥2 options in play | `has_alternatives` |
| `mfg-val-unknowns` | warning | Unknowns explicitly listed when confidence < 70 | `has_unknowns` |
| `mfg-val-tradeoff-cash-service` | blocker | Inventory/capacity decisions state cash vs service trade-off | `cash_service_tradeoff` |
| `mfg-val-forecast-band` | warning | Build/destock cites forecast confidence band | `forecast_band_cited` |
| `mfg-val-allocation-policy` | blocker | Scarcity allocation cites policy | `allocation_policy_cited` |
| `mfg-val-overtime-expiry` | warning | Overtime approval includes expiry/review date | `overtime_expiry` |
| `mfg-val-ontology-opaque` | blocker | Pack does not require Core manufacturing entity types | `ontology_opaque` |
| `mfg-val-loop-intact` | blocker | Operating loop stages pass in Enterprise Simulation | `loop_intact` |
| `mfg-val-benchmark-context` | info | Material KPI calls reference benchmark or internal target | `benchmark_context` |
| `mfg-val-board-range` | warning | Board-material inventory/supply narrative includes range not point | `board_range` |

---

## Validation datasets → gates

| Dataset (doc 08) | Must pass |
|------------------|-----------|
| Demand shocks | forecast band, cash/service trade-off, council complete |
| Scarcity | allocation policy, alternatives, CEO arbitration path |
| Supply | dual-source options, board materiality check |
| Inventory / governance | board range, destock service floor |
| Capacity | overtime expiry OR capacity decision opened |
| Strategy | mix capacity proof, gate fails closed |
| Baseline | no false urgency; quiet excellence |

---

## Learning loops

Learning captures what manufacturing judgement got wrong or right — without rewriting history.

| ID | Trigger | Description | Retention hint |
|----|---------|-------------|----------------|
| `mfg-learn-01` | `decision_closed` | Compare predicted vs actual outcome movement (utilisation, CCC, fill, OTTP) | Store prediction delta + owning roles |
| `mfg-learn-02` | `forecast_reset_after_miss` | When mid-cycle reset was delayed, measure inventory/OTTP damage | Store time-to-reset and cost |
| `mfg-learn-03` | `overtime_recurrence` | If OT reappears after “exception”, escalate learning to capacity thesis | Store recurrence count |
| `mfg-learn-04` | `allocation_override` | Policy overrides that later hurt share or fill | Store override rationale vs result |
| `mfg-learn-05` | `clearance_postmortem` | Clearance ROI and factory hangover | Store margin floor breaches |
| `mfg-learn-06` | `council_challenge_correct` | When a dissenting Council role was later proven right | Reinforce that role’s reasoning hint |
| `mfg-learn-07` | `board_surprise` | Any board surprise on inventory/supply | Force narrative learning item |
| `mfg-learn-08` | `gate_miss_with_spend` | Capex continued after missed gate | Fail-closed reinforcement |

---

## Learning → Council adaptation

| Learning signal | Council adaptation |
|-----------------|--------------------|
| CRO optimism repeatedly costly | Strengthen CFO/COO challenge on forecast resets |
| COO overtime exceptions recur | CEO treats OT as capacity decision automatically |
| CSO mix shifts unbuildable | Require COO capacity proof before mix recommend |
| Silent inventory builds | CFO observation urgency ↑ on DIO/E&O |

---

## Design Partner readiness bar

Manufacturing pack may enter Design Partner only when Reality Lab shows:

1. All blocker validation rules green on critical scenario set  
2. Self-review questions in README answered Yes  
3. Learning hooks emit artefacts (not only scores)  
4. No Core manufacturing type leakage in review  

Until then: blueprint refinement only — **no pack feature work disguised as “just a little code.”**
