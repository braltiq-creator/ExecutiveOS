# Frontend Decision Record — Hybrid Canonical Direction

**Status:** Canonical (approved)  
**Version:** 1.0  
**Date:** 20 July 2026  
**Decision:** Option C — Hybrid, with founder modifications  
**Owner:** Principal Frontend Architect / Founder  
**Supersedes for frontend:** Design Bible v1.0 visual & IA defaults where they conflict with this record; Creative Studio exploration status (“not final”) for adopted workshop outcomes listed below.

---

## 1. Decision Summary

ExecutiveOS proceeds with a **Hybrid** frontend strategy:

| Layer | Source of truth |
|-------|-----------------|
| **Engineering architecture** | Existing codebase + Design Bible patterns that support scalability |
| **Design direction** | ExecutiveOS Design System from Design Workshops (Creative Studio synthesis), as modified by this record |
| **Product positioning** | This record |
| **Information architecture** | [`INFORMATION_ARCHITECTURE.md`](./INFORMATION_ARCHITECTURE.md) |

**No implementation begins until this record and the Information Architecture are approved as written.**

---

## 2. Positioning (Canonical)

**Primary position:**

> **The Operating System for Executive Decision Making.**

| Role | Language |
|------|----------|
| Category | Executive Intelligence Platform (EIP) |
| Metaphor | Operating System — infrastructure for judgment, not a service chatbot |
| Feature names | Chief of Staff, Advisors — subordinate to the OS frame |
| Avoid as lead | “AI-powered,” assistant-first, dashboard-first |

Brand promise remains outcome-shaped: executives know what requires judgment, why, and what to do next — grounded in **strategic outcomes**, not role templates.

---

## 3. Canonical Design Principles

These ten principles are now the product design standard. Older principle lists (Design Bible §5, `DESIGN_PRINCIPLES.md`) remain historical reference; **where they conflict, this list wins.**

| # | Principle | Meaning for product |
|---|-----------|---------------------|
| 1 | **Outcome Before Interface** | UI exists to advance strategic outcomes; chrome never competes with judgment. |
| 2 | **Confidence Through Restraint** | Calm, sparse surfaces; urgency in content, not visual panic. |
| 3 | **Signal Over Noise** | One prioritized signal beats dense equal widgets. |
| 4 | **Context Before Data** | Explain the situation and stakes before numbers or charts. |
| 5 | **Questions Before Charts** | Frame the decision question first; visualization supports, never leads. |
| 6 | **Explain Before Recommend** | Advisors and briefs show why before what to do. |
| 7 | **Progressive Disclosure of Intelligence** | Glance → scan → read → deep dive; never dump the graph first. |
| 8 | **Motion is Communication** | Animation confirms state and orients; never decorates or delays. |
| 9 | **Accessibility is Decision Enablement** | WCAG AA minimum; if it can’t be used under time pressure, it fails. |
| 10 | **Outcome-Based Personalisation** | Briefing and priority order personalise on **strategic outcomes**; roles supply context only. |

### Three questions (retained)

Every primary surface must answer, in order:

1. What requires my attention?
2. Why?
3. What should I do?

---

## 4. Design Direction from Workshops (Adopted)

Design Workshop / Creative Studio outcomes are **adopted as the visual and experiential design system**, except where this record explicitly overrides.

### Adopted from workshops

