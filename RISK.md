# ExecutiveOS Risk Register — Contention Points

> Evidence-based inventory of architectural contention points, scored against
> **persistency**, **memory management**, **multi-tenant support**, and
> **24/7 availability metrics**. Generated 2026-11-04.
>
> Companion to [`docs/release/KNOWN_ISSUES.md`](./docs/release/KNOWN_ISSUES.md)
> and [`docs/release/TECHNICAL_DEBT_REGISTER.md`](./docs/release/TECHNICAL_DEBT_REGISTER.md).

## Measured baseline (from code, not docs)

| Metric | Count | Source |
|--------|------:|--------|
| Module-level `new Map()/Set()` singleton stores | 109 | `grep -rnE "^(const\|let) \w+ = new (Map\|Set)<" src` |
| `northline` demo-tenant references | 109 | `grep -rn northline src` |
| Files using the correct `pilot-persistence` abstraction | 6 | `grep -rln getPilotPersistence src` |
| Module `reset.ts` endpoints (volatile state reset) | 11 | `find src -name reset.ts` |
| Rate limiter | in-process `Map` | `src/lib/security/rate-limit.ts` |
| Logger | 200-entry in-process ring buffer | `src/lib/logging/logger.ts` |
| Health probe route (`/api/health`) | **missing** | only oauth/webhook/stripe routes exist |

**Adoption gap:** the proven `pilot-persistence` backend resolver (memory ↔ Supabase,
same contract) is adopted by only **6 of ~130** store files.

---

## CP1 — Dual Agent Stacks

| Stack | Path | Files | Nature |
|-------|------|------:|--------|
| Council | `src/agents/` | 9 | Deterministic, no-LLM, engine-only |
| Advisors | `src/lib/agents/` | 13 | LLM-backed, UI-wired, stateful |

**Critical points**
1. **Persistency** — `src/lib/agents/conversation.ts` + `memory.ts` hold chat state in-process; conversations lost on deploy (KI-012). Council is stateless, so the durable gap lives entirely in the `lib` stack.
2. **Multi-tenant** — `lib/agents` has no org-scoping contract equivalent to Council's `context.ts`; advisor memory is keyed per-process, not per-tenant.
3. **Availability metric** — two orchestrators = two latency/error surfaces. Only `lib/agents/service.ts` emits logs; Council emits none. No single agent success-rate / p95 SLO.

**Redundant:** second `orchestrator.ts`, `registry.ts`, `context.ts` in `lib/agents`.
**Align:** make `lib/agents` a thin presenter over Council (`conveneExecutiveCouncil`); keep only conversation persistence.
**Demo win:** one agent trace, one latency number.

---

## CP2 — UI Design Systems (documented "triple", actually quadruple)

| Layer | Path | Count | Intended role |
|-------|------|------:|---------------|
| Legacy `Executive*` | `src/design-system/components/` | 18 | "do not expand" remnants |
| Legacy experience | `src/design-system/executive-experience/` | ~30 | older exec kit (undocumented in KI-006) |
| Experience 2.0 | `src/experience/design-system/` | 12 | **canonical exec UI** |
| UI kit | `src/components/ui/` | ~40 + stories | forms / admin / Storybook |

**Critical points**
1. **Memory / bundle** — four token sources (`design-system/tokens.css`, `tokens.ts`, experience tokens, `globals.css`) ship overlapping CSS → larger bundle, slower LCP on `/dashboard`.
2. **Multi-tenant branding** — tenant `branding.primaryColor` can theme only one token system cleanly; four systems make per-tenant theming unreliable across surfaces.
3. **Availability / a11y metric** — Storybook a11y addon covers only `components/ui`; the two legacy kits have no a11y gate → no uniform accessibility SLO.

**Redundant:** `design-system/components/` (18) + `design-system/executive-experience/` (~30) ≈ 48 files.
**Align:** migrate exec surfaces to `experience/design-system`; keep `components/ui` for admin; collapse to one token source.
**Demo win:** consistent visual language, faster first paint.

---

## CP3 — Triple (plus) Memory Layers

| Layer | Path | Store type | Role |
|-------|------|-----------|------|
| Session memory | `src/intelligence/executive-memory/` | `store/in-memory-store.ts` + seed | Core session reasoning |
| Org memory (declared SoT) | `src/memory/` | 8 in-process Maps | Organisational learning |
| CRUD memory | `src/lib/memory/` | Supabase | Persisted exec memory |
| Advisor memory | `src/lib/agents/memory.ts` | in-process | advisor recall |

