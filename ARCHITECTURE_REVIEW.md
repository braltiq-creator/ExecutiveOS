# ExecutiveOS Architecture Review

> **Phase 33 (2026-07-26):** Canonical release artifacts live in [`docs/release/`](./docs/release/). This file summarises architecture for Version 1.

## Overview

ExecutiveOS is a Next.js 16 App Router platform. **Core intelligence** produces deterministic executive snapshots. **Platform engines** (strategy, memory, scenarios, trust, adaptive, outcomes, growth, commercial, experiments) attach presentation and learning **above** Core. **Experience 2.0** renders the executive product.

```
App pages → runtime/experience → profile projection
    → scenarios → memory → strategy → trust → adaptive → council
    → Experience Brief (presentation only)
```

Persistence for classic domain data remains Supabase (RLS). Newer platform engines are largely in-memory for design-partner V1 (see Known Issues KI-002).

## Strengths

- Clear Core vs presentation boundary (Adaptive/Trust/Experience never rewrite engines)
- Consistent platform module pattern: `index` · `reset` · dashboard · attach-today
- Multi-tenant org scoping on persisted paths
- Explainability and adaptive governance as first-class surfaces
- Provider certification depth (M365, Salesforce, Simpro)

## Weaknesses (accepted or scheduled)

| Theme | Detail | Register |
|-------|--------|----------|
| Dual stacks | Agents, memory, outcomes naming overlap | TD-010–013 |
| Triple UI kits | Experience + ui + legacy Executive* | TD-012 |
| In-memory platforms | Not multi-instance safe | TD-001 |
| Ops | Rate limit + logs | TD-002–003 |
| Primary nav depth | Knowledge/Reports foundations | KI-001 |

## Simplification recommendations

1. No new design-system or memory/agents trees.
2. Prefer Council (`src/agents`) for new multi-agent work; migrate Advisors UI later.
3. Keep `lib/outcomes` (portfolio) vs `outcomes` (value engine) — document, don’t merge casually.
4. Delete unused abstractions when found (Phase 33 removed `RoutePlaceholder`).
5. Persist platform stores before horizontal scale.

## Scores (Phase 33)

| Lens | Score |
|------|------:|
| Design-partner / controlled commercial | **84 / 100** |
| Multi-instance enterprise GA | **68 / 100** |

See [`docs/release/V1_RELEASE_CHECKLIST.md`](./docs/release/V1_RELEASE_CHECKLIST.md).
