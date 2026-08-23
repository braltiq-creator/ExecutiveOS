# Phase 59 — Manufacturing Intelligence Audit

**Scope:** Demonstration fixture `fixtures/manufacturing/forecasting/demo-manufacturing-forecast.csv`  
**Code:** `src/executive-snapshot-studio/intelligence/manufacturing-analysis.ts`  
**Presentation:** `src/experience/mission-control/manufacturing-command-centre.ts`  
**Computed dump:** `docs/validation/PHASE_59_MANUFACTURING_METRIC_AUDIT_DUMP.json`  
**Audit date:** 2026-08-17  

**Principle:** No calculation changes in this audit. Extreme values preserved. Classification A–E only.

---

## 15. Metric-by-metric audit

### Shared primitives

| Item | Definition |
|------|------------|
| `variancePct` | `((actual − forecast) / forecast) × 100`, rounded to 1 decimal; `null` if forecast ≤ 0 |
| Heat window | Last **6** periods in sorted `period` list (recency set) |
| Capacity window | **Latest** period only (`2026-06` on this fixture) |
| Inventory window | Same recent 6-period set as heat map |

---

### Model H demand movement

| Field | Value |
|-------|--------|
| **Source fields** | `forecastQuantity`, `actualQuantity`, `region`, `model`, `period` |
| **Transformation** | Sum forecast & actual over Region×Model cells in last 6 periods; compute `variancePct` |
| **Formula** | `((Σ actual − Σ forecast) / Σ forecast) × 100` |
| **Denominator** | Σ forecast units for that Region×Model in the recent window |
| **Unit** | % above/below plan (forecast) |
| **Time period** | Last 6 months present in snapshot (here: `2025-13`… no — sorted periods last 6 through `2026-06`) |
| **Confidence** | Insight confidence **82** (fixed for acceleration insight, not MAE-derived) |
| **Nature** | **Derived** from observed forecast/actual units |
| **Fixture results** | QLD +**22.9%** (1512→1858); NSW +**16.8%** (1584→1850); VIC/WA/SA mild soft |
| **Verdict** | **A — Correct and intentionally extreme** (demo pattern: QLD/NSW Model H acceleration). Not hard-coded. |

---

### Model L demand movement

| Field | Value |
|-------|--------|
| **Source fields** | Same as Model H |
| **Formula / denominator** | Same Region×Model variance |
| **Fixture results** | SA −**31.5%** (1920→1316); other regions ~0% in recent window |
| **Insight** | `Model L demand is softening in SA` (largest decline ≤ −10%) |
| **Confidence** | **78** (fixed for decline insight) |
| **Nature** | **Derived** |
| **Verdict** | **A — Correct** (demo pattern: SA Model L forecast error / softening). |

---

### Region × Model variance (heat map)

| Field | Value |
|-------|--------|
| **Source fields** | `region`, `model`, `period`, `forecastQuantity`, `actualQuantity` |
| **Transformation** | Aggregate Σ forecast / Σ actual per Region×Model over recent periods; tone from \|variance\| bands |
| **Formula** | `variancePct` as above; tone: ≥15% up → attention; ≤−15% or mid bands → watching / improving / intelligence |
| **Denominator** | Region×Model Σ forecast in recent window |
| **Unit** | %; cell also stores absolute forecast/actual units |
| **Time period** | Last 6 periods |
| **Confidence (instrument)** | Presentation uses **84** (static evidence % on heat surface — not per-cell MAE) |
| **Nature** | **Derived** |
| **Verdict** | **A** for values; **B/C** for instrument confidence label (fixed 84% is not cell-level evidence strength). |

---

### Forecast vs Actual (national series)

| Field | Value |
|-------|--------|
| **Source fields** | `period`, `forecastQuantity`, `actualQuantity` |
| **Transformation** | National Σ by period across all regions/models/dealers |
| **Formula** | Per period: forecast = Σ forecast; actual = Σ actual; variance = actual − forecast; variancePct vs forecast |
| **Denominator** | National forecast for that period |
| **Unit** | Units (bars); % variance annotation |
| **Time period** | All periods; chart shows last 8 |
| **Confidence** | Chart itself has no band; national confidence score separate (below) |
| **Nature** | **Observed** aggregates (sums of source units) |
| **Fixture tail** | 2026-06: forecast 5964, actual 5808, −2.6% |
| **Verdict** | **A — Correct.** National track is close; regional/model extremes still material. |

