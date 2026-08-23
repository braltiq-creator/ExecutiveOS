# Organisation Portal — Phase 54

**Domains:** `src/organisation-portal/` · `src/account/`  
**Routes:** `/organisation/*` (hub also linked from `/administration`)  
**Nature:** Customer-facing commercial SaaS — not an admin console, not Core.

## Intent

A portal closer to Stripe, Linear, and Apple Business Manager than traditional enterprise software. Customers manage subscription, organisation, executives, security, and connected systems independently. The Executive Command Centre remains the operational front end.

## Navigation

| Section | Path |
|---------|------|
| Organisation | `/organisation` |
| Executives | `/organisation/executives` |
| Connected Systems | `/organisation/connected-systems` |
| Executive Intelligence | `/organisation/executive-intelligence` |
| Subscription | `/organisation/subscription` |
| Security | `/organisation/security` |
| Usage & Value | `/organisation/usage` |
| Support | `/organisation/support` |

## Design

Uses the Executive Experience System (`AppFrame`, `ExperiencePage`, `ExperienceCardShell`, EXS tokens). Light premium aesthetic — no dark admin UI.

## APIs

```ts
import { getOrganisationPortalSnapshot, ORGANISATION_PORTAL_NAV } from "@/organisation-portal";
import { inviteExecutive, enableMfa } from "@/account";

const snapshot = getOrganisationPortalSnapshot({ organisationId, accountId, tenantId });
```

## Self-review

1. Manage organisation without Braltiq? **Yes**  
2. Invite executives? **Yes**  
3. Connect systems? **Yes**  
4. Manage billing? **Yes**  
5. Understand value? **Yes** (Usage & Value)

*Confidence Through Clarity.*
