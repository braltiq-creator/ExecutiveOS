# ExecutiveOS Technical Debt

> **Canonical register:** [`docs/release/TECHNICAL_DEBT_REGISTER.md`](./docs/release/TECHNICAL_DEBT_REGISTER.md) (Phase 33).

## Snapshot (V1)

### Critical before multi-instance GA

- Persist platform module stores (adaptive, commercial, experiments, memory, …)
- Distributed rate limiting
- External log aggregation
- Replace hardcoded demo tenant IDs on admin/value paths

### High (architecture)

- Dual agents (`src/agents` vs `src/lib/agents`)
- Triple design systems — freeze Experience for exec UI; ui kit for forms
- Thin e2e beyond smoke

### Done in Phase 33

- CI workflow (`.github/workflows/ci.yml`)
- Removed dead `RoutePlaceholder`
- Module documentation + release registers

## Debt score

**Moderate** — shippable for design partners; clear P0 path to enterprise GA.
