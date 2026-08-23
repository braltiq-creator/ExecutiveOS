# UDG Migration Guide

## From ad-hoc CSV / Excel imports

**Before:** Feature code parses files and invents field names.

**After:**

```ts
import { ingest } from "@/data-gateway";

const result = ingest({
  organisationId,
  profileId,
  productId,
  sourceKind: "csv",
  connectorId: "udg-csv",
  mode: "upload",
  tabularText: csvString,
});
```

Use `result.snapshot` only. Discard source columns.

## From one-off validation

Replace local checks with `validateRecords` options. Do not add customer-named rule modules.

## Mapping reuse

Save mappings with `saveMapping` and pass `mappingId` on later uploads for the same shape.

## UI

Mount `DataGatewayUpload` for executive ingestion surfaces. Do not restyle as a spreadsheet grid.

## What not to do

- Do not change Core / Council / Packs to accept Excel blobs.
- Do not put Hitachi-specific columns in canonical field enums.
- Do not implement Dynamics/SAP inside UDG until a dedicated integration phase.
- Do not conflate `UdgExecutiveSnapshot` with briefing `ExecutiveSnapshot`.
