# 06 — Manufacturing Industry KPIs

**EIPF:** `kpis()`  
**Rule:** Every KPI links to ≥1 outcome and has an executive meaning (not a shop-floor vanity metric).

---

## KPI dictionary

| ID | Label | Unit | Polarity | Executive meaning | Linked outcomes |
|----|-------|------|----------|-------------------|-----------------|
| `mfg-kpi-dio` | Days inventory outstanding | days | lower_better* | Cash tied in stock relative to demand | inventory, working capital |
| `mfg-kpi-eo-pct` | Excess & obsolete % | % | lower_better | Capital at risk of write-off | inventory, working capital, margin |
| `mfg-kpi-fill-rate` | Order fill rate | % | higher_better | Service level to dealers/customers | inventory, dealer, lead-time |
| `mfg-kpi-wip-turns` | WIP turns | turns | higher_better | Flow health inside factories | inventory, utilisation |
| `mfg-kpi-forecast-wape` | Forecast WAPE | % | lower_better | Plan error magnitude | forecast |
| `mfg-kpi-forecast-bias` | Forecast bias | % | target_band** | Systematic over/under forecasting | forecast, inventory |
| `mfg-kpi-schedule-stability` | Frozen-window stability | % | higher_better | Plan discipline | forecast, utilisation |
| `mfg-kpi-utilisation` | Factory utilisation | % | target_band | Productive use of capacity envelope | utilisation |
| `mfg-kpi-oee` | OEE | % | higher_better | Quality of capacity use | utilisation, margin |
| `mfg-kpi-overtime-pct` | Overtime hours % | % | lower_better | Structural stress / fake capacity | utilisation, margin |
| `mfg-kpi-changeover-loss` | Changeover loss | % | lower_better | Mix complexity cost | utilisation, margin |
| `mfg-kpi-dealer-fill` | Dealer fill rate | % | higher_better | Channel service | dealer |
| `mfg-kpi-dealer-dio` | Dealer days inventory | days | target_band | Channel inventory health | dealer, working capital |
| `mfg-kpi-dealer-turn` | Dealer inventory turn | turns | higher_better | Channel velocity | dealer |
| `mfg-kpi-lost-sales` | Lost sales (est.) | currency | lower_better | Scarcity / availability failure | dealer, share |
| `mfg-kpi-ccc` | Cash conversion cycle | days | lower_better | End-to-end cash speed | working capital |
| `mfg-kpi-inventory-dollars` | Inventory $ | currency | context*** | Absolute capital in stock | working capital, inventory |
| `mfg-kpi-dso` | Days sales outstanding | days | lower_better | Receivables drag | working capital |
| `mfg-kpi-dpo` | Days payable outstanding | days | context | Payables policy (not maximise blindly) | working capital |
| `mfg-kpi-ottp` | On-time-to-promise | % | higher_better | Promise integrity | lead-time, dealer |
| `mfg-kpi-quoted-lead-time` | Quoted lead time | days | context | Competitiveness vs honesty | lead-time, share |
| `mfg-kpi-expedite-rate` | Expedite rate | % | lower_better | Plan failure symptom | lead-time, utilisation, margin |
| `mfg-kpi-dual-source-pct` | Critical parts dual-sourced/buffered | % | higher_better | Resilience coverage | supply-resilience |
| `mfg-kpi-supplier-otif` | Supplier OTIF | % | higher_better | Inbound reliability | supply-resilience, utilisation |
| `mfg-kpi-recovery-days` | Disruption recovery time | days | lower_better | Resilience performance | supply-resilience |
| `mfg-kpi-contribution-margin` | Contribution margin | % | higher_better | Factory/product economic health | margin |
| `mfg-kpi-overtime-cost` | Overtime premium cost | currency | lower_better | Cost of fake capacity | margin |
| `mfg-kpi-discount-leakage` | Discount / clearance leakage | % | lower_better | Price discipline | margin, dealer |
| `mfg-kpi-segment-share` | Priority segment share | % | higher_better | Strategic position | share |
| `mfg-kpi-strategic-win-rate` | Strategic bid win rate | % | higher_better | Quality of big-deal pursuit | share |
| `mfg-kpi-transformation-milestones` | Transformation milestone hit rate | % | higher_better | Future-fit execution | future-fit |
| `mfg-kpi-automation-roi` | Automation ROI vs plan | % | higher_better | Capex truth | future-fit, margin |

\* Lower is better **within service floor** — never starve fill rate.  
\*\* Target band KPIs are not pure higher/lower; pack polarity may use `higher_better` with reasoning rules enforcing bands.  
\*\*\* Context KPIs require narrative (up may be seasonal build, or denial).

---

## KPI → Council attention map

| KPI cluster | Primary watcher | Escalation |
|-------------|-----------------|------------|
| CCC, inventory $, E&O | CFO | CEO if board-visible |
| Utilisation, OEE, overtime, OTTP | COO | CEO if structural |
| Forecast WAPE/bias, dealer fill/DIO | CRO | CEO if plan committed externally |
| Segment share, transformation, automation ROI | CSO | CEO/board gates |
| Cross-cluster conflict | CEO | Board narrative (mfg-d-12) |

---

## Benchmark hooks

Peer medians / top-quartile targets for these KPIs are defined in [09 — Benchmarks](./09_BENCHMARKS.md). KPIs without benchmark context must still ship with internal targets.
