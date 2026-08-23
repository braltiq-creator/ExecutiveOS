# ExecutiveOS Constitution v1

**Status:** Governing document (Sprint 3.5)  
**Version:** 1.0  
**Date:** 2026-07-20  
**Authority:** Supersedes conflicting guidance in Design Bible v1.0, VISUAL_IDENTITY, UX_PRINCIPLES IA trees, and ad-hoc product chrome where they disagree.  
**Companion docs:** ADRs 001–005, DOMAIN_MODEL.md, FRONTEND_DECISION_RECORD.md, INFORMATION_ARCHITECTURE.md

---

## Preamble

ExecutiveOS is infrastructure for executive judgment. The product exists so leaders know what requires attention, why it matters to strategic outcomes, and what should happen next — with calm confidence under time pressure.

This Constitution binds product, design, and engineering decisions. Features that violate it require an explicit ADR amendment and founder approval.

---

## Article I — Vision & Positioning

1. **Position:** *The Operating System for Executive Decision Making.*  
2. **Category:** Executive Intelligence Platform (EIP) — proactive briefing for leadership.  
3. **Metaphor:** Operating System — infrastructure for judgment, not a service chatbot.  
4. **Brand promise:** Executives know what requires judgment, why, and what to do next — grounded in **strategic outcomes**, not role templates.  
5. **Subordinate language:** “Chief of Staff,” “Advisors,” and similar feature names serve the OS frame; they do not lead the brand.  
6. **Avoid as lead:** “AI-powered,” assistant-first home, dashboard-first home.

---

## Article II — Design Principles

Canonical ten (Frontend Decision Record). Older lists are historical where they conflict.

| # | Principle | Binding meaning |
|---|-----------|-----------------|
| 1 | **Outcome Before Interface** | UI advances strategic outcomes; chrome never competes with judgment. |
| 2 | **Confidence Through Restraint** | Calm, sparse surfaces; urgency in content, not visual panic. |
| 3 | **Signal Over Noise** | One prioritized signal beats dense equal widgets. |
| 4 | **Context Before Data** | Situation and stakes before numbers or charts. |
| 5 | **Questions Before Charts** | Decision question first; visualization supports, never leads. |
| 6 | **Explain Before Recommend** | Show why before what to do. |
| 7 | **Progressive Disclosure of Intelligence** | Glance → scan → read → deep dive. |
| 8 | **Motion is Communication** | Animation confirms state; never decorates or delays. |
| 9 | **Accessibility is Decision Enablement** | WCAG AA minimum; unusable under time pressure = fail. |
| 10 | **Outcome-Based Personalisation** | Priority personalises on strategic outcomes; roles are contextual only. |

### Three questions

Every primary surface must answer, in order:

1. What requires my attention?  
2. Why?  
3. What should I do?

---

## Article III — Information Architecture

1. **Default landing:** Executive Briefing at `/today`.  
2. **Primary navigation (exactly six):** Today · Decisions · Insights · Actions · Knowledge · Reports.  
3. **No seventh primary item.** Account / Organisation utilities hold settings, billing, integrations, team, admin.  
4. **Outcome Health** is persistent shell chrome, not a nav destination.  
5. **Logo → Today.**  
6. **Aliases (migration):** `/dashboard`→`/today`, `/advisors`→`/insights`, `/graph`→`/knowledge`.  
7. **Vocabulary:** Today/Briefing over Dashboard; Insights over AI; Knowledge over Graph in nav.  
8. **Mental model:** Strategic Outcomes → Executive Briefing → Decisions / Insights / Actions / Knowledge / Reports.

Full detail: `docs/design/INFORMATION_ARCHITECTURE.md` (ADR-004).

---

## Article IV — Domain & Data Rules

