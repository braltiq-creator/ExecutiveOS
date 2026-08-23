# Pilot Readiness Toolkit

Internal toolkit for Braltiq implementation and customer success.

## Lifecycle

Prospect → Invited → Provisioning → Connecting Providers → Executive Discovery → Validation → First Executive Brief → Active Pilot → Review → Pilot Complete

## One-click provision

```ts
import { provisionDesignPartner } from "@/pilot";

const result = provisionDesignPartner({
  partnerName: "Harbour Field",
  industry: "Field Services",
  intelligenceProfileId: "operations_executive",
  administratorEmail: "cs@braltiq.com",
  region: "au",
});
```

## Health

```ts
import { buildPilotHealthSnapshot } from "@/pilot";

const health = buildPilotHealthSnapshot({
  tenantId: result.tenantId,
  profileId: "operations_executive",
});
// readiness score, diagnostics, checklist, success metrics
```

## Admin

`/admin/pilots` — operational dashboard for CS / implementation.
