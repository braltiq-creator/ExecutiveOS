# Stage 5a — Staging operations handover

**Audience:** Ops / platform operator preparing staging for durable persistence acceptance  
**Harness commit (approved):** `9396fd6c7e8bcde5eb5e06db552a21b1e0d30cbd`  
**Status:** Harness ready · Stage 5a **not accepted** · awaiting staging access  
**Governance:** Staging only · no merge of PR #7 · no production deploy · Stage 5b/5c blocked until all five 5a scenarios pass  

**Secret hygiene:** Never print, commit, paste into chat, or capture passwords/keys in screenshots. Use Cursor environment secrets / Vercel env / password manager only. Screenshots must not show Auth forms with filled passwords, browser password managers, or Supabase dashboard keys.

Related:

- Acceptance criteria: `docs/design/STAGE_5A_DURABLE_PERSISTENCE_ACCEPTANCE.md`
- Harness: `scripts/stage5a-durable-persistence-e2e.mjs`
- Architecture: `docs/design/STAGE_5_HITACHI_CUSTOMER_INTELLIGENCE.md`

---

## 1. Supabase staging project setup requirements

| Requirement | Detail |
|-------------|--------|
| Project | Dedicated **staging** Supabase project — **not** production |
| Auth | Email/password enabled; email confirmation policy known to operators |
| Isolation | Separate project URL and publishable key from production |
| RLS | Must remain enabled on org/pilot/evidence tables after migrations |
| Purpose | Stage 5a durable decision persistence + org isolation only |
| Data | Synthetic manufacturing CSV allowed for User A snapshot fuel — **never** label as Hitachi live intelligence |

Confirm project ref / URL privately with the agent via secrets — do not commit the project URL into docs if it is sensitive; the agent only needs the env var value at runtime.

---

## 2. Required migrations and deployment order

Apply SQL migrations from `supabase/migrations/` **in numeric order** on the staging project:

| Order | File | Why Stage 5a needs it |
|------:|------|------------------------|
| 1 | `001_executive_onboarding.sql` | Base schema |
| 2 | `002_executive_memory.sql` | Base schema |
| 3 | `003_executive_decisions.sql` | Legacy decision tables (if present) |
| 4 | `004_executive_meetings.sql` | Base schema |
| 5 | `005_strategic_initiatives.sql` | Base schema |
| 6 | `006_organizations.sql` | Orgs + `is_active_organization_member` |
| 7 | `007_billing.sql` | Dependent org surface |
| 8 | `008_integrations.sql` | Dependent |
| 9 | `009_knowledge_graph.sql` | Dependent |
| 10 | `010_performance_indexes.sql` | Indexes |
| 11 | **`011_pilot_operating_loop.sql`** | **Required** — `pilot_executive_snapshots`, `pilot_outcome_portfolios`, `pilot_decisions`, `pilot_actions` + RLS |
| 12 | `012_organization_creator_select_bootstrap.sql` | Org bootstrap select |
| 13 | `013_verified_connections_evidence.sql` | Organisation evidence (recommended) |
| 14 | `014_organization_data_sources.sql` | Weekly data sources (recommended) |
| 15 | `015_manufacturing_evidence_graph.sql` | MEG (recommended; not a 5a UI gate) |

**Minimum for 5a:** through **`011`**. Prefer through **`015`** so staging matches the intended pilot stack.

**Deploy order for the app**

1. Migrations applied on staging Supabase.  
2. Vercel **Preview/Staging** env configured (§5) and redeployed from branch `cursor/phase-2-immersive-intelligence-b8a3` (or agreed staging branch) at or after harness commit `9396fd6…`.  
3. Provision users/orgs (§3–4).  
4. Activate User A snapshot (§4).  
5. Inject harness secrets into the Cloud Agent environment.  
6. Run harness (§6).

No new/unapproved migrations for Stage 5a.

---

## 3. User A and User B provisioning requirements

| Actor | Requirement |
|-------|-------------|
| **User A** | Staging Auth user; email confirmed if required; password stored only in secrets (`STAGE5A_USER_A_EMAIL` / `STAGE5A_USER_A_PASSWORD`) |
| **User B** | Distinct Auth user; password in `STAGE5A_USER_B_EMAIL` / `STAGE5A_USER_B_PASSWORD` |
| Separation | User A and User B must **not** share organisation membership |
| Roles | Prefer `owner` or `executive` with active membership (see `PILOT_PROVISIONING.md`) |
| Browser hygiene | Separate browser profiles when manually verifying; clear site data between users on shared machines |

