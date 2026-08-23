# ExecutiveOS Design System & Brand Bible

Documentation for brand, UX, and visual decisions across ExecutiveOS.

## Start here (canonical for frontend)

| Document | Purpose |
|----------|---------|
| [**../experience/README.md**](../experience/README.md) | **Canonical (Phase 36)** — Experience Alignment · Today as Command Centre · workspace contracts |
| [**../design-system/EXECUTIVE_EXPERIENCE_DESIGN_SYSTEM.md**](../design-system/EXECUTIVE_EXPERIENCE_DESIGN_SYSTEM.md) | **Phase 54 EXDS** — premium presentation components · colour language · migration guide |
| [**FRONTEND_DECISION_RECORD.md**](./FRONTEND_DECISION_RECORD.md) | Hybrid strategy, positioning, principles, typography, workshop adoption |
| [**INFORMATION_ARCHITECTURE.md**](./INFORMATION_ARCHITECTURE.md) | Historical IA — nav labels superseded by Experience Alignment where they conflict |
| [**studio/**](./studio/) | Design Workshops — adopted design system source (as modified by FDR) |

**Positioning:** *The Operating System for Executive Decision Making.* · *Confidence Through Clarity.*  
**Default landing:** Executive Command Centre (**Today**).  
**Primary nav (shipping):** Today · Strategy · Decisions · Knowledge · Reports · Administration  
**UI type:** Inter · **Display/marketing:** Geist · **Mono:** Geist Mono

Engineering architecture and scalable implementation patterns from the Design Bible remain in force where they do not conflict with the FDR/IA.

---

## Document Index

| # | Document | Purpose |
|---|----------|---------|
| — | [**FRONTEND_DECISION_RECORD.md**](./FRONTEND_DECISION_RECORD.md) | **Frontend canonical** — Hybrid Option C + founder decisions |
| — | [**INFORMATION_ARCHITECTURE.md**](./INFORMATION_ARCHITECTURE.md) | **IA canonical** — nav, routes, briefing model |
| — | [**EXECUTIVEOS_DESIGN_BIBLE.md**](./EXECUTIVEOS_DESIGN_BIBLE.md) | Legacy master (v1.0) — engineering patterns retained; visual/IA superseded where conflicting |
| 1 | [BRAND_STRATEGY.md](./BRAND_STRATEGY.md) | Purpose, mission, personality, voice, tone (align to FDR positioning) |
| 2 | [VISUAL_IDENTITY.md](./VISUAL_IDENTITY.md) | Legacy tokens — update pending to Institutional + Briefing + Inter/Geist |
| 3 | [LOGO_SYSTEM.md](./LOGO_SYSTEM.md) | Logo exploration — Ledger Line direction per workshops/FDR |
| 4 | [DESIGN_PRINCIPLES.md](./DESIGN_PRINCIPLES.md) | Historical — superseded by FDR §3 ten principles |
| 5 | [UX_PRINCIPLES.md](./UX_PRINCIPLES.md) | Executive user model — nav section superseded by IA |
| 6 | [INTELLIGENCE_CENTER_UX.md](./INTELLIGENCE_CENTER_UX.md) | Legacy IC spec — refactor to Executive Briefing |
| 7 | [CONCIERGE_ONBOARDING.md](./CONCIERGE_ONBOARDING.md) | Conversational onboarding — Executive Digital Twin journey |
| 8 | [MOTION_SYSTEM.md](./MOTION_SYSTEM.md) | Animation timing — aligns with “Motion is Communication” |
| 9 | [COMPONENT_GUIDELINES.md](./COMPONENT_GUIDELINES.md) | Cards, tables, buttons, forms — update with workshop tokens |
| 10 | [BRAND_APPLICATION.md](./BRAND_APPLICATION.md) | Website, decks, email, LinkedIn, merchandise, executive reports |
| 11 | [DESIGN_ROADMAP.md](./DESIGN_ROADMAP.md) | Beta → v1.0 priorities — reinterpret against FDR |

---

## Design North Star

> **Outcome before interface. Confidence through restraint. Signal over noise.**

ExecutiveOS is the operating system for executive decision making — calm, outcome-ranked, explain-then-recommend. Never overwhelming.

### Canonical principles (summary)

1. Outcome Before Interface  
2. Confidence Through Restraint  
3. Signal Over Noise  
4. Context Before Data  
5. Questions Before Charts  
6. Explain Before Recommend  
7. Progressive Disclosure of Intelligence  
8. Motion is Communication  
9. Accessibility is Decision Enablement  
10. Outcome-Based Personalisation  

### Every Screen Must Answer

1. What requires my attention?  
2. Why?  
3. What should I do?  

---

## Quick Reference (Hybrid)

| Element | Canonical |
|---------|-----------|
| Primary colour family | Modern Institutional `#1A1F2E` |
| Morning Briefing canvas | FT Pink `#FFF1E5` |
| Semantic | Success / Warning / Critical (muted; max 1–2 critical/screen) |
| UI typeface | Inter |
| Display / marketing | Geist |
| Mono | Geist Mono |
| Mark direction | Ledger Line (workshop) |
| Persistent chrome | Outcome Health |

---

## Related Documentation

- Product strategy: [`/docs/business/PRODUCT_STRATEGY.md`](../business/PRODUCT_STRATEGY.md)
- Beta program: [`/docs/business/BETA_PROGRAM.md`](../business/BETA_PROGRAM.md)
- UI implementation: `src/components/ui/`
- Briefing (legacy folder name): `src/components/intelligence-center/`

---

## Governance

1. Frontend work must match [`FRONTEND_DECISION_RECORD.md`](./FRONTEND_DECISION_RECORD.md) and [`INFORMATION_ARCHITECTURE.md`](./INFORMATION_ARCHITECTURE.md).  
2. Design Workshop outputs in [`studio/`](./studio/) inform the design system; FDR overrides win on conflict.  
3. Propose changes via PR to `/docs/design/`.  

**Version:** 1.1 · **Frontend status:** Canonical FDR/IA pending founder approval · **Owner:** Product & Design
