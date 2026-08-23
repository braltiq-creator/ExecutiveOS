# Design Partner Security Posture

## Forbidden claims

Do **not** claim unless genuinely true and evidenced:

- SOC 2 certified
- ISO 27001 certified
- Enterprise compliant
- Guaranteed encryption at rest (unless platform capability is documented and verified)
- Automatic deletion SLA

**IMPLEMENTED:** `buildDesignPartnerSecurityPosture().forbiddenClaims`

## Honest claims

| Topic | Statement | Status |
|-------|-----------|--------|
| Data ingestion | Uploaded files are processed through the Universal Data Gateway | IMPLEMENTED |
| Source system access | No direct source-system credentials required for the pilot | IMPLEMENTED |
| Source data | Works from customer-provided exports | IMPLEMENTED |
| Snapshots | Imported datasets stored as immutable Executive Snapshots | IMPLEMENTED |
| Audit | Ingestion and snapshot lineage recorded | IMPLEMENTED (process-local stores) |
| Tenant isolation | Library / audit / metrics / feedback scoped by organisation id | SUPPORTED BY CURRENT ARCHITECTURE |
| Retention | Pilot retention policy not yet configured (unless tenant retention fields set) | NOT YET IMPLEMENTED (configurable architecture exists on Tenant) |
| Role-based permissions | Organisation roles exist; fine-grained RBAC not fully enforced on every surface | NOT YET IMPLEMENTED |

## Retention

Do not invent a retention policy.

If not configured: **"Pilot retention policy not yet configured."**

Tenant templates include retention day fields — cite them only when `retentionConfigured` is true.

## Access control

Design Partner data for organisation A must not appear in organisation B listings.

**IMPLEMENTED (test-backed):** `probeDesignPartnerIsolation`  
**NOT YET IMPLEMENTED:** Durable multi-instance auth-bound enforcement across all production stores (session/memory stores remain the current SoT for Studio library).

## Audit trail (operating loop)

Design Partner audit events (executive-readable):

- Data uploaded
- Mapping confirmed
- Validation completed
- Snapshot created / activated
- Intelligence generated
- Decision opened
- Option selected
- Action created / status changed

Fields: timestamp, actor, event, object, snapshot / decision / action relationship.

**IMPLEMENTED:** `recordDesignPartnerAudit` + extended UDG audit action ids.  
**NOT YET IMPLEMENTED:** Executive-facing audit history page (API/store ready).
