# 02 — Manufacturing Business Ontology

**EIPF:** `ontology()`  
**Rule:** ExecutiveOS Core never references these terms as platform entity types. They exist only inside the Manufacturing pack vocabulary.

---

## Design rule

Ontology entries are **executive meanings**, not ERP schemas. A pack may map ERP objects to these terms via connectors later; Core only ever sees BusinessEvents and Outcome/Decision objects.

---

## Core vocabulary

| Term | Definition | Executive meaning | Aliases | Related outcomes |
|------|------------|-------------------|---------|------------------|
| **Factory** | Physical production site with constrained capacity | Where build slots and utilisation live | Plant, Site | utilisation, margin, lead-time |
| **Line** | Constrained production path inside a factory | Bottleneck unit for scheduling | Workcentre | utilisation, lead-time |
| **Model** | Product family sold to market | Strategic unit of mix and share | Platform | forecast, share, margin |
| **Variant** | Configurable expression of a model | Complexity and inventory driver | Spec, Configuration | inventory, forecast, margin |
| **Dealer** | Channel partner holding retail/inventory responsibility | Demand and inventory proxy at the edge | Distributor, Agent | dealer, forecast, working capital |
| **Region** | Geographic demand aggregation | Forecast and allocation unit | Territory, Market | forecast, dealer, share |
| **Order Bank** | Firm and soft orders awaiting build | Near-term demand truth vs plan | Backlog, Order book | forecast, lead-time, utilisation |
| **Allocation** | Rules assigning scarce product/slots to dealers/regions | Political and commercial fairness surface | Allotment | dealer, inventory, share |
| **Build Slot** | Discrete capacity reservation on a line/factory | Scarce asset executives actually allocate | Slot, Build week | utilisation, lead-time, dealer |
| **Lead Time** | Promised or demonstrated time to fulfil | Trust currency with dealers/customers | Promise date, Cycle time | lead-time, forecast |
| **Capacity Envelope** | Demonstrated sustainable output band | Truth vs sales ambition | Rated capacity | utilisation, forecast |
| **Inventory** | Finished goods, WIP, and parts held | Cash and service trade-off | Stock | inventory, working capital |
| **Safety Stock** | Intentional buffer against uncertainty | Insurance with a cost | Buffer | inventory, supply-resilience |
| **WIP** | Work-in-process inside factories | Hidden cash and flow friction | In-process | inventory, utilisation |
| **Supplier** | External provider of parts/materials | Resilience and OTIF source | Vendor | supply-resilience, margin |
| **Part** | Component required to build | BOM-level constraint | Component, SKU | supply-resilience, inventory |
| **Commodity** | Input whose price/availability swings externally | Margin and forecast risk | Raw material | margin, forecast, working capital |
| **Construction Activity** | Downstream building/infra demand signal | Leading indicator for dealer demand | Housing starts, Project pipeline | forecast, dealer, share |
| **Working Capital** | Inventory + receivables − payables | Cash trapped in the operating cycle | CCC | working capital |
| **Frozen Window** | Schedule period closed to casual change | Discipline boundary for plan stability | Firm zone | forecast, utilisation |
| **Mix** | Proportion of models/variants built and sold | Margin and capacity shape | Product mix | margin, utilisation, share |
| **Expedite** | Out-of-sequence acceleration of an order | Symptom of plan failure | Hot order | lead-time, margin, utilisation |
| **E&O** | Excess and obsolete inventory | Capital destruction signal | Dead stock | inventory, working capital |
| **OEE** | Overall equipment effectiveness | Quality of capacity use | — | utilisation |
| **Electrification** | Shift of product/process toward electric platforms | Strategic posture bet | EV transition | future-fit, share |
| **Automation** | Capex/process investment reducing labour dependency | Productivity and resilience bet | Robotics, Lights-out | future-fit, utilisation, margin |

---

## Relationship sketch (executive, not ERD)

```
Region → Dealer → Order Bank → Allocation → Build Slot → Factory/Line → Model/Variant
                     │                              │
                     └──── Inventory / Safety Stock ┘
                     │
              Commodity / Supplier / Part
                     │
              Construction Activity (external signal)
```

---

## Forbidden Core leakages

Do **not** promote these to Core types:

- `Factory`, `BuildSlot`, `OrderBank`, `Dealer`, `Variant`

Do expose manufacturing meaning only via:

- Pack ontology strings
- BusinessEvent payloads (canonical)
- Outcome / Decision linkage

---

## Mapping guidance for future connectors (non-binding)

| Ontology term | Typical source systems (examples) |
|---------------|-----------------------------------|
| Factory / Line / Build Slot | MES, APS, ERP planning |
| Model / Variant | PLM, ERP item master, configurator |
| Dealer / Region / Allocation | Dealer DMS, CRM, allocation engine |
| Order Bank | ERP order book, APS |
| Inventory / WIP / E&O | ERP / WMS |
| Supplier / Part / Commodity | ERP procurement, commodity feeds |
| Construction Activity | External macro / industry data |

Connectors adapt; the ontology stays executive-stable.