**Critical points**
1. **Persistency split-brain** — only `lib/memory` is Supabase-backed. The declared source of truth (`src/memory`, 8 Maps) is volatile — the learning SoT is the least durable layer (KI-002/KI-007).
2. **Memory management** — `src/memory/playbooks/evolve.ts` and `episodes/store.ts` grow unbounded (no TTL/eviction, unlike the logger's 200 cap) → RAM creep under 24/7 load.
3. **Multi-tenant** — `src/memory/framework/isolation.ts` exists, but Maps are process-global keyed by string; no RLS-equivalent DB boundary → key-collision leakage risk.

**Redundant:** three "memory" names, one contract needed.
**Align:** route `src/memory` through `pilot-persistence` (memory ↔ Supabase) with no API change.
**Demo win:** learning survives restart across a multi-day pilot.

---

## CP4 — Overlapping Outcomes (`src/outcomes` vs `lib/outcomes`)

| Module | Path | Files | Role |
|--------|------|------:|------|
| Value engine | `src/outcomes/` | 7 Maps | ROI learning |
| Portfolio SoT | `src/lib/outcomes/` | `derive`, `mock-portfolio`, `types` | `/outcomes` page data |

**Critical points**
1. **Persistency** — `src/outcomes` ROI data is 7 in-process Maps; `lib/outcomes` is mock-only (`mock-portfolio.ts`); no outcome survives a deploy.
2. **Naming collision** — `@/outcomes` vs `@/lib/outcomes` is an active wrong-import footgun ("document, don't merge casually").
3. **Availability metric** — ROI/value is the headline design-partner metric, yet has zero persistence and no success instrumentation; cannot show "value realised over 30 days."

**Redundant:** `mock-portfolio.ts` once real data flows.
**Align:** rename to intent (`@/value-engine` vs `@/portfolio`); back both with `pilot-persistence`.
**Demo win:** real cumulative ROI.

---

## CP5 — Hardcoded Demo Tenant (`northline`) — cross-cutting blocker

**Inventory:** 109 `northline` refs. Critical ones on **production paths**:
`app/activate/page.tsx` (`organizationId = "tenant-northline"`), `app/strategy/page.tsx`,
`app/settings/adaptive/page.tsx`,
`intelligence/.../executive-snapshot-builder.ts` (Simpro/SF/M365 IDs), admin control components.

**Critical points**
1. **Multi-tenant** — real routes resolve tenant from a constant, not `requireAppAccess()` session context → a second tenant would see Northline data. #1 multi-tenant GA blocker (KI-008).
2. **Persistency** — `runtime/tenant/registry.ts` is itself one `new Map` seeded by `createNorthlineTenant()`; the tenant catalog is volatile and single-org.
3. **Availability** — `isMockMode()` is fail-safe (off in prod), but hardcodes mean prod pages still reference demo IDs → silent empty/incorrect states instead of clean failures.

**Redundant:** page-level `"tenant-northline"` literals.
**Align:** replace with `getActiveTenant(session)`; keep Northline only in `simulation/`, `fixtures/`, seed files.
**Demo win:** stand up a second demo tenant with zero code change.

---

## Cross-cutting — 24/7 Availability Instrumentation

**Inventory**
- `src/lib/observability/health.ts` — good: DB/AI/integrations/queue probes + uptime. **Not exposed via any route.**
- `src/lib/logging/logger.ts` — 200-entry in-process ring buffer, stdout JSON (KI-004).
- `src/lib/security/rate-limit.ts` — in-process `Map` buckets (KI-003).

**Critical fixes**
1. **Expose health** — add `src/app/api/health/route.ts` returning the existing `SystemHealthSnapshot`; logic exists but is unreachable by uptime monitors / load balancers.
2. **Externalize state** — logger ring buffer + rate-limit buckets reset per instance; uptime, error-rate and limit counters are per-pod and lost on deploy. Move to Redis / log drain for real SLOs.
3. **Unify the 109 stores** — every in-process Map is an availability liability (lost on restart, not shared across instances). `pilot-persistence` is the proven pattern, adopted by only 6/~130 files.

---

## Summary Scorecard

| Theme | Redundant (delete/collapse) | Align to | Demo win |
|-------|------|------|------|
| Agents | 2nd orchestrator/registry/context in `lib/agents` | Council for reasoning | one agent latency SLO |
| UI | `design-system/components` + `executive-experience` (~48 files) | `experience/design-system` + `components/ui`, one token file | faster LCP, consistent look |
| Memory | 3 names → 1 contract | `pilot-persistence` backend | learning survives restart |
| Outcomes | `mock-portfolio.ts` | rename + persist both | real cumulative ROI |
| Tenant | 109 `northline` literals in app paths | `getActiveTenant(session)` | 2nd tenant, zero code change |
| Ops | per-pod logger + rate-limit, no health route | Redis + `/api/health` | real uptime/error dashboards |

## Highest-leverage move

Adopt the already-built `pilot-persistence` resolver across the 109 Maps and replace
tenant literals with session context. That single pattern simultaneously addresses
persistency, memory durability, multi-tenancy, and availability — and it already
exists in the repo (proving the right shape is known); it is simply under-adopted (6/130).

## Severity / effort matrix

| CP | Severity | Effort | Related KI/TD |
|----|----------|--------|---------------|
| CP5 Tenant hardcodes | **Critical** (multi-tenant correctness) | Medium | KI-008 |
| CP-X In-memory stores (persistency) | **Critical** (durability) | High | KI-002 |
| Ops (health route, rate limit, logs) | High | Medium | KI-003, KI-004 |
| CP3 Memory layers | High | Medium | KI-007 |
| CP1 Agent stacks | Medium | Medium | KI-005 |
| CP2 UI systems | Medium | High | KI-006 |
| CP4 Outcomes overlap | Medium | Low | TD (naming) |