1. **Outcome Engine** is the single source of truth for strategic outcomes and portfolio health (ADR-001).  
2. **Decisions** always link to ≥1 outcome; no standalone decisions (ADR-002).  
3. **Decision business state** lives on `OutcomePortfolio.decisions`.  
4. **Derived surfaces** (Briefing, Intelligence projections, Decision queue) must not maintain parallel outcome/decision stores.  
5. **Provider order:** Outcome → Intent → Decision → Intelligence → ExecutiveBriefing (ADR-003 as amended by ADR-006).  
6. **Executive Intent** on `OutcomePortfolio` frames strategic focus; it does not replace Outcomes as the personalisation axis or duplicate outcome/decision business state (ADR-006).  
7. **Legacy register / Supabase types** coexist until unified; engine types must not silently overwrite them.  
8. Entity catalogue: `DOMAIN_MODEL.md`.  
9. **Intent** is utility/Briefing context, not a seventh primary nav item.

---

## Article V — Engineering Principles

1. **Constitution over convenience** — shortcuts that create dual sources of truth are defects.  
2. **Mock-first engines** — Outcome/Decision/Briefing engines may ship on mock portfolio data until persistence ADRs land; do not invent per-surface fake stores.  
3. **No behaviour change for docs sprints** — governance work must not alter product behaviour unless explicitly scoped.  
4. **Layering:** Prefer derive functions over copy-paste data shaping in UI.  
5. **Type boundaries:** Engine types (`engine-types.ts`) vs register types (`types.ts`) stay explicit.  
6. **Accessibility:** Interactive controls meet WCAG AA; focus rings and labels are required, not optional polish.  
7. **Security & tenancy:** Organisation boundaries and auth remain enforced for persisted paths; mock engines must not pretend cross-tenant data is safe for production.  
8. **Tests:** Engines and derives warrant unit coverage; UI regressions covered by existing test suite where present.  
9. **Next.js realities:** Follow repo `AGENTS.md` / Next docs in `node_modules/next/dist/docs/` for framework APIs.  
10. **Storybook** documents UI primitives; stories must not change app routes or runtime behaviour.

---

## Article VI — Design System Governance

1. **Hybrid Option C** (ADR-005): Workshops = visual/experiential SoT; Design Bible = scalable engineering patterns.  
2. **Typography:** Inter (UI), Geist (display/marketing), Geist Mono (scores/IDs/timestamps).  
3. **Theme:** Dark-first product shell; Briefing may use circadian/morning canvas language without abandoning institutional chrome.  
4. **Tokens:** `src/app/globals.css` CSS variables are the runtime token surface.  
5. **Anti-AI checklist:** No sparkles, no chat-first product home, no anthropomorphized AI, no purple mesh gradients as brand default.  
6. **Signature interactions (roadmap):** Confidence Exit, Attention Budget (P0); Decision Stamp / Operating Slash as follow-ons.  
7. Conflicting Bible / VISUAL_IDENTITY defaults are superseded until those docs are rewritten.

---

## Article VII — Product Surface Maturity

As of Constitution v1 (post Phase 3):

| Surface | Status |
|---------|--------|
| Shell + six-item nav + Outcome Health | Implemented |
| Executive Briefing (`/today`) | Implemented (mock-derived) |
| Outcome Engine (`/outcomes`) | Implemented (mock) |
| Decision Engine (`/decisions`) | Implemented (mock) |
| Executive Intent Engine (`/intent` + Briefing strip) | Implemented (mock) |
| Insights / Actions / Knowledge / Reports | Placeholder / partial legacy |
| Real AI inference for engines | Not in scope for foundation |
| Charts-led analytics as primary UX | Forbidden as lead pattern |

Later phases require ADRs before changing Articles I–VI.

---

## Article VIII — Governance Process

1. **Amendments** to this Constitution require founder approval and a new version (`v1.1+`) or superseding `v2`.  
2. **Architectural decisions** that affect engines, IA, or design system land as ADRs under `docs/architecture/`.  
3. **Inconsistencies** between implementation and this Constitution are tracked in `CONSTITUTION_INCONSISTENCIES.md` until resolved.  
4. **Phase gates:** Do not begin a numbered product phase until the prior phase is approved and any blocking Constitution gaps are acknowledged.  
5. **Sprint 3.5** establishes documentation and Storybook only — no new business features under this sprint.

---

## Article IX — Ratification

This Constitution v1 incorporates:

- Approved Hybrid Option C and founder overrides (FDR)  
- Approved Information Architecture  
- Accepted ADRs 001–005  
- Domain model for Outcome & Decision engines  

**Ratified for review:** Sprint 3.5 Platform Foundation.
