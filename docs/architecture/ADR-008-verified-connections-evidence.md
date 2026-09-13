# ADR-008: Verified Connections & Evidence Infrastructure

**Status:** Accepted  
**Date:** 2026-09-13  
**Deciders:** Founder, Principal Engineer  
**Phase:** 37  

## Context

Phase 36 established the Production Truth Boundary: Discovery must not invent Reality Lab fixtures or treat fabricated connector claims as evidence. ExecutiveOS still lacked a durable, organisation-scoped model that distinguishes:

1. OAuth/credential **authentication**
2. Source **verification**
3. Retrieved **evidence**
4. Supported **claims**

In-process M365/Simpro registries are not Production SoT. Durable `organization_integrations` (migration 008) already exists and must not be duplicated.

## Decision

1. **Connection SoT** remains `organization_integrations`, extended with `connection_status`, `authentication_status`, `verification_status`, scopes, and verification timestamps (migration 013).  
2. **A connection is not evidence.** Authentication may enable inspection; verification confirms source access; only stored evidence may support Discovery/claims.  
3. **Evidence ledger** (`organization_evidence`) stores attributable facts with provenance `DIRECT | USER_PROVIDED | DERIVED | INFERRED`. `SYNTHETIC` is rejected by database check and application guards.  
4. **Claims** (`organization_claims`) require one or more evidence IDs; classifications cannot silently promote DERIVED/INFERRED to DIRECT.  
5. **Discovery** consumes verified evidence via `discoverFromVerifiedEvidence`; empty evidence → honest empty state (Phase 36 preserved).  
6. **Snapshot Studio** Excel/user-upload path remains unchanged; multi-source snapshot bundles are preparatory only.  
7. **Knowledge Graph preparation** stores evidence-backed entity/relationship stubs, not a full graph rewrite.  
8. In-memory provider registries remain runtime caches for Reality Lab/tests — never Production truth.

## Consequences

### Positive

- Clear lifecycle: not connected → authenticated → verification required → verified → evidence → claims  
- Phase 36 truth boundary preserved  
- RLS continues via `is_active_organization_member`  

### Negative / trade-offs

- Existing `status`/`health_status` columns remain for backward compatibility alongside lifecycle columns  
- Live Graph/Simpro ingestion is intentionally out of scope for Phase 37  

## Alternatives considered

| Alternative | Why rejected |
|-------------|--------------|
| New parallel connection registry tables | Duplicates 008; split-brain risk |
| Treat connected OAuth as Discovery evidence | Violates “connection ≠ evidence” |
| Allow SYNTHETIC in Production tables with app filter only | Fail-open risk |

## References

- Migration `013_verified_connections_evidence.sql`  
- Module `src/verified-evidence/`  
- Phase 36 commit `b636e5c`  
