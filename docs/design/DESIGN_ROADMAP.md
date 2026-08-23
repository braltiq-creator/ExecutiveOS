# ExecutiveOS Design Roadmap

## Prioritization Framework

| Tier | Criteria |
|------|----------|
| **P0** | Blocks beta trust or daily habit |
| **P1** | Required for GA perception |
| **P2** | Enterprise / expansion |
| **P3** | Polish and delight (restrained) |

---

## Immediate (Beta Week 1–4) — P0

| Initiative | Outcome | Owner |
|------------|---------|-------|
| Apply Visual Identity tokens to CSS | Brand consistency in product | Engineering |
| Intelligence Center hierarchy refactor per spec | Correct information priority | Product + Eng |
| Priority strip Ink 900 implementation | Signature "briefing moment" | Eng |
| Skeleton loading on dashboard | Confidence during load | Eng |
| Concierge onboarding v1 (conversational steps) | Activation + aha moment | Product + Eng |
| Logo mark finalization (Meridian) | Brand recognition | Design |
| Error/empty state audit all pages | No blank screens | Product |

---

## Beta Improvements (Week 5–8) — P1

| Initiative | Outcome |
|------------|---------|
| Advisor panel UX per spec | Clear reasoning visibility |
| Graph visual polish (node types, colors) | Readable relationship view |
| Motion system implementation | Consistent 200ms transitions |
| Mobile bottom navigation | Executive mobile access |
| Dark mode (opt-in) | Travel/evening usage |
| Marketing site v1 | Beta recruitment |
| Sales deck template | Founder sales enablement |
| Lucide icon migration | Consistent iconography |
| Typography token enforcement | Remove ad-hoc sizes |

---

## Version 1.0 Polish — P1

| Initiative | Outcome |
|------------|---------|
| Full concierge onboarding with graph animation | Unforgettable first run |
| Intelligence Center "changes since last visit" | Return habit reinforcement |
| Command palette polish (⌘K) | Power user efficiency |
| Component Storybook | Design-dev single source |
| Executive report PDF export (Ledger mark) | Board-ready brand extension |
| Accessibility audit (WCAG AA full) | Enterprise procurement |
| Design system Figma library | Scale design team |
| Notification system (in-app) | Critical attention delivery |
| Email digest template (v1.5 prep) | Morning brief beyond app |

---

## Enterprise Enhancements — P2

| Initiative | Outcome |
|------------|---------|
| SSO login screen co-branding | Enterprise white-label lite |
| Custom org logo in header | Identity for large orgs |
| High-contrast mode | Accessibility + gov |
| Audit log UI | Compliance visibility |
| Admin console design system | IT buyer confidence |
| Data residency indicator | EU/APAC trust |
| Print-optimized board views | Board meeting native |

---

## Mobile Optimisation — P2

| Initiative | Outcome |
|------------|---------|
| PWA install prompt | Home screen presence |
| Intelligence Center mobile-first refactor | Phone morning brief |
| Touch-optimized graph (simplified) | Mobile relationship view |
| Advisor voice input (v2.0 explore) | Hands-free |

---

## Accessibility — P1 → P0 at GA

| Initiative | Timeline |
|------------|----------|
| Screen reader audit all flows | Beta Week 6 |
| Keyboard navigation complete | v1.0 |
| Focus order documentation | v1.0 |
| Color contrast audit (automated CI) | v1.0 |
| `prefers-reduced-motion` full compliance | Beta Week 4 |
| Accessibility statement page | GA |

---

## Design Debt Register

| Debt | Impact | Fix |
|------|--------|-----|
| Inline Tailwind vs. tokens | Inconsistency | Token migration sprint |
| Mixed card radius (xl vs lg) | Visual noise | Standardize radius-lg |
| Domain-specific status badges | Duplication | Unify on StatusBadge |
| No Figma source of truth | Drift | Figma library v1.0 |
| Chat UI separate from advisor spec | UX inconsistency | Unified conversation component |
| zinc vs slate naming | Token confusion | Rename to Slate in CSS |
| Dark mode incomplete | Half-shipped feel | Ship or hide until ready |
| Graph performance UX | Trust at scale | Virtualization v1.5 |

---

## Success Metrics (Design)

| Metric | Beta | GA |
|--------|------|-----|
| Onboarding completion | ≥85% | ≥90% |
| "Product looks premium" (survey) | ≥4.2/5 | ≥4.5/5 |
| Accessibility issues (P0) | 0 | 0 |
| Design-dev token coverage | 60% | 95% |
| Brand consistency audit score | ≥80% | ≥95% |

---

## Team & Tools (Recommended)

| Role | When |
|------|------|
| Founder + product (design owner) | Now |
| Contract brand designer (logo finalize) | Beta Week 1–2 |
| Product designer #1 | At $500K ARR / GA |
| Design engineer | At v1.5 |

**Tools:** Figma (design), Storybook (components), Geist (type), Lucide (icons)

---

*Related: `EXECUTIVEOS_DESIGN_BIBLE.md`, `BETA_READINESS.md`, `ROADMAP.md` (product)*