---

### Forecast confidence

| Field | Value |
|-------|--------|
| **Source fields** | National / regional / model variance series from above; inventory for variant slice |
| **National score** | `round(clamp(100 − MAE × 2.2))` where MAE = mean \|variancePct\| across periods |
| **Regional/model score** | `round(clamp(100 − MAE × 2.4))` over heat cells in that scope |
| **Levels** | high ≥75, medium ≥55, else low; null → insufficient |
| **Variant H-XL** | **Hard-coded score 42 / low** when inventory tone = attention |
| **Denominator** | N/A (score is transformed MAE, not a physical ratio) |
| **Unit** | Score 0–100 + level label |
| **Time period** | Same windows as heat/national |
| **Nature** | **Derived** (national/region/model); **Inferred / heuristic** for variant slice (fixed 42) |
| **Fixture** | National **94 HIGH** (MAE ≈ 2.5%); Model H **72 MEDIUM** (MAE ≈ 11.8%); H-XL **42 LOW** |
| **Verdict** | **A** for MAE-based scores; **C** for variant confidence (fixed 42 needs clearer “heuristic” labelling); national HIGH can understate regional Model H stress (**C** contextualisation). |

---

### Plant demonstrated load %

| Field | Value |
|-------|--------|
| **Source fields** | `factory`, `period`, `actualQuantity` (fallback `forecastQuantity`), `productionCapacity`, `availableSlots` |
| **Transformation** | Latest period only. For each factory: **sum** demand across all dealer/model/variant rows; **max** capacity across those rows; **min** available slots |
| **Formula** | `loadPct = round((demonstratedDemand / capacity) × 1000) / 10` |
| **Denominator** | `productionCapacity` treated as **plant-level capacity** (MAX of repeated row values) |
| **Numerator** | **Σ Actual Units** (else forecast) for all lines at that factory in latest period |
| **Unit** | % of plant capacity |
| **Time period** | Latest period only (`2026-06`) |
| **Confidence** | Capacity insights use **80** (fixed) |
| **Nature** | **Derived** |
| **Fixture** | Plant 1 **536.2%** (2788 / 520 = **5.36×**); Plant 2 **366.7%** (1540 / 420 = **3.67×**); Plant 3 **308.3%** (1480 / 480) |
| **Verdict** | **A — Correct given current ontology and demo data** (capacity pressure was an intentional fixture pattern). **B/C — poorly labelled**: UI must state denominator = plant production capacity units, numerator = sum of line actuals. Do **not** cap/normalise. Equivalent language: “5.36× demonstrated demand vs plant capacity” for Plant 1. |

**Ontology note (not a silent fix):** If source rows meant *allocated* capacity per line rather than plant total repeated, MAX would understate capacity → load would be overstated. Current mapping + README treat capacity as plant-level → formula is consistent with that assumption.

---

### Capacity availability (slots)

| Field | Value |
|-------|--------|
| **Source fields** | `availableSlots` |
| **Transformation** | MIN of slot values on factory rows in latest period |
| **Formula** | `min(availableSlots)` |
| **Denominator** | N/A |
| **Unit** | Slots (count) |
| **Nature** | **Observed** (min aggregation) |
| **Fixture** | Plant 2 → **5** slots (tight); Plant 1/3 → 59 |
| **Verdict** | **A** under “tightest reported slots” semantics; **C** if executives expect sum or average slots. |

---

### Inventory days

| Field | Value |
|-------|--------|
| **Source fields** | `variant`, `model`, `inventoryDays`, `finishedGoods`, `period` |
| **Transformation** | Average inventory days (and FG) per variant over recent 6 periods |
| **Formula** | `avg(inventoryDays)`; tone ≥50 attention, ≥35 watching |
| **Denominator** | N/A (days already a ratio in source) |
| **Unit** | Days; FG units averaged |
| **Nature** | **Derived** average of observed days |
| **Fixture** | H-XL **81 days**, FG **158** → attention |
| **Confidence** | Insight **76** when days present |
| **Verdict** | **A**. Policy band (50/35) is **inferred** threshold, not from source policy table (**C** — label as ExecutiveOS policy band, not customer policy). |

