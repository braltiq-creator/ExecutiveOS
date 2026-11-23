# Stage 5a — Authenticated durable persistence (acceptance)

**Status:** **BLOCKED — awaiting staging access** (harness approved at `9396fd6`)  
**Authorised:** Yes (architecture + 5a → 5b → 5c approved)  
**Ops handover:** `docs/design/STAGE_5A_STAGING_OPS_HANDOVER.md`  
**Scope:** Staging only · real Supabase auth + RLS · activated organisation snapshot  
**Out of scope:** Hitachi customer export (5b) · recurring upload loop (5c) · merge / production deploy · migrations without approval · further implementation unless a genuine defect is found

---

## Objective

Prove ExecutiveOS records executive decisions as **durable Supabase SoT** for a dedicated staging organisation — not UI cache, not demonstration fixture as live SoT.

Required proofs:

| # | Scenario | Pass criteria |
|---|----------|---------------|
| 1 | Authenticated write | User A in staging org records a decision; row appears in `pilot_decisions` / portfolio via durable path |
| 2 | Refresh | Same browser, clear **only** navigation (or hard refresh); decision restored from server after UI cache cleared |
| 3 | Logout / login | Sign out → sign in as User A; decision artefacts restored |
| 4 | Separate browser | Fresh browser context as User A; same decision restored |
| 5 | Org isolation | User B (other org) cannot read User A’s snapshot/decisions |

Honesty: `/dev/phase2-preview` remains **UI CACHE ONLY** and is **not** the Stage 5a evidence surface.

---

## Current agent environment (2026-11-22)

| Check | Result |
|-------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | **Missing** |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **Missing** |
| `NEXT_PUBLIC_EXECUTIVEOS_MOCK=false` | **Missing** (defaults to mock in non-production) |
| Staging test users A/B | **Missing** |
| Docker / local Supabase | **Unavailable** |
| Cursor app secrets for this project | **None bound** |

**Consequence:** Authenticated durable E2E against real staging Supabase **cannot execute** in this Cloud Agent until secrets and staging org users are provided. Memory-contract / unit isolation tests remain green but are **not** Stage 5a acceptance.

Secrets requested via environment setup (do not paste into chat):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_EXECUTIVEOS_MOCK` (= `false`)
- `STAGE5A_USER_A_EMAIL` / `STAGE5A_USER_A_PASSWORD`
- `STAGE5A_USER_B_EMAIL` / `STAGE5A_USER_B_PASSWORD`
- Optional: `STAGE5A_STAGING_APP_URL`, `STAGE5A_ORG_A_ID`, `STAGE5A_ORG_B_ID`

External ops: dedicated staging Supabase project; migrations ≥ `011` (prefer `013`–`015`); two Auth users with separate organisations + active membership.

---

## Procedure (when secrets land)

Harness: `scripts/stage5a-durable-persistence-e2e.mjs`

```bash
# MOCK must be false; point at staging Supabase
export NEXT_PUBLIC_EXECUTIVEOS_MOCK=false
# … remaining STAGE5A_* and Supabase vars from Cursor Secrets …

# Either hit deployed staging:
export STAGE5A_STAGING_APP_URL=https://<staging-host>

# Or local next with same env:
npm run build && npm run start -- -p 3013
export STAGE5A_STAGING_APP_URL=http://127.0.0.1:3013

node scripts/stage5a-durable-persistence-e2e.mjs
```

### Operator prep (once)

1. Create staging org **Stage5a Org A** for User A; create **Stage5a Org B** for User B.  
2. As User A: Snapshot Studio → upload **staging synthetic** manufacturing CSV (demo fixture is allowed **only** as persistence fuel — never label as Hitachi live intelligence).  
3. Activate snapshot → `/today` manufacturing. Confirm persistence mode becomes durable-eligible when snapshot+org active.  
4. Run harness; capture artifacts under `/opt/cursor/artifacts/stage5a_*`.

### Pass evidence required

- Screenshots: record, after refresh (localStorage cleared), after re-login, second browser, User B denied/isolation  
- Harness JSON report with `backendKind` / durable flags  
- Confirmation `data-persistence-mode` ≠ `ui_cache_only` on the authenticated manufacturing path (not Phase 2 preview)  
- Explicit statement: no production deploy; no merge

---

## Relationship to unit tests

| Suite | Proves | Does **not** prove |
|-------|--------|---------------------|
| `pilot-access-hardening.test.ts` | Memory-contract org isolation, actor gates | Live Supabase / cookies / browsers |
| Stage 4 Playwright preview E2E | UI-cache refresh honesty | Durable SoT |
| **Stage 5a harness** | Real auth + Supabase + multi-browser | Hitachi data (5b) |

---

## Exit criteria → unlock Stage 5b

Stage 5a is **COMPLETE** only when all five scenarios pass against staging Supabase with `MOCK=false` and evidence is attached to PR #7.

Until then: **do not start Stage 5b** (Hitachi export land).
