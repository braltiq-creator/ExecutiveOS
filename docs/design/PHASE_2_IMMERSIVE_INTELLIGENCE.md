# ExecutiveOS Phase 2 — Immersive Executive Intelligence Experience

**Status:** Design & architecture audit complete — visual prototypes ready for review  
**Branch:** `cursor/phase-2-immersive-intelligence-b8a3`  
**Constraint:** Presentation-layer immersion only. No backend contract, forecasting calculation, auth/RLS, or fabricated operational data without explicit approval.  
**Gate:** Do not implement production screens until each prototype is reviewed.

---

## 1. Design & architecture audit (current state)

### 1.1 What Phase 1 delivered

Dark graphite OS tokens, shell chrome, Command Centre restyle, restrained accents. Charts remain custom CSS/SVG; Knowledge graph explorer remains unmounted (FE-001); no geographic map library.

### 1.2 Current product surfaces

| Surface | Route | Primary composition | Visual instruments today |
|--------|-------|---------------------|--------------------------|
| Executive Briefing | `/today` | `CommandCentreExperience` → Brief → Investigate → Decide → Execute | Hero judgement, metric cards, overnight list, custom forecast bars, region×model heat **grid**, evidence lab |
| Manufacturing | `/today` when `profileId === "manufacturing"` | Same Command Centre + manufacturing projection | Heat grid, capacity cards, inventory signals, forecast series — **no map** |
| Knowledge | `/knowledge` | Q&A workspace (`KnowledgeWorkspace`) | Answer, evidence stack, relationship **cards**, timeline; SVG explorer exists but not wired |
| Decisions | `/decisions` | `DecisionWorkspace` | Portfolio, impact simulator (before/after text metrics), highest impact |
| Graph alias | `/graph` | Redirect → `/knowledge` | — |

### 1.3 Data reality (critical for immersion without fiction)

**Manufacturing (UDG → `ManufacturingAnalysis`)**

- Available dimensions: period, region (AU state codes in demo: NSW/QLD/SA/VIC/WA), dealer, model, variant, factory (Plant 1–3), forecast/actual/order bank, capacity, slots, finished goods, inventory days.
- Derived instruments already computed: `nationalSeries`, `heatMap`, `capacity[]`, `inventory[]`, `insights[]`, `missingInformation[]`, confidence slices.
- **Not in contract:** latitude/longitude, plant street addresses, dealer geocodes, live telemetry, digital-twin 3D meshes.
- Evidence graph: `manufacturing-evidence-graph` projects organisations, regions, dealers, factories, models, variants, measures + co-occurring relationships only — never invents cross-row joins.

**Knowledge**

- Persistence model: `lib/knowledge` node/edge types (executive, organization, decision, risk, opportunity, document, …).
- Parallel KG / Twin bridge: `knowledge-graph`, `digital-twin/graph-bridge`.
- Live `/knowledge` UI is Q&A + cards; `KnowledgeGraphExplorer` / `KnowledgeGraphCanvas` are real but light-themed and unmounted (FE-001).

**Decisions**

- Impact simulator already encodes before/after health, strategic/executive value narrative, confidence, recommendation — presentation is card-dense, not spatial.

**AI**

- `OpenAIProvider` exists (`src/lib/ai`). Most Command Centre “intelligence” is **deterministic evidence derivation**, not live LLM generation.
- Phase 2 must label signals as **Evidence-derived** vs **AI-assisted** only when the AI path actually ran. No fake “live AI” indicators.

### 1.4 Gaps vs Phase 2 objective

| Desired capability | Current gap |
|--------------------|-------------|
| Immersive briefing command centre | Linear stacked sections; limited spatial hierarchy; no dominant visualisation plane |
| Interactive manufacturing map | Region labels only; heat is a CSS grid; no MapLibre/Leaflet |
| Connected knowledge network | Explorer unmounted; cards instead of interactive graph |
| Decision impact maps / scenarios | Textual impact simulator; no spatial/relational impact viz |
| Visible AI layer | Intelligence present but not differentiated as explainable AI with evidence |
| Chart/map/graph tech | Zero chart/map/graph npm deps — custom SVG/CSS only |
| Motion beyond CSS reveal | CSS tokens + `Reveal`; no choreographed spatial transitions |