Optional (for report clarity): `STAGE5A_ORG_A_ID`, `STAGE5A_ORG_B_ID` as org UUIDs — never commit these if treated as sensitive; IDs alone are usually fine in acceptance notes.

---

## 4. Organisation membership and snapshot activation procedure

### 4.1 Organisations

1. Sign in as **User A** → `/organization` → **Create organisation**  
   - Suggested display name: `Stage5a Org A` (staging only).  
2. Confirm active membership for User A (role `owner` or `executive`).  
3. Sign out; clear site data if using the same browser.  
4. Sign in as **User B** → create **separate** organisation `Stage5a Org B`.  
5. Confirm User B is **not** a member of Org A.

### 4.2 User A — manufacturing snapshot activation (5a fuel)

1. As User A, open Snapshot Studio: `/onboarding/snapshot`.  
2. Upload a **synthetic** manufacturing forecast CSV/XLSX (repo fixture `fixtures/manufacturing/forecasting/demo-manufacturing-forecast.csv` is allowed **only** as persistence fuel).  
3. Confirm mapping → validation → readiness (Dataset % ≠ Judgement %).  
4. Create **immutable** Executive Snapshot.  
5. **Activate** snapshot into Command Centre (`/today`).  
6. Confirm durable path is eligible: Decision Intelligence (or manufacturing decision surface on `/today`) must **not** show `ui_cache_only` as the authoritative mode for this session. Prefer `data-persistence-mode="durable_eligible"` when that attribute is present.  
7. **Do not** use `/dev/phase2-preview` as Stage 5a SoT (that surface remains UI-cache / demonstration).

User B needs no snapshot for isolation failure proof, but may create an empty/own org snapshot later; User B must not see User A’s decision marker.

---

## 5. Vercel staging environment variable configuration

Configure on the **staging / Preview** Vercel project that the harness will hit (names only — set values in Vercel UI):

| Variable | Required value / rule |
|----------|------------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Staging Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Staging publishable (anon) key |
| `NEXT_PUBLIC_EXECUTIVEOS_MOCK` | **`false`** (exact string) |
| `NEXT_PUBLIC_APP_URL` | Staging app origin (recommended) |
| `SYSTEM_ADMIN_EMAILS` | Optional operator emails only |

**Do not** point staging at production Supabase.  
**Do not** set `MOCK` to `true` or leave it unset if you need the durable Supabase backend in non-production runtimes (`getPilotPersistence` uses Supabase when `NEXT_PUBLIC_EXECUTIVEOS_MOCK === "false"`).

After env change: redeploy staging so the Next bundle sees `NEXT_PUBLIC_*` values.

### Cloud Agent secrets (for harness execution)

Provide via Cursor environment secrets (not chat):

- Same three `NEXT_PUBLIC_*` as above (for local `next start` if used)  
- `STAGE5A_USER_A_EMAIL`, `STAGE5A_USER_A_PASSWORD`  
- `STAGE5A_USER_B_EMAIL`, `STAGE5A_USER_B_PASSWORD`  
- `STAGE5A_STAGING_APP_URL` = staging HTTPS origin (recommended)  
- Optional org ids  

---

## 6. Exact harness execution command

Against **deployed staging**:

```bash
# Secrets must already be present in the environment (not printed).
# NEXT_PUBLIC_EXECUTIVEOS_MOCK must be exactly: false
# STAGE5A_STAGING_APP_URL must be the staging origin (HTTPS).

node scripts/stage5a-durable-persistence-e2e.mjs
```

Against **local** server using the same staging Supabase env:

```bash
npm run build
npm run start -- -p 3013
# In the same env (MOCK=false + staging Supabase + STAGE5A_USER_*):
export STAGE5A_STAGING_APP_URL=http://127.0.0.1:3013
node scripts/stage5a-durable-persistence-e2e.mjs
```

**Exit codes**

| Code | Meaning |
|-----:|---------|
| `0` | All five scenarios `true` — candidate for Stage 5a acceptance review |
| `1` | Ran but one or more scenarios failed |
| `2` | Blocked (missing secrets or MOCK ≠ `false`) |

