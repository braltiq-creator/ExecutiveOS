# Pilot Access & Production Readiness

**Date:** 2026-08-23 (updated after M3/M4/M5 hardening)  
**Prior audit:** RED — DO NOT INVITE USERS YET  
**Nature:** Access hardening only — not a product phase  

---

## Final verdict

# AMBER — READY AFTER MANUAL SETUP

Code-level access blockers M3/M4/M5 are addressed. Invite is still blocked until operators complete Production deploy + env + migration steps below.

**Not GREEN** because: Production deployment URL / Vercel project / applied migration `011` / live four-browser run against Production remain **unverified** from this workspace.

---

## Checklist legend

| Code | Meaning |
|------|---------|
| **A. READY** | Met in code / verified locally |
| **B. READY WITH MANUAL SETUP** | Requires operator steps before invite |
| **C. BLOCKED** | Not met |

---

## 1. Deployment

| Requirement | Current state | Evidence | Risk | Action | Owner | Status |
|-------------|---------------|----------|------|--------|-------|--------|
| Production URL | Still unverified | No linked Vercel project in repo | Wrong host | Confirm Production URL | Ops | **B** |
| Deploy pilot commit | Local tree includes hardening; remote may lag | `git status` historically unpushed | Stale Production | Commit, push, deploy Production | Eng/Ops | **B** |
| Build | Local `npm run build` pass | CI/local | — | Confirm Vercel Production build green | Ops | **A** (local) / **B** (remote) |
| Env | Must set `NEXT_PUBLIC_EXECUTIVEOS_MOCK=false` | `src/lib/mock/mode.ts` | Mock identity | Set on Vercel Production | Ops | **B** |
| Supabase | Migration `011_pilot_operating_loop.sql` added | `supabase/migrations/011_*.sql` | Missing tables | Apply 001–011 on intended project | Ops | **B** |

### Production env (names only)

| Variable | Required |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes |
| `NEXT_PUBLIC_EXECUTIVEOS_MOCK` | **Must be `false`** (runtime also forces mock off in production) |
| `NEXT_PUBLIC_APP_URL` | Recommended |
| `SYSTEM_ADMIN_EMAILS` | Recommended |

---

## 2. Authentication

| Item | Status |
|------|--------|
| Provider | Supabase Auth — **A** |
| Mock in production | **Forced OFF** even if unset/`true` — **A** |
| Explicit `MOCK=false` recommended | Ops checklist — **B** |
| Login / signup / logout | Existing — **A** |
| Password reset | Dashboard only — **B** |

---

## 3–4. User / organisation isolation

| Item | Status |
|------|--------|
| Membership + RLS (org tables) | Existing migration 006 — **A** |
| Studio actions verify membership | `requireStudioActor` — **A** |
| Client `organisationId` not trusted alone | Server derives/validates — **A** |

---

## 5–7. Snapshot / Decision / Action persistence

| Item | Status |
|------|--------|
| Authoritative SoT | `pilot_executive_snapshots`, `pilot_outcome_portfolios`, `pilot_decisions`, `pilot_actions` (+ memory contract in test) — **A** |
| Org scope on every read/write | Enforced in store + RLS policies — **A** |
| Snapshot immutability | No overwrite of existing snapshot payload — **A** |
| `originSnapshotId` lineage | Preserved on decision/action — **A** |
| sessionStorage | Transient UX only — **A** |
| localStorage portfolio | UI cache only — **A** |
| data-gateway Maps | Ingestion cache only — **A** |

---

## 8. Continuity

| Item | Status |
|------|--------|
| Survives session clear via durable portfolio | Tested in `pilot-access-hardening.test.ts` — **A** |
| Since You Last Looked | Still derived from portfolio + snapshot context — **A** |

---

## 9. Demo fallback

| Item | Status |
|------|--------|
| Authenticated empty `/today` | **Unavailable** — no Northline/Alex/Helix — **A** |
| Explicit `?demo=1` / intent `demo` | Still allowed for controlled demo — **A** |

---

## 10. Server action security

| Item | Status |
|------|--------|
| Studio parse / create / intelligence | Require auth (+ org for mutating) — **A** |
| Persist / load pilot state | Require auth + org — **A** |
| Unauthenticated → controlled error | Tested — **A** |
| Wrong org → FORBIDDEN | Tested — **A** |

---

## 11. Provisioning (M5) — manual process for four users

Do **not** invent emails. Operators create real accounts.

### Roles (existing)

| Role | Typical pilot use |
|------|-------------------|
| `owner` | Org admin / invite |
| `executive` | Pilot executive (primary) |
| `manager` / `contributor` / `viewer` | Optional analyst / observer |

### Steps (per user A–D)

1. **Create Auth user** in Supabase Dashboard (email + password) *or* `/get-started` with email confirmation enabled.  
2. **Sign in** on Production URL.  
3. **Create organisation** at `/organization` (prefer **one org per pilot user** for isolation clarity) *or* accept invitation code.  
4. **Invite teammates** (optional): Team UI creates invitation **code** — share out-of-band (no automated email).  
5. **Snapshot access:** User uploads manufacturing CSV in Snapshot Studio → validate → run intelligence → activate Command Centre. Activation persists durable snapshot for their org.  
6. **Daily use:** `/today` with active durable snapshot. Empty state shows unavailable — never demo.  
7. **Password reset:** Supabase Dashboard (no in-app reset).  
8. **Dedicated browser profile** per user; do not share devices without clearing site data.

### Invitation

Automated invitation emails: **NOT IMPLEMENTED** — manual codes OK for first four users.

---

## 12. Four-user test results

| Test | Result |
|------|--------|
| Unit: User A / B isolation | **PASS** (memory durable contract) |
| Unit: browser restart persistence | **PASS** |
| Unit: lineage / immutability | **PASS** |
| Unit: no silent demo | **PASS** |
| Unit: Studio auth | **PASS** |
| Live Production Browser A/B/C/D | **NOT EXECUTED** — requires deployed env |

---

## 13. Remaining risks

1. Production deploy + migration `011` not verified.  
2. Live multi-browser test against Production not run.  
3. Process Maps still exist as **caches** — must not be treated as SoT.  
4. Classic `executive_decisions` (user-scoped register) remains separate from Manufacturing pilot portfolio path.  
5. No formal SOC 2 / ISO claim.

---

## GREEN gate (not yet met)

- [ ] Production deployment verified  
- [x] Production mock authentication OFF (code fail-safe)  
- [x] No silent demo for authenticated empty state  
- [x] Authenticated Studio server actions  
- [x] Org-scoped durable snapshot / decision / action  
- [x] Snapshot immutability + lineage  
- [x] Browser restart persistence (unit)  
- [x] User A/B isolation (unit)  
- [x] Tests + build passing  
- [ ] Live four-user Production isolation run  
- [ ] Migration 011 applied on Production Supabase  

**STOP** — no Phase 71; no UX redesign.
