# Customer Provisioning Platform — Phase 53

**Code:** `src/provisioning/`  
**Admin:** `/admin/provisioning`  
**Nature:** Commercial SaaS self-service — does **not** modify Core, Council, or Intelligence Packs.

## Customer journey

1. **Start Free Trial**
2. Create account (name, email, password, company)
3. Choose Executive Profile — Operations / Commercial / Manufacturing
4. Automatic provision:
   - Tenant · Workspace · Trial licence (30 days)
   - Executive Council enabled · Intelligence Pack assigned
   - Knowledge Graph · Memory · Strategy · Dashboard · API keys · Audit
5. Redirect → `/onboarding`

## Onboarding

Reuses Executive Discovery. Asks only:

- Role  
- Top three strategic outcomes  
- Preferred briefing time  

Everything else is discovered automatically.

## Modules

| Folder | Responsibility |
|--------|----------------|
| `identity/` | Account create / verify |
| `organisation/` | Company organisation record |
| `tenant-provisioning/` | Tenant creation |
| `workspace-builder/` | Default workspaces |
| `executive-profile/` | Profile catalog + assignment |
| `licensing/` | Trial commercial licence |
| `trial/` | 30-day trial + upgrade prompts |
| `pack-assignment/` | EIPF register/activate only |
| `bootstrap/` | Council/graph/memory/strategy/dashboard/keys |
| `email/` | Lifecycle templates |
| `audit/` | Provisioning audit trail |
| `validation/` | Input + completeness |
| `onboarding/` | Discovery kickoff bridge |
| `admin/` | Dashboard queries |

## Manufacturing profile

Maps to Intelligence Profile `operations_executive` + activates `pack-manufacturing-executive`. Does not redefine profiles or pack internals.

## Self-review

1. Can a customer create a tenant without Braltiq? **Yes**  
2. Under five minutes? **Yes** (orchestrated in ms; wall-clock target)  
3. Onboarding start immediately? **Yes** → `/onboarding`  
4. Failures retried safely? **Yes** — completed steps skipped  

*Confidence Through Clarity.*