| Element | Direction |
|---------|-----------|
| Master metaphor | Operating System (infrastructure), not Chief of Staff as brand archetype |
| Primary mark direction | Ledger Line family (workshop #23) — finalize assets in brand sprint |
| Colour system | Modern Institutional primary (`#1A1F2E` family) + morning Briefing canvas (FT Pink `#FFF1E5`) for Executive Briefing |
| Homepage model | **Briefing OS** — editorial morning brief as default landing |
| Signature interactions | Confidence Exit (P0); Attention Budget (P0); Decision Stamp / Operating Slash as follow-ons |
| Anti-AI checklist | No sparkles, no chat-first product home, no anthropomorphized AI, no purple mesh gradients |
| Circadian awareness | Briefing mode (morning) → Operating mode (day); Study/dark as opt-in secondary |
| Emotional close | Session end delivers calm closure (Confidence Exit) |

### Explicit overrides (founder-approved)

| Element | Workshop default | **Canonical now** |
|---------|------------------|-------------------|
| **UI typeface** | IBM Plex Sans | **Inter** |
| **Display / marketing typeface** | Söhne | **Geist** (display, marketing, presentation) |
| **Mono** | IBM Plex Mono | **Geist Mono** (scores, IDs, timestamps) — aligns with existing stack |
| **Primary navigation** | Studio status bar + module list / Bible 5-item mix | **Today · Decisions · Insights · Actions · Knowledge · Reports** |
| **Default landing** | Intelligence Center / Briefing hybrid naming | **Executive Briefing** (route mapping in IA) |
| **Personalisation axis** | Role + context mix | **Strategic outcomes first; roles contextual only** |
| **Persistent chrome** | Health score in places | **Outcome Health** visible product-wide |

Full workshop rationale remains in [`studio/EXECUTIVEOS_CREATIVE_STUDIO_BOOK.md`](./studio/EXECUTIVEOS_CREATIVE_STUDIO_BOOK.md) and [`studio/PART_IV_SYNTHESIS.md`](./studio/PART_IV_SYNTHESIS.md).

---

## 5. Engineering Architecture (Retained from Bible / Codebase)

Adopt existing patterns that scale. Do **not** rewrite the backend domain model for this frontend direction.

| Pattern | Keep |
|---------|------|
| App Router pages as thin loaders | Yes |
| `pages → server actions → services → queries/mutations → Supabase` | Yes |
| Domain modules under `src/lib/*` and `src/components/*` | Yes |
| Org-scoped multi-tenancy + RLS | Yes |
| `buildExecutiveIntelligence()` as shared context composition | Yes — extend for outcome-first briefing |
| Feature gates via billing entitlements | Yes |
| UI primitives in `src/components/ui/` | Yes — migrate to workshop tokens |
| Vitest + Playwright harness | Yes |

### Frontend structural rules

1. **Shell owns IA** — primary nav, Outcome Health chrome, command palette entry.
2. **Domains own screens** — Decisions, Insights, Actions, Knowledge, Reports as feature folders; avoid god-components.
3. **Tokens before utilities** — CSS variables for Institutional / Briefing / semantic colours; map Tailwind to tokens; retire ad-hoc `zinc-*` in product UI over Phase 1–2.
4. **Shared intelligence snapshot** — cache briefing payload across Today and dependent panels within TTL (Architecture Review).
5. **Presentation ≠ domain** — primitives never encode outcome scoring; domain views consume typed briefing/outcome contracts.

---

## 6. Experience Mandates

### 6.1 Executive Briefing (default landing)

- Named **Executive Briefing** in product UI (not “dashboard”).
- Personalised primarily around **strategic outcomes**.
- Roles (CEO, CoS, CFO, etc.) enrich context and tone — **they do not set priority order**.
- Layout follows Briefing OS: lead outcome/attention story → supporting signals → next commitments → deferred depth.
- Must answer What / Why / What to do within a ~30s morning scan.

### 6.2 Outcome Health (persistent)

- **Outcome Health** is visible throughout the product (shell status region).
- Reflects portfolio/strategic outcome health, not vanity usage metrics.
- Drill-through targets Outcomes / Initiatives intelligence — never a dead score.

### 6.3 Primary navigation

Canonical primary nav (exactly six items):

**Today · Decisions · Insights · Actions · Knowledge · Reports**

See [`INFORMATION_ARCHITECTURE.md`](./INFORMATION_ARCHITECTURE.md) for route mapping, secondary destinations, and settings placement.

### 6.4 Typography

| Role | Face |
|------|------|
| Interface (product UI body, UI chrome, forms, tables) | **Inter** |
| Display, marketing, presentation | **Geist** |
| Scores, IDs, timestamps, technical mono | **Geist Mono** |

Body size target remains **15px** in product (executive density + whitespace).

### 6.5 Hybrid signatures (ship with restraint)

| Priority | Signature | Notes |
|----------|-----------|-------|
| P0 | Confidence Exit | Session-end calm closure |
| P0 | Attention Budget | Optional in status region with Outcome Health |
| P1 | Decision Stamp | On decision commit |
| P1 | Briefing → Operating transition | Motion is Communication |
| P2 | Operating Slash (`/`) | Judgment commands, not content CMS |

---

## 7. Relationship to Existing Docs

| Document | New status |
|----------|------------|
| This FDR | **Canonical for frontend strategy** |
| [`INFORMATION_ARCHITECTURE.md`](./INFORMATION_ARCHITECTURE.md) | **Canonical for nav & routes** |
| Design Workshop / Creative Studio | **Adopted design system source** (as modified here) |
| Design Bible v1.0 | **Engineering & scalability patterns retained**; visual/IA defaults superseded where they conflict |
| `DESIGN_PRINCIPLES.md` / Bible principles | Superseded by §3 of this record |
| `UX_PRINCIPLES.md` nav section | Superseded by IA doc |
| `INTELLIGENCE_CENTER_UX.md` | Rename conceptually to Executive Briefing; refactor against Briefing OS + outcomes — treat as legacy spec until rewritten |
| `VISUAL_IDENTITY.md` | Update in a follow-on doc PR (tokens: Institutional + Briefing; type: Inter/Geist) — **not blocking FDR approval** |
| Business `POSITIONING.md` / `PRODUCT_STRATEGY.md` | Align messaging to OS-for-decision-making in a follow-on business doc PR |

---

## 8. Non-Goals (This Decision)

- Full Design Bible v2.0 rewrite before Phase 1 implementation
- Replacing Supabase domain schema for “outcomes” naming in one sprint (map UI language → existing initiatives/objectives/health models first)
- Shipping circadian modes, hardware concepts, or boardroom export before Confidence Exit + Briefing + nav
- Chat-first product home

---

## 9. Implementation Gate

| Step | Status |
|------|--------|
| Frontend Decision Record | Written — awaiting approval |
| Information Architecture | Written — awaiting approval |
| Implementation (tokens, shell, Briefing, typefaces) | **Blocked until approval** |

---

## 10. Approval

| Role | Decision |
|------|----------|
| Founder / Product | Pending |
| Principal Frontend Architect | Recommended as written |

**Approval means:** engineering may begin Hybrid Phase 1 against this FDR + IA only.

---

*Related: [`INFORMATION_ARCHITECTURE.md`](./INFORMATION_ARCHITECTURE.md) · [`studio/PART_IV_SYNTHESIS.md`](./studio/PART_IV_SYNTHESIS.md) · [`ARCHITECTURE_REVIEW.md`](../../ARCHITECTURE_REVIEW.md)*