---

## 7. Expected acceptance report structure

Artifact: `/opt/cursor/artifacts/stage5a_acceptance_report.json`

```json
{
  "stage": "5a",
  "startedAt": "<ISO-8601>",
  "finishedAt": "<ISO-8601>",
  "baseUrl": "<staging origin — no secrets>",
  "mockFlag": "false",
  "missingSecrets": [],
  "blocked": false,
  "persistenceMode": "durable_eligible",
  "decisionMarker": "Stage5a durable <timestamp>…",
  "scenarios": {
    "authenticatedWrite": true,
    "refreshAfterCacheClear": true,
    "logoutLogin": true,
    "separateBrowser": true,
    "orgIsolation": true
  },
  "screenshots": [
    "/opt/cursor/artifacts/stage5a_after_record.png",
    "/opt/cursor/artifacts/stage5a_after_refresh_cache_cleared.png",
    "/opt/cursor/artifacts/stage5a_after_relogin.png",
    "/opt/cursor/artifacts/stage5a_second_browser.png",
    "/opt/cursor/artifacts/stage5a_org_b_isolation.png"
  ],
  "notes": ["Stage 5a ACCEPT — all durable scenarios passed."],
  "reportPath": "/opt/cursor/artifacts/stage5a_acceptance_report.json"
}
```

On blocked dry-run, `blocked: true`, `missingSecrets` populated, and every scenario remains `null` — **not** acceptance.

---

## 8. Evidence that all five tests exercised real Supabase persistence and RLS

CI green and memory-contract unit tests **do not** satisfy this section.

### 8.1 Per-scenario proof (required)

| Scenario | Harness behaviour | Evidence that SoT is Supabase + RLS |
|----------|-------------------|-------------------------------------|
| **1. Authenticated write** | User A records decision on activated `/today` path | `persistenceMode` is **not** `ui_cache_only`; screenshot without password fields; staging Supabase Table Editor (operator) shows `pilot_decisions` / `pilot_outcome_portfolios` row for Org A with `executiveRecording` in payload — **no keys in screenshot** (blur project URL if needed) |
| **2. Refresh after cache clear** | Harness clears `localStorage` + `sessionStorage`, reloads | Decision marker still present → cannot be UI-cache-only |
| **3. Logout / login** | Sign out → User A sign in again | Marker restored via auth session + server load — not leftover anonymous storage |
| **4. Separate browser** | New Playwright browser context | Marker restored with no shared cookie jar from context A |
| **5. Org isolation** | User B session | Marker **absent**; optional operator check: querying Org A decision as User B returns empty/denied under RLS |

### 8.2 Hard exclusions (do not treat as 5a pass)

- `/dev/phase2-preview` UI-cache refresh  
- `NEXT_PUBLIC_EXECUTIVEOS_MOCK` ≠ `false`  
- Memory pilot backend / unit isolation tests alone  
- Screenshots that include passwords, tokens, or full anon keys  
- Production project data  

### 8.3 Acceptance gate

Stage 5a may be marked **accepted** only when:

1. Harness exit code `0`  
2. All five `scenarios.*` are `true`  
3. `persistenceMode` documents durable eligibility (not `ui_cache_only`)  
4. Operator confirms staging DB row for Org A (private note; no secrets in PR)  
5. Approver reviews evidence on PR #7  

Until then: **Stage 5b and 5c remain blocked.**

---

## Operator checklist (copy)

- [ ] Staging Supabase project created (≠ production)  
- [ ] Migrations `001`→`011` minimum (`015` preferred) applied  
- [ ] Vercel staging env: Supabase URL/key + `MOCK=false` + redeploy  
- [ ] User A + User B Auth users created  
- [ ] Separate orgs + active membership  
- [ ] User A snapshot uploaded + activated on `/today`  
- [ ] Cloud Agent secrets set (no chat paste)  
- [ ] `STAGE5A_STAGING_APP_URL` set  
- [ ] `node scripts/stage5a-durable-persistence-e2e.mjs` → exit `0`  
- [ ] Report + screenshots attached; DB confirmation noted privately  
- [ ] Approver accepts 5a before authorising 5b  

---

*Handover complete. Agent stops here pending staging access.*
