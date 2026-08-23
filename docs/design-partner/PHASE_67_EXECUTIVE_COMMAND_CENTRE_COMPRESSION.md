# Phase 67 — Executive Command Centre Compression & Progressive Disclosure

**Status:** Complete  
**Scope:** Experience composition only (`/today`)  
**Date:** 2026-08-23

## Before state

Phase 66 established a clear hierarchy (Brief → Judgement → Decision → Continuity → Evidence Lab → Council → Accountability → Insight → Design Partner), but `/today` still behaved like a long analytical report: duplicated lead narrative (hero + judgement panel + insight), full heat map at first instrument open, Design Partner/module landscape competing with executive attention, and empty accountability fields occupying visual weight.

## UX problem

Executives needed to scroll to gather what matters. The same judgement and decision question competed for attention multiple times. Dense instruments (Region × Model matrix) appeared at full weight before the executive chose to investigate.

## New executive hierarchy

Three layers:

| Layer | Purpose | Scroll |
|-------|---------|--------|
| **1 — Brief** | What changed, what matters, judgement, decision, confidence, primary CTA | First viewport |
| **2 — Investigate** | Continuity (compact), Evidence Lab, judgement basis (progressive) | Optional |
| **3 — Operate** | Decision status, accountability (contextual), Council, supporting/admin | Optional |

## Layer 1 / 2 / 3

### Layer 1 — Executive Brief
- Slim Design Partner / module context (subordinate)
- Single lead judgement (data-derived)
- Up to 4 evidence-hierarchy signals
- Judgement confidence (unchanged calculation)
- Decision question + primary **Open decision →** CTA
- Compact honesty line when decision required (owner/due not fabricated)

### Layer 2 — Investigate
- Since You Last Looked: 3 compact rows + View all N changes
- Evidence Lab with executive questions per instrument
- Demand: top movements summary → **View full Region × Model →**
- Other instruments: summary → View detail / Expand instrument
- Judgement panel + narrative chain behind “Why should I believe this?”

### Layer 3 — Operate
- Decision Engine status reflected dynamically
- Accountability promoted only when selection/execution exists; otherwise one honesty line
- Council collapsed when not established
- Overnight/stream, coverage/value, Design Partner admin under progressive disclosure
- Insight as subordinate closing caption (not a second lead narrative)

## Progressive disclosure strategy

- Evidence instruments: compact summary first; full instrument on demand (still in DOM for integrity)
- Continuity: 3 of N → View all
- Judgement basis: `<details>`
- Council: collapsed empty state
- Module landscape / pilot feedback / coverage: Design Partner status `<details>`
- Supporting stream: `<details>`

## Components changed

| Component | Change |
|-----------|--------|
| `CommandCentreExperience.tsx` | Three-layer composition; dedupe narratives |
| `command-centre.css` | Denser Layer 1; layer surfaces |
| `EvidenceLab.tsx` | Investigate framing + per-tab questions |
| `EvidenceInstrumentDisclosure.tsx` | **New** — summary → expand |
| `SinceYouLastLooked.tsx` | Denser default (3 rows) |
| `CouncilProgressive.tsx` | Lighter empty footprint |
| `DesignPartnerExpansionSignals.tsx` | Compact + quiet NOT ACTIVE |

## Components reused

EXDS instruments, hero, judgement panel, heat map, forecast chart, continuity/accountability, Decision Engine hrefs, manufacturing/commercial projections.

## Components deliberately untouched

UDG, snapshot immutability, intelligence engines, manufacturing/commercial formulas, Decision Engine states/selection/approval/actions, Council logic, Design Partner data model, Phase 57–65 derivation, Phase 66 evidence hierarchy builders.

## Regression verification

| | Before (Phase 66) | After (Phase 67) |
|--|-------------------|------------------|
| Files | 80 | 81 |
| Passed | 532 | 535 |

- `npm test` — **535 passed**
- `npm run build` — **pass**
- New: `tests/unit/validation/phase-67-command-centre-compression.test.ts`
- Phase 66 composition tests updated to phase-67 markers (capabilities retained)

## Attention assessments

### 10s
Lead judgement + key signals visible in Brief without scrolling for situation awareness.

### 30s
Decision question, confidence, and Open decision CTA in Layer 1.

### 60s
“Why should I believe this?” + Evidence Lab summaries on `/today`.

### 2min
Expand Region × Model / instruments; open Decision Engine via primary CTA; Operate layer for accountability/Council.

## Remaining UX debt

- Very short laptop heights with Design Partner strip may still need a light scroll for confidence + CTA together
- Commercial still lacks Phase 60/61 decision-paper parity on CC (pre-existing)
- Insight is caption-level; some may want a one-line continuity cue inside Layer 1 later

## Stop

Phase 67 complete. Do **not** begin Phase 68 without explicit approval.