---

### Executive judgement metrics

| Surface | Source | Nature |
|---------|--------|--------|
| Hero `leadJudgement` | Brief `executiveJudgement` = **first `executive_judgement` insight title** | Ranked selection of derived insights |
| Dark panel `headline` | `whatChanged[0]` = first demand-movement title → **“Model H demand has moved above plan”** | Derived |
| `requiresJudgement` | Implication from exec-judgement insight | Derived narrative |
| Brief confidence **88** | Avg of readiness.executiveReadiness, insight confidences, EIE pulse | Derived |
| Executive Value | Always “Not yet quantified” on this dataset | Honest / insufficient for $ |

**Verdict:** **A** for derivation; **C** for dual lead statements (hero vs headline) — see §16.

---

### Executive Focus diagram

| Field | Value |
|-------|--------|
| **Displayed** | Labels only: Demand, Factory, Inventory, Capacity |
| **Source** | Profile template (`focusDomainsForProfile` / manufacturing fixed set) |
| **Numeric metrics** | **None** — diagram is architectural, not a calculated instrument |
| **Nature** | **Inferred structure** (profile-aware template) |
| **Verdict** | **A** as orientation; does not encode live loads/variances. |

---

## 16. Lead judgement traceability

### What the executive sees

| Layer | Text |
|-------|------|
| Hero lead line | **“Manufacturing forecast requires executive judgement”** |
| Dark panel headline | **“Model H demand has moved above plan”** |
| Supporting implication | Protect strategic Model H demand vs deferral / reallocation |

Model H is **not hard-coded**. It emerges from ranking heat accelerators.

### Ranking mechanism (code path)

1. Build Region×Model heat cells (recent 6 periods).  
2. **Accelerators** = cells with `variancePct ≥ +10`, sorted **descending** by variance.  
3. Top accelerator → demand insight title: ``${top.model} demand has moved above plan`` with evidence from top 3 accelerators.  
4. Declines (`≤ −10`) produce a separate demand insight (Model L / SA).  
5. Capacity + inventory insights appended.  
6. If any accelerator **or** constrained plant → push `executive_judgement` insight citing top accelerator model/region.  
7. Brief lead title preference: **`executive_judgement` > demand > capacity > accuracy**.

### Why Model H won acceleration

| Rank | Signal | Magnitude | Why ranked |
|------|--------|-----------|------------|
| 1 | QLD · Model H | **+22.9%** | Highest positive variance ≥ +10 |
| 2 | NSW · Model H | **+16.8%** | Second accelerator; same model → title uses Model H |
| — | SA · Model L | **−31.5%** | Larger absolute move but **decline path**; separate insight; does not become “above plan” lead |
| — | WA · Model J | **−26.5%** | Decline; not in acceleration set |
| — | National series | ≈ −2.6% | Below national accuracy trigger threshold for “above plan” |

**Materiality / business impact (from insights, not $):**  
Regional Model H uplift + Plant 2/1 overload + H-XL inventory → implication: capacity reallocation vs deferral.

**Confidence:** demand insight 82; exec-judgement insight 80; brief rollup **88**.

**Why other signals ranked lower for the “above plan” headline**

- Declines are more extreme in absolute % but classified as softening, not uplift.  
- Capacity loads are larger numerically (536%) but ranked as **implication**, not the demand “what changed” lead.  
- National MAE is healthy → does not override regional Model H story.

**Gap (C):** Hero lead prefers generic exec-judgement title over the specific Model H demand sentence, so the 10-second story can feel split. Ranking is consistent; composition should keep Model H as the primary spoken lead.

**Evidence strip quirk (C):** Strip sorts by **absolute** variance, so SA −31.5% and WA −26.5% appear before Plant load; Model H uplift can be visually secondary on the strip even when headline is Model H.

---

## 17. Extreme value protection

| Value | Meaning | Equivalent |
|-------|---------|------------|
| **536.2%** | Plant 1 demonstrated demand **2788** units / plant capacity **520** units | **5.36×** plant capacity |
| **366.7%** | Plant 2 **1540** / **420** | **3.67×** plant capacity |
| **308.3%** | Plant 3 **1480** / **480** | **3.08×** plant capacity |

