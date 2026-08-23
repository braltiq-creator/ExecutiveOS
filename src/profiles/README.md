# Executive Intelligence Profiles

Customers buy **executive outcomes**, not integrations.

## Catalog

| Profile | For | Providers (hidden) |
|---------|-----|--------------------|
| Operations Executive | MD / Owner / COO / Ops Manager | Microsoft 365 + Simpro |
| Commercial Executive | CEO / CRO / VP Sales / MD | Microsoft 365 + Salesforce |

## Adding a profile

1. Define `IntelligenceProfile` under `src/profiles/<name>/`
2. Register in `catalog/registry.ts`
3. Add validation scenarios in `validation/scenarios.ts`
4. No Core engine changes required

## Tenant isolation

Each Design Partner selects its own profile via `selectTenantIntelligenceProfile`.
Selections and metrics remain tenant-scoped.