---

## 2. Recommended visual architecture

### 2.1 Principle: instruments, not widgets

Every visualisation must answer an executive question and bind to evidence provenance. Decorative sci-fi, neon glow stacks, and wallpaper imagery are out of scope.

### 2.2 Layer model

```
┌─────────────────────────────────────────────────────────────┐
│  OS Shell (AppShell) — unchanged routes / auth              │
├─────────────────────────────────────────────────────────────┤
│  Experience Stage (immersive canvas per module)             │
│   ├─ Spatial plane (map / graph / impact field)             │
│   ├─ Judgement overlay (lead statement + CTA)               │
│   ├─ Signal rail (evidence-derived / AI-assisted badges)    │
│   └─ Evidence drawer (provenance, missing data honesty)     │
├─────────────────────────────────────────────────────────────┤
│  Projection adapters (presentation-only)                    │
│   manufacturing-command-centre · knowledge view · decisions │
├─────────────────────────────────────────────────────────────┤
│  Domain engines (UNCHANGED without approval)                │
│   ManufacturingAnalysis · Evidence Graph · Decisions · AI   │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Composition rules

1. **One dominant visual plane** per first viewport (map, network, or impact field) — not a dashboard of equal cards.
2. **Brand / product identity** remains OS-level; module stage carries the intelligence theatre.
3. **Missing data** surfaces as explicit “Not established / Insufficient evidence” chips — never filled with synthetic numbers.
4. **Demo fixtures** (e.g. `FY26-Q1-DEMO`) retain demonstration disclosure already in manufacturing analysis.
5. **Region-resolved geography** allowed as a presentation lookup for AU state codes → centroids; precise factory/dealer coordinates require UDG fields before claiming address-level accuracy.

### 2.4 Geo strategy (manufacturing)

| Entity | Placement rule |
|--------|----------------|
| Region (NSW, QLD, …) | Centroid from curated AU state reference table (presentation constants) |
| Factory | Until lat/lng exists: anchor to strongest co-occurring region in evidence; label “Region-resolved · coordinates not in evidence” |
| Dealer | Same; network arcs region→region or dealer→factory from **co-occurring** evidence graph relationships only |
| Demand heatmap | Choropleth / hex intensity from existing `heatMap` variance by region |
| Capacity / inventory | Side instruments + map popovers; not invented map layers |

Fallback when regions are non-AU / unknown: **schematic network map** (nodes by region label, no basemap claim of precision).

---

## 3. Recommended libraries & dependencies

| Need | Recommendation | License | Why | Avoid |
|------|----------------|---------|-----|-------|
| Interactive maps | **`maplibre-gl` + `react-map-gl/maplibre`** | BSD-3 / MIT | WebGL vector maps, heat/GeoJSON layers, no Mapbox token tax; Next-friendly via client dynamic import | Mapbox GL paid tiles unless org already has Mapbox; Hippocratic Leaflet license friction |
| Basemap tiles | **OpenFreeMap / MapLibre demo tiles** or self-hosted style; dark graphite custom style | Varies (prefer open) | Matches OS aesthetic; commercial-safe | Stock photo “earth wallpaper” |
| Knowledge graph | **`react-force-graph-2d`** (primary); optional later `react-force-graph-3d` | MIT | Canvas force layout, pan/zoom/select, proven with Next `dynamic(..., { ssr: false })` | `@xyflow` Pro force examples; decorative 3D by default |
| Charts | **Keep custom EXDS instruments** + selective **`@visx`** (or thin D3) for forecast ribbons / scenario fans | MIT | Preserves executive instrument language; avoid generic SaaS chart chrome | Recharts default skins as primary look |
| Motion | Extend CSS tokens + small **View Transitions / WAAPI**; optional **`motion`** only if needed | MIT | Restraint; reduced-motion already in OS | Continuous particle/neon loops |
| 3D digital twin | **Defer** | — | No mesh/telemetry in data; 3D would be decorative | Three.js factory models without evidence |

**Install candidates (approval gate before add):**

```text
maplibre-gl
react-map-gl
react-force-graph-2d
# optional later: @visx/scale @visx/shape motion
```

**Bundle discipline:** all map/graph components `next/dynamic` with `ssr: false`; lazy per route; no global WebGL on marketing pages.

---

## 4. Screen-by-screen visual design

Prototypes live in `docs/design/prototypes/phase-2/` (static HTML, labelled **PROTOTYPE**). Screenshots attached in PR review artifacts.

### 4.1 Executive Briefing — `/today`

**First viewport:** full-bleed intelligence stage — radial / layered **Organisation Attention Field** (priority decisions as nodes sized by impact, risks/opportunities as satellites), lead judgement as overlay, signal rail with evidence badges, sparse timeline ribbon at bottom.

**Below fold:** performance delta strip (from existing metrics), overnight/intelligence stream, decision CTA — not competing card grids in the hero.

**Data binding:** `CommandCentreExperienceModel` judgements, metrics, overnight, decision paper — no new invented KPIs.

### 4.2 Manufacturing Intelligence

**First viewport:** dark MapLibre Australia stage; region choropleth from `heatMap`; factory markers (region-resolved); dealer network arcs from evidence co-occurrence; popover = forecast variance + capacity load from existing signals.

**Secondary instruments:** forecast vs actual (existing chart language), capacity utilisation bars, inventory coverage, region×model drill (retain heat matrix as Evidence Lab instrument).

**Honesty strip:** “Coordinates not in evidence — positions region-resolved” when applicable; `missingInformation` surfaced.

### 4.3 Knowledge Graph — `/knowledge`

**Primary:** interactive force-directed network (FE-001 fulfilled) using real `KnowledgeGraphNodeView` / edges **or** Manufacturing Evidence Graph projection when manufacturing context is active.

**Interaction:** select node → evidence / provenance panel; collapse clusters; filter by type; no fabricated entities.

**Secondary:** keep Q&A answer path as complementary mode (“Ask” vs “Explore network”).

### 4.4 Decision Intelligence — `/decisions`

**Primary:** **Decision Impact Field** — selected decision at centre; evidence nodes, risk/opportunity relations, financial/operational impact deltas as directed links (from existing simulator + portfolio data).

**Scenario comparison:** side-by-side before/after instruments (existing simulator fields) with visual delta bars — only when simulator data exists.

**Status / execution:** reuse execution linkage already on manufacturing decision paper.

### 4.5 AI Intelligence Layer (cross-cutting)

- Badge taxonomy: `Evidence-derived` · `AI-assisted` · `Insufficient evidence`.
- Predictive/forecast visuals only where `nationalSeries` / analysis insights exist.
- Recommendations always expandable to evidence list / provenance IDs.
- If OpenAI path is not invoked for a view, **do not** show pulsing “AI live” chrome.

---

## 5. Implementation phases

| Phase | Scope | Complexity | Dependencies |
|-------|-------|------------|--------------|
| **2.0** | This audit + static prototypes + library approval | Documentation / review | — |
| **2.1** | Shared immersion primitives (Stage, SignalBadge, EvidenceDrawer, geo reference table, dynamic import wrappers) | Medium — new presentation module | Token system |
| **2.2** | Manufacturing map stage + choropleth + markers + honesty strip | High — first WebGL integration | 2.1 + MapLibre approval |
| **2.3** | Knowledge force-graph mount (FE-001) + dark theme + manufacturing evidence graph mode | High — graph UX + data wiring | 2.1 + force-graph approval |
| **2.4** | Executive Briefing attention field + timeline ribbon | Medium–High — composition rewrite of first viewport | 2.1; optional graph reuse |
| **2.5** | Decision impact field + scenario delta instruments | Medium | 2.1 |
| **2.6** | AI badge taxonomy + explainability affordances across stages | Low–Medium | Existing AI + evidence |
| **2.7** | Performance pass (lazy load, reduced-motion, a11y, mobile fallbacks) | Medium | All above |

**Suggested review gates:** approve 2.0 prototypes → approve library add → implement 2.2 and 2.3 first (highest visual differentiation) → 2.4/2.5 → 2.6/2.7.

**Out of scope without separate approval:** UDG schema for lat/lng, forecasting formula changes, new API contracts, production deploy, 3D twin meshes.

---

## 6. Effort characterisation (not calendar estimates)

| Workstream | Relative size | Main risk |
|------------|---------------|-----------|
| Immersion primitives + tokens | M | Over-carding if not disciplined |
| MapLibre manufacturing stage | L | Geo honesty vs looking “fake precise”; tile/style ops |
| Knowledge force graph | L | Performance at large node counts; SSR boundaries |
| Briefing attention field | M | Must remain judgement-first, not dashboard |
| Decision impact field | M | Binding only to real simulator/portfolio fields |
| AI labelling | S | Mislabeling deterministic insights as AI |
| Perf / a11y / mobile schematic fallbacks | M | WebGL cost on low-end devices |

---

## 7. Performance & security considerations

### Performance

- Client-only dynamic import for MapLibre and force-graph; code-split per route.
- Cap visible graph nodes (cluster + “show more”); virtualize side lists (already noted in `PERFORMANCE_REVIEW.md`).
- Pause force simulation when tab hidden; honour `prefers-reduced-motion` (static layout positions).
- Map: prefer vector tiles; limit heatmap feature count to region aggregates (already small).
- No continuous GPU particle backgrounds.

### Security & tenancy

- No change to auth, RLS, or organisation isolation.
- Map/graph receive **already-scoped** org projections only — same as today.
- Do not send manufacturing payloads to third-party geocoding APIs without approval (use local AU state centroids).
- Tile style URLs: prefer self-controlled or approved open styles; no leaking org data into tile query strings.
- AI: existing provider boundaries; do not log evidence payloads to new vendors.

### Data integrity checklist (per screen)

- [ ] Bound only to existing analysis / graph / decision fields  
- [ ] Missing fields → explicit not-available UI  
- [ ] Demo disclosure preserved when `demonstrationData`  
- [ ] No fabricated live indicators  
- [ ] Region-resolved geo labelled when coordinates absent  

---

## 8. Acceptance mapping

| Criterion | How Phase 2 will meet it |
|-----------|--------------------------|
| Materially different from SaaS dashboard | Dominant spatial stages (map / network / impact field) replace card grids in first viewport |
| Briefing immediate impact | Attention field + judgement overlay + signal rail |
| Manufacturing geo + operational intelligence | MapLibre choropleth + markers + existing capacity/inventory/forecast instruments |
| Knowledge interactive connected intelligence | Mounted force-graph on real entities/relationships |
| Decisions communicate impact + evidence | Impact field + evidence-linked nodes + simulator deltas |
| Premium enterprise intelligence | Graphite OS + restrained instruments + honesty labelling |

---

## 9. Prototype index (review before implementation)

| File | Screen |
|------|--------|
| `docs/design/prototypes/phase-2/01-executive-briefing.html` | Immersive briefing command centre |
| `docs/design/prototypes/phase-2/02-manufacturing-map.html` | Industrial geographic intelligence |
| `docs/design/prototypes/phase-2/03-knowledge-network.html` | Interactive knowledge / evidence network |
| `docs/design/prototypes/phase-2/04-decision-impact.html` | Decision impact & evidence field |
| `docs/design/prototypes/phase-2/index.html` | Prototype gallery |

All prototypes use **illustrative layout** driven by **shapes of real contracts** (AU regions, Plant labels, evidence graph entity types). Numeric callouts are marked **SAMPLE LAYOUT** — not production org secrets.

---

## 10. Explicit non-goals for this PR

- No production screen implementation yet  
- No dependency installs yet (await library approval)  
- No merge to `main`, no production deploy  
- No modification of forecasting engines, migrations, auth, or API contracts  

---

## 11. Decision requests for approver

1. Approve **MapLibre + react-map-gl** and **react-force-graph-2d** as the visualisation stack?  
2. Approve **region-resolved** factory/dealer placement with honesty labelling until lat/lng exists in UDG?  
3. Implementation order preference: **Manufacturing map + Knowledge graph first** (recommended), or Briefing first?  
4. Should Knowledge default to **Explore network** or keep **Ask** as default with network as secondary tab?