**Do not cap or soften.**  
**Required label form:**  
`Demonstrated load 536.2% of plant capacity`  
with supporting line: `2788 units demand vs 520 capacity (5.36×)` when those inputs are available.

**Presentation follow-up (this audit):** Capacity board / strip / insight detail now state the plant-capacity denominator and equivalent × multiple. **Formulas unchanged.**

Classification: **A + B/C** (correct extreme + labelling debt addressed in UI copy).

---

## 18. “7 Issues” / runtime health

### Finding

There is **no Command Centre UI string** `"7 Issues"` / issues badge in Manufacturing Forecasting presentation code (`MissionControl`, `CommandCentreExperience`, EXDS).

### What we measured instead

| Source | Count | Nature |
|--------|------:|--------|
| `tsc --noEmit` project errors | **43** | **Development / TypeScript** — mostly `snapshot: ExecutiveSnapshot \| null` in experience workspaces (`ExecutiveBrief` 21, Knowledge/Strategy/ImpactHistory, plus a few pack/test/portal errors) |
| Manufacturing readiness recommendations (fixture) | **1** | Data readiness OK — “Ready for executive judgement” |
| Manufacturing validation `errors[]` | **0** | No ingest failures |
| In-app System Health / support tickets | Not surfaced on `/today` Command Centre | Unrelated admin surfaces |

### Conclusion on “7 Issues”

Most likely **IDE / tooling Problems view** (Cursor/VS Code) scoped to a subset of open files or a filtered error list — **not** manufacturing data-quality issues and **not** seven runtime exceptions in the Manufacturing Command Centre.

**If the badge is Next.js / browser overlay:** treat as the same TypeScript nullability debt, not Phase 59 forecast math.

**Affects Manufacturing Forecasting?**  
Indirect only: `npm run build` typecheck fails on pre-existing experience nullability; manufacturing tests pass; demo intelligence path runs.

**Action:** Documented; **no manufacturing calculation change**. Separate hygiene: guard nullable `snapshot` in experience shells (out of Phase 59 intelligence scope).

---

## 19. Executive experience review (≈10 seconds)

No visual redesign. Answers for the **demonstration manufacturing snapshot**:

| Question | Answered? | Where | Gap |
|----------|-----------|-------|-----|
| **1. What changed?** | **Yes** | Headline / whatChanged: Model H above plan; Model L softening in SA | Hero title is more generic than headline |
| **2. Why does it matter?** | **Partial** | Implication: capacity reallocation vs deferral; Plant load + H-XL inventory | $ impact **Not yet quantified** (honest) |
| **3. Where is the exposure?** | **Yes** | Heat map (QLD/NSW H; SA L); capacity plants; H-XL inventory | Extreme load needs explicit denominator on first glance |
| **4. How confident is ExecutiveOS?** | **Partial** | National HIGH 94%; Model H MEDIUM 72%; brief 88% | National HIGH can feel inconsistent with Model H / plant stress without reading “why” |
| **5. What decision requires judgement?** | **Yes** | “Whether to protect strategic Model H demand by reallocating capacity or accepting deferral risk elsewhere.” | Council still **not established** (correct) |

### Missing evidence (do not invent)

- Unit economics / revenue protected / working capital $  
- True customer capacity ontology confirmation (plant total vs line allocation)  
- Formal inventory policy table (thresholds are ExecutiveOS bands)  
- Seat-level Council positions  

---

## Summary table (verdicts)

| Metric | Verdict |
|--------|---------|
| Model H movement | **A** |
| Model L movement | **A** |
| Region×Model heat | **A** (instrument conf **B/C**) |
| Forecast vs Actual | **A** |
| Forecast confidence | **A** / variant heuristic **C** |
| Demonstrated load % | **A** extreme + **B/C** labelling |
| Available slots | **A** / semantics **C** |
| Inventory days | **A** / policy band **C** |
| Executive judgement selection | **A** derived; composition **C** |
| Focus diagram | **A** (non-numeric) |
| “7 Issues” | **Tooling / TS debt**, not MF calc |

**No incorrect core formula found for the audited demonstration path.**  
Primary product debt is **labelling, ranking composition, and denominator clarity** — not suppression of extreme loads.
