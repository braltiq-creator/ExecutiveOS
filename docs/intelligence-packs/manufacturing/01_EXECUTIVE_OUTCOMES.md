# 01 — Manufacturing Executive Outcomes

**EIPF:** `outcomes()`  
**Owner of outcome portfolio:** CEO (enterprise coherence); each outcome has an executive owner

---

## Outcome portfolio (Focus Outcomes)

Manufacturing packs should seed these outcome models. Names are executive language, not ERP labels.

| ID | Outcome | Owner | Strategic importance | Intent |
|----|---------|-------|----------------------|--------|
| `mfg-outcome-inventory` | Inventory optimisation | CFO / COO co-own; CEO breaks ties | critical | Right stock, right place, minimum cash trapped |
| `mfg-outcome-forecast` | Forecast accuracy | CRO primary; CFO challenge | critical | Demand signal trustworthy enough to schedule factories |
| `mfg-outcome-utilisation` | Factory utilisation | COO | critical | Productive use of constrained capacity without overtime spiral |
| `mfg-outcome-dealer` | Dealer performance | CRO | high | Healthy dealer throughput, inventory turn, and fill rates |
| `mfg-outcome-working-capital` | Working capital discipline | CFO | critical | Cash conversion cycle under control |
| `mfg-outcome-lead-time` | Customer lead-time reliability | COO / CRO | high | Quoted lead times kept; order bank credible |
| `mfg-outcome-supply-resilience` | Supply-chain resilience | COO | high | Critical parts dual-sourced or buffered with intent |
| `mfg-outcome-margin` | Factory & product margin | CFO / COO | high | Contribution margin protected under mix and overtime |
| `mfg-outcome-share` | Strategic market position | CSO / CRO | moderate | Share and segment position defended or grown deliberately |
| `mfg-outcome-future-fit` | Future manufacturing posture | CSO | moderate | Electrification, automation, and platform bets funded with discipline |

---

## Outcome definitions

### 1. Inventory optimisation (`mfg-outcome-inventory`)

**Description:** Reduce excess and obsolete inventory while protecting fill rate and production continuity.

**Success measures:**

- Days of inventory on hand within target band by class (A/B/C)
- Excess & obsolete (E&O) as % of inventory falling quarter-on-quarter
- Stockouts on A-class parts below threshold
- Inventory $ aligned to demand plan within agreed variance

**Supporting KPI ids:** `mfg-kpi-dio`, `mfg-kpi-eo-pct`, `mfg-kpi-fill-rate`, `mfg-kpi-wip-turns`

**Ontology anchors:** Inventory, Safety Stock, Allocation, Order Bank, Model, Variant

**Warning indicators:**

- E&O rising while utilisation falls
- Dealer inventory swollen while factory builds continue
- Build slots filled against stale forecast

---

### 2. Forecast accuracy (`mfg-outcome-forecast`)

**Description:** Make regional and dealer demand forecasts accurate enough to commit capacity and inventory.

**Success measures:**

- WAPE / forecast bias within band at model and region
- Schedule stability (frozen-window changes) declining
- Order-bank vs plan variance explained within SLA

**Supporting KPI ids:** `mfg-kpi-forecast-wape`, `mfg-kpi-forecast-bias`, `mfg-kpi-schedule-stability`

**Ontology anchors:** Dealer, Region, Order Bank, Model, Variant, Commodity

**Warning indicators:**

- Persistent optimistic bias in growth regions
- Construction / commodity signals ignored in plan
- Factory schedule rewritten weekly outside frozen window

---

### 3. Factory utilisation (`mfg-outcome-utilisation`)

**Description:** Run factories at economically sound utilisation — neither chronic underload nor overtime dependency.

**Success measures:**

- OEE / utilisation in target band by plant
- Overtime hours as % of standard within cap
- Changeover loss trending down on constrained lines

**Supporting KPI ids:** `mfg-kpi-utilisation`, `mfg-kpi-oee`, `mfg-kpi-overtime-pct`, `mfg-kpi-changeover-loss`

**Ontology anchors:** Factory, Build Slot, Line, Lead Time, Capacity Envelope

**Warning indicators:**

