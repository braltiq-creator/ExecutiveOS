# Mapping Guide

Vendor Object → Canonical Object → Business Event

```ts
import { mapVendorToBusinessEvent } from "@/connectivity";

const result = mapVendorToBusinessEvent({
  vendor: {
    system: "sap",
    objectType: "Invoice",
    id: "inv-1",
    fields: { amountCents: 1050, status: "Paid" },
  },
  definition: {
    id: "sap-invoice",
    vendorObjectType: "Invoice",
    entityType: "Metric",
    eventType: "status_changed",
    fields: [
      { from: "amountCents", to: "amount", transform: "cents_to_units", required: true },
      { from: "status", to: "status", transform: "lower", required: true },
    ],
  },
  sourceSystem: "mock",
  connectorId: "connector-sap",
  timestamp: new Date().toISOString(),
});
```

Supports field mapping, transforms, unit conversion, relationships, validation, and error handling.
Vendor keys must never appear above the connector boundary.
