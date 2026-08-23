# ADR-004: Information Architecture & Executive Briefing Default

**Status:** Accepted  
**Date:** 2026-07-20  
**Deciders:** Founder, Principal Frontend Architect  
**Sprint:** 3.5 Platform Foundation  

## Context

Legacy IA mixed dashboard, advisors, and graph as peer destinations. Workshops and the Frontend Decision Record require a Briefing-first OS with six primary nav items and persistent Outcome Health.

## Decision

1. **Default landing** for authenticated product use is the **Executive Briefing** at `/today`.  
2. **Primary navigation** is exactly six items:  
   **Today · Decisions · Insights · Actions · Knowledge · Reports**  
3. Migration aliases (temporary): `/dashboard` → `/today`, `/advisors` → `/insights`, `/graph` → `/knowledge`.  
4. **Outcome Health** is persistent shell chrome (ribbon), not a seventh nav item.  
5. Logo / wordmark navigates to **Today**, not marketing `/`.  
6. Settings, org, billing, integrations, team, admin live under **Account / Organisation** utility — not primary nav.  
7. Briefing sections answer What / Why / Outcome / Next; recommendations include Business Impact, Expected Outcome Impact, Confidence, Owner, Deadline.

## Consequences

### Positive

- Matches approved FDR and IA  
- Clear product vocabulary for executives  
- Shell stays scannable under time pressure  

### Negative / trade-offs

- Actions / Insights / Knowledge / Reports may remain placeholder until later phases  
- Alias redirects add temporary route surface area  

## Alternatives considered

| Alternative | Why rejected |
|-------------|--------------|
| Intelligence Center as default | Superseded by Briefing OS |
| Five-item Bible nav | Founder override: six items |
| Dashboard-first home | Conflicts with anti-AI / Briefing OS direction |

## References

- `docs/design/INFORMATION_ARCHITECTURE.md`  
- `docs/design/FRONTEND_DECISION_RECORD.md`  
- `src/lib/navigation/primary-nav.ts`  
- `src/components/layout/AppShell.tsx`  