- Utilisation high only via overtime and quality escapes
- One plant overloaded while another underfed
- Build slots sold that exceed demonstrated capacity

---

### 4. Dealer performance (`mfg-outcome-dealer`)

**Description:** Dealers convert demand into profitable, timely retail without channel conflict or inventory dumping.

**Success measures:**

- Dealer fill rate and days inventory
- Dealer turn by region
- Lost sales / backorder aging declining
- Dealer health score distribution improving

**Supporting KPI ids:** `mfg-kpi-dealer-fill`, `mfg-kpi-dealer-dio`, `mfg-kpi-dealer-turn`, `mfg-kpi-lost-sales`

**Ontology anchors:** Dealer, Region, Allocation, Order Bank

**Warning indicators:**

- Allocation fights without transparent rules
- Top dealers starved while weak dealers overstocked
- Retail promotions forcing factory overtime

---

### 5. Working capital discipline (`mfg-outcome-working-capital`)

**Description:** Compress cash conversion cycle without starving production or dealers.

**Success measures:**

- Cash conversion cycle (CCC) within target
- Inventory $ / revenue improving
- Receivables and payables policy compliance

**Supporting KPI ids:** `mfg-kpi-ccc`, `mfg-kpi-inventory-dollars`, `mfg-kpi-dso`, `mfg-kpi-dpo`

**Ontology anchors:** Inventory, Working Capital, Factory, Dealer

**Warning indicators:**

- Inventory rising faster than revenue
- Capex and inventory competing without CEO arbitration
- Forecast miss funded by silent inventory build

---

### 6. Customer lead-time reliability (`mfg-outcome-lead-time`)

**Description:** Quoted lead times are kept; customers and dealers trust the promise date.

**Success measures:**

- On-time-to-promise (OTTP) ≥ target
- Lead-time commitment accuracy
- Expedite rate declining

**Supporting KPI ids:** `mfg-kpi-ottp`, `mfg-kpi-quoted-lead-time`, `mfg-kpi-expedite-rate`

**Ontology anchors:** Lead Time, Build Slot, Order Bank, Allocation

---

### 7. Supply-chain resilience (`mfg-outcome-supply-resilience`)

**Description:** Critical inputs are resilient; disruptions are absorbed without board-level surprise.

**Success measures:**

- % critical parts with dual source or intentional buffer
- Supplier OTIF
- Disruption recovery time

**Supporting KPI ids:** `mfg-kpi-dual-source-pct`, `mfg-kpi-supplier-otif`, `mfg-kpi-recovery-days`

**Ontology anchors:** Supplier, Part, Safety Stock, Factory

---

### 8. Factory & product margin (`mfg-outcome-margin`)

**Description:** Mix, overtime, and discounting do not silently destroy contribution margin.

**Success measures:**

- Contribution margin by model/plant
- Overtime premium as % of COGS within band
- Discount leakage controlled

**Supporting KPI ids:** `mfg-kpi-contribution-margin`, `mfg-kpi-overtime-cost`, `mfg-kpi-discount-leakage`

---

### 9. Strategic market position (`mfg-outcome-share`)

**Description:** Share and segment position move by design, not by accidental allocation.

**Success measures:**

- Share in priority segments
- Win rate on strategic bids / fleet deals
- Mix shift toward strategy models

**Supporting KPI ids:** `mfg-kpi-segment-share`, `mfg-kpi-strategic-win-rate`

---

### 10. Future manufacturing posture (`mfg-outcome-future-fit`)

**Description:** Electrification, automation, and platform investments stay funded and gated.

**Success measures:**

- Milestone hit rate on transformation programmes
- Automation ROI vs plan
- Capex stage-gate compliance

**Supporting KPI ids:** `mfg-kpi-transformation-milestones`, `mfg-kpi-automation-roi`

---

## Outcome relationships (executive view)

```
Forecast accuracy ──► Factory utilisation ──► Lead-time reliability
        │                      │
        ▼                      ▼
 Dealer performance ◄── Inventory optimisation ──► Working capital
        │                      │
        └──────────► Margin ◄──┘
                     │
                     ▼
            Market position / Future-fit (CSO horizon)
```

CEO owns portfolio coherence. No outcome may be optimised in isolation when it damages Organisation Health.
