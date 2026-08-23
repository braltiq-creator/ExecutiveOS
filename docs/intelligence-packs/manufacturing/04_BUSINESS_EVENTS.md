# 04 — Manufacturing Business Events

**EIPF:** `businessEvents()`  
**Rule:** Events are executive-meaningful shocks, not ERP transaction spam.

---

## Event design principles

1. Material to ≥1 Focus Outcome  
2. Has an executive question  
3. Names severity honestly  
4. Links ontology terms without becoming Core types  
5. Feeds Reality Lab scenarios (doc 08)

---

## Event catalogue

| ID | Label | Severity | Event class | Related outcomes | Executive question |
|----|-------|----------|-------------|------------------|--------------------|
| `mfg-evt-demand-collapse` | Regional demand collapse | critical | demand_shock | forecast, utilisation, inventory, working capital | Reset the plan now, or ride it out? |
| `mfg-evt-demand-surge` | Unexpected demand surge | high | demand_shock | forecast, utilisation, dealer, lead-time | Which build slots and dealers get scarce capacity? |
| `mfg-evt-supplier-outage` | Critical supplier outage | critical | supply_disruption | supply-resilience, utilisation, lead-time | Dual-source, buffer, or stop selling? |
| `mfg-evt-commodity-spike` | Commodity price spike | high | cost_shock | margin, working capital, share | Pass through, absorb, or hybrid — for how long? |
| `mfg-evt-line-down` | Major line down | critical | operational_outage | utilisation, lead-time, margin | Reallocate slots or declare force majeure to channel? |
| `mfg-evt-quality-escape` | Field quality escape | critical | quality_event | margin, dealer, share | Contain, disclose, and rework — what is board language? |
| `mfg-evt-inventory-bloat` | Inventory bloat detected | high | working_capital | inventory, working capital, dealer | Destock posture — how deep, how fast? |
| `mfg-evt-eo-spike` | E&O spike | high | working_capital | inventory, working capital, margin | Write-down now or recover via clearance? |
| `mfg-evt-allocation-conflict` | Dealer allocation conflict | high | channel_conflict | dealer, share, lead-time | Whose scarcity rules win this week? |
| `mfg-evt-forecast-miss` | Material forecast miss | high | forecast_break | forecast, inventory, utilisation | Mid-cycle reset — yes/no, which regions? |
| `mfg-evt-overtime-spiral` | Overtime spiral | high | capacity_stress | utilisation, margin, lead-time | Reject overtime and slip promises, or accept structural cost? |
| `mfg-evt-construction-down` | Construction activity drop | moderate | macro_signal | forecast, dealer, share | Adjust regional outlook before factories feel it? |
| `mfg-evt-dealer-distress` | Strategic dealer distress | high | channel_risk | dealer, working capital, share | Support, restructure territory, or exit? |
| `mfg-evt-competitor-capacity` | Competitor capacity move | moderate | competitive | share, future-fit, utilisation | Accelerate or hold our capacity/automation bet? |
| `mfg-evt-electrification-shift` | Electrification demand shift | high | strategic_shift | future-fit, share, mix, inventory | Rebalance mix and capex gates this quarter? |
| `mfg-evt-board-inventory` | Board inventory challenge | high | governance | working capital, inventory | What honest narrative and remediation do we take? |
| `mfg-evt-safety-stop` | Safety stoppage | critical | safety | utilisation, supply-resilience, board posture | Restart criteria and external communication? |
| `mfg-evt-logistics-break` | Logistics / port disruption | high | supply_disruption | lead-time, inventory, working capital | Air freight exception or promise reset? |

---

## Event → Decision routing (illustrative)

| Event | Default catalogue decisions |
|-------|----------------------------|
| Demand collapse / surge | mfg-d-06, mfg-d-01, mfg-d-02, mfg-d-03 |
| Supplier outage | mfg-d-05, mfg-d-01, mfg-d-12 |
| Commodity spike | mfg-d-08, mfg-d-03 |
| Inventory bloat / E&O | mfg-d-03, mfg-d-07, mfg-d-12 |
| Allocation conflict | mfg-d-02 |
| Overtime spiral | mfg-d-04, mfg-d-01 |
| Electrification shift | mfg-d-09, mfg-d-10 |
| Board inventory challenge | mfg-d-12, mfg-d-03 |

---

## Severity guidance

| Severity | Executive expectation |
|----------|----------------------|
| **critical** | Same-day Council observation; Command Centre pulse; Decision due today/this week |
| **high** | This-week ELT; Meeting Pack updated; owners named |
| **moderate** | Watch with trigger; include in weekly ops / commercial rhythm |

---

## Non-events (exclude from pack)

Do not elevate to executive Business Events:

- Individual work-order status flips  
- Routine pick confirmations  
- Normal daily production counts without variance  
- Single dealer order edits inside policy  

Those may feed Twin/KPIs; they are not Executive Council material by default.
