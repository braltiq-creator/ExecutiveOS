# Universal Data Gateway (UDG)

**Phase:** 55  
**Status:** Infrastructure — permanent ingestion framework  
**Path:** `src/data-gateway/`

---

## Purpose

The Universal Data Gateway is the **canonical data ingestion framework** for ExecutiveOS.

It is **not** an Excel importer. Excel upload is the first connector implementation — not the architecture.

Every data source — Excel, CSV, Microsoft Dynamics, SAP, REST APIs, databases, manual entry, and future connectors — must eventually pass through the same ingestion contract.

**The Executive Intelligence Platform must never know where the data originated.**

```
Excel · CSV · Dynamics · SAP · REST · Manual
                ↓
     Universal Data Gateway
                ↓
      Executive Snapshot (ingestion)
                ↓
            ExecutiveOS
```

---

## Architecture boundary

| Unchanged | UDG owns |
| --- | --- |
| Core / Council / EIM / EJF | Ingestion contracts |
| Intelligence Packs / Domain Advisors | Connectors (placeholders + v1 tabular) |
| Executive Experience (EXDS) — except upload UI | Validation · mapping · confidence · lineage · audit |
| Connectivity Platform (`@/connectivity`) | Immutable snapshots (replayable) |

### Related systems

| System | Role |
| --- | --- |
| **UDG** | Source → canonical **ingestion** snapshot |
| **Connectivity** | Live enterprise sync → `BusinessEvent[]` |
| **Intelligence snapshot** | Judgement / briefing presentation models |

Reality Lab should eventually **consume UDG snapshots** for replay. That wiring is deferred — contracts are ready.

---

## Package layout

```
src/data-gateway/
  contracts/      Source, snapshot, mapping, validation, confidence, lineage, audit
  connectors/     Excel · CSV · Manual (+ Dynamics/SAP/Oracle/REST/ADL/Snowflake placeholders)
  validation/     Reusable rules (no customer-specific logic)
  mapping/        Column → canonical field · save/load
  snapshots/      Immutable create + store + replay
  uploads/        Tabular parse helpers
  ingestion/      Pipeline + future mode contracts
  lineage/        Upload · row · source · mapping · timestamp
  audit/          Gateway operation trail
  confidence/     Completeness · Consistency · Freshness · Coverage · Quality
  experience/     Premium upload UI (EXDS styling)
```

---

## Executive Ingestion Snapshot

Every successful upload records:

| Field | Meaning |
| --- | --- |
| Timestamp | `meta.createdAt` |
| Organisation | `meta.organisationId` |
| Profile | `meta.profileId` |
| Product | `meta.productId` |
| Source | `meta.sourceKind` / `connectorId` (audit/lineage only) |
| Confidence | Full dimension score |
| Record count | Canonical rows |
| Validation status | passed / warnings / failed |
| Version | Snapshot version |

Snapshots are **immutable** and **replayable** via `replaySnapshot(id)`.

Type: `UdgExecutiveSnapshot` — intentionally distinct from `@/lib/snapshot` presentation types.

---

## Connectors (v1)

| Connector | Status | Notes |
| --- | --- | --- |
| Excel | Ready (tabular text) | Binary `.xlsx` deferred — export CSV for v1 UI |
| CSV | Ready | Full tabular parse |
| Manual Upload | Ready | Records or tabular text |
| Dynamics | Placeholder | Contract only |
| SAP | Placeholder | Contract only |
| Oracle | Placeholder | Contract only |
| REST API | Placeholder | Contract only |
| Azure Data Lake | Placeholder | Contract only |
| Snowflake | Placeholder | Contract only |

---

## Ingestion modes (future-proof)

| Mode | v1 |
| --- | --- |
| `upload` | Implemented |
| `api` | Implemented (same pipeline) |
| `scheduled` | Contracted |
| `webhook` | Contracted |
| `streaming` | Contracted |

Adding a mode does not require redesigning the snapshot boundary.

---

## Mapping

Configurable, savable mappings:

```
DealerName      → Dealer
Forecast_Qty    → Forecast Quantity
BranchCode      → Branch
ModelCode       → Model
Variant         → Variant
```

APIs: `inferMappingFromHeaders`, `applyMapping`, `saveMapping`, `getMapping`, `listMappings`.

---

## Validation

Reusable checks — **no customer-specific rules**:

- Missing fields · Invalid values · Duplicate rows · Unexpected values  
- Relationship · Date · Hierarchy · Empty dataset · Confidence inputs

---

## Confidence

Every upload scores:

Completeness · Consistency · Freshness · Coverage · Quality → **Overall**

Surfaced in the upload experience and stored on the snapshot for ExecutiveOS visibility.

---

## Lineage

`explainRecordOrigin(snapshotId, recordId)` answers:

- Which upload?
- Which row?
- Which source?
- Which mapping?
- Which timestamp?

Supports explainability for future recommendations.

---

## Upload experience

`DataGatewayUpload` — premium EXDS-styled flow:

Drag & Drop → Progress → Validation → Mapping Preview → Confidence → Import → Snapshot Created

No spreadsheet chrome.

```tsx
import { DataGatewayUpload } from "@/data-gateway";

<DataGatewayUpload
  organisationId="org_demo"
  profileId="profile_exec"
  productId="product_eos"
  sourceKind="csv"
  onSnapshotCreated={(snap) => console.log(snap.meta.snapshotId)}
/>
```

---

## Migration guide

1. **New file-based imports** — use `ingest()` / `DataGatewayUpload`; do not add one-off parsers in features.
2. **Do not feed vendor columns** into Intelligence / Council — only `UdgExecutiveSnapshot.records`.
3. **Connectivity connectors** remain for live sync; UDG is for batch/upload/canonical ingestion. Bridge later via adapters if needed.
4. **Reality Lab** — prefer `replaySnapshot` over re-reading source files.
5. **Confidence** — display `meta.confidence.overall` in admin / trust surfaces when wiring UI.

---

## Tests

`tests/unit/data-gateway/udg.test.ts` — parse, map, validate, confidence, ingest, lineage, placeholders.

---

*Confidence Through Clarity.*
