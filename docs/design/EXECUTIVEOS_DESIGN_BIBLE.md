# ExecutiveOS Design Bible v1.0

**The permanent design standard for ExecutiveOS.**

Every feature, page, email, deck, and marketing asset must reference this document before implementation. This is the single source of truth for brand, UX, and visual decisions across the Executive Intelligence Platform.

**Version:** 1.0  
**Status:** Canonical  
**Last updated:** July 2026  
**Owner:** Product & Design (Founder-led during Beta)

---

## How to Use This Document

| Role | Start here |
|------|------------|
| **Product / Design** | Sections 1–6 before any new surface |
| **Engineering** | Sections 3–5 + `COMPONENT_GUIDELINES.md` |
| **Marketing / Sales** | Sections 1–2 + `BRAND_APPLICATION.md` |
| **New team members** | Read this document end-to-end, then deep-dive linked docs |

**Detailed specifications live in linked documents.** This Bible synthesizes decisions; it does not replace them.

```
/docs/design/
├── EXECUTIVEOS_DESIGN_BIBLE.md    ← You are here (master)
├── BRAND_STRATEGY.md
├── VISUAL_IDENTITY.md
├── LOGO_SYSTEM.md
├── DESIGN_PRINCIPLES.md
├── UX_PRINCIPLES.md
├── INTELLIGENCE_CENTER_UX.md
├── CONCIERGE_ONBOARDING.md
├── MOTION_SYSTEM.md
├── COMPONENT_GUIDELINES.md
├── BRAND_APPLICATION.md
└── DESIGN_ROADMAP.md
```

---

## 1. Vision & Purpose

### What ExecutiveOS Is

ExecutiveOS is the **Executive Intelligence Platform** — the operating system for executive leadership. It connects calendar, decisions, initiatives, people, and strategic context into proactive guidance, not reactive search.

### Design Mission

Give executives back strategic time by turning organizational complexity into **clear, actionable intelligence** — delivered with calm authority.

### Design Vision

Opening ExecutiveOS will feel as essential as opening the calendar: the first ritual of executive leadership, trusted in boardrooms from New York to London to Sydney.

### The Experience We Build For

Fortune 500 CEOs and their chiefs of staff — busy, scanning, interrupted, mobile, time-poor — who need confidence in seconds, not minutes.

### Design North Star

> **Trust before excitement. Clarity before density. Calm before complexity.**

Every screen answers three questions:
1. **What requires my attention?**
2. **Why?**
3. **What should I do?**

---

## 2. Brand Foundation

### Brand Personality

ExecutiveOS is the **Chief of Staff you trust in the room** — calm, confident, intelligent, premium, trustworthy, proactive. Never overwhelming.

| We are | We are not |
|--------|------------|
| Calm | Loud |
| Confident | Arrogant |
| Intelligent | Clever |
| Premium | Luxurious for its own sake |
| Trustworthy | Salesy |
| Proactive | Alarmist |

**Archetype:** The Sage + The Steward.

### Brand Promise

**You will always know what requires your attention — and why — before your first meeting.**

### Core Values (Design-Relevant)

1. **Clarity over volume** — One prioritized insight beats fifty metrics.
2. **Judgment over automation** — AI advises; executives decide.
3. **Trust is the interface** — If it doesn't feel safe, it doesn't ship.
4. **Calm is a feature** — Urgency lives in content, not visual panic.
5. **Executive dignity** — Never infantilize or gamify leadership.

### Emotional Positioning

**Primary emotion:** Confident calm — *"I am in control of what matters."*

**Avoid:** FOMO, AI wonder, dashboard overwhelm, startup chaos.

### Voice & Tone

| Constant voice | Contextual tone |
|----------------|-----------------|
| Direct, assured, economical, respectful, grounded | Intelligence Center: authoritative briefing |
| | Advisors: consultative, peer-level |
| | Onboarding: welcoming concierge |
| | Errors: apologetic, solution-forward |

**Use:** priority, decision, initiative, intelligence, brief, recommendation, context  
**Avoid:** magic, supercharge, unleash, AI-powered (as lead), bot, dashboard (prefer Intelligence Center)

→ Full specification: [`BRAND_STRATEGY.md`](./BRAND_STRATEGY.md)

---

## 3. Visual Identity

### Design Philosophy

**Institutional modernism** — the gravitas of a board report with the craft of a world-class product team. Light mode is primary; dark mode is secondary (travel, early morning).

### Primary Palette — Executive Ink

| Token | HEX | RGB | HSL | Usage |
|-------|-----|-----|-----|-------|
| **Ink 900** | `#0F1419` | 15, 20, 25 | 214°, 25%, 8% | Primary buttons, wordmark, priority strip, focus rings |
| **Ink 800** | `#1A2332` | 26, 35, 50 | 214°, 32%, 15% | Dark mode surfaces, hero gradients |
| **Ink 700** | `#243044` | 36, 48, 68 | 214°, 31%, 20% | Dark elevated cards, chart axes |

### Neutral System — Slate Intelligence

| Token | HEX | Usage |
|-------|-----|-------|
| Slate 50 | `#FAFAFA` | Inset areas, alternate canvas |
| Slate 100 | `#F4F4F5` | Hover, timeline rows |
| Slate 200 | `#E4E4E7` | Borders, dividers |
| Slate 400 | `#A1A1AA` | Placeholders, timestamps |
| Slate 600 | `#52525B` | Secondary text |
| Slate 900 | `#18181B` | Primary text (light mode) |

### Accent Palette

| Token | HEX | Usage |
|-------|-----|-------|
| Meridian Blue | `#2563EB` | Links, selected states, graph highlights |
| Meridian Blue Muted | `#EFF6FF` | Selected row backgrounds |
| Executive Bronze | `#92704A` | Premium tier, marketing accent — sparingly |
| Executive Bronze Light | `#F7F3EE` | Premium card backgrounds |

### Semantic Colors

| State | HEX | Surface | Rule |
|-------|-----|---------|------|
| Success | `#059669` | `#ECFDF5` | On-track, positive trends |
| Warning | `#D97706` | `#FFFBEB` | At-risk, approaching limits |
| Critical | `#DC2626` | `#FEF2F2` | Max 1–2 per screen; never large fills |

### Typography

| Role | Size | Weight | Font |
|------|------|--------|------|
| Display | 32–40px | Semibold | Geist Sans |
| h1 | 28px | Semibold | Geist Sans |
| h2 | 22px | Semibold | Geist Sans |
| h3 | 18px | Medium | Geist Sans |
| Body | 15px | Regular | Geist Sans |
| Body sm | 13px | Regular | Geist Sans |
| Overline | 11px | Medium, uppercase, tracking | Geist Sans |
| Mono | 13–32px | Medium | Geist Mono (scores, IDs, timestamps) |

**Product body is 15px — not 16px.** Consumer apps use 16px; executive software uses tighter density with generous whitespace.

### Spacing System

Base unit: **4px**. Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96.

Card padding: **20px**. Section gaps: **32–48px**. Page margins: **24px mobile / 48px desktop**.

### Elevation

| Level | Shadow | Usage |
|-------|--------|-------|
| 0 | none | Flat surfaces |
| 1 | `0 1px 2px rgba(15,20,25,0.06)` | Cards |
| 2 | `0 4px 12px rgba(15,20,25,0.08)` | Hover cards, dropdowns |
| 3 | `0 8px 24px rgba(15,20,25,0.12)` | Modals, popovers |

### Corner Radius

| Token | Value | Usage |
|-------|-------|-------|
| radius-sm | 6px | Badges, pills |
| radius-md | 8px | Buttons, inputs |
| radius-lg | 12px | Cards (always) |
| radius-xl | 16px | Modals, dialogs |

### Accessibility

- **WCAG AA minimum** on all text (4.5:1 body, 3:1 large text)
- Ink 900 on white: **15.8:1** ✓
- Meridian Blue on white: **4.6:1** ✓
- Critical red on white: **4.5:1** ✓
- Focus rings: 2px Ink 900, offset 2px
- Never rely on color alone for status

→ Full specification: [`VISUAL_IDENTITY.md`](./VISUAL_IDENTITY.md)

---

## 4. Logo Direction

### Recommended Mark: **The Meridian**

A single horizontal line with one precise vertical intersection — the moment of decision on a timeline. The meridian divides what was from what will be; the intersection is *now*.

| Criterion | Rating |
|-----------|--------|
| Meaning | Navigation, precision, judgment at the right moment |
| Scalability | Excellent at 16px (favicon) |
| App icon | Meridian on Ink 900 square |
| Board presentation | Subtle, authoritative |
| Monochrome | Full compatibility |

### Wordmark

**ExecutiveOS** — Geist Sans Semibold, Ink 900, tight tracking. No tagline in product header.

### Mandatory Avoidances

Brains, neural networks, robot heads, AI sparkles, circuit boards, generic hexagons, gradient "startup AI" aesthetics.

### Secondary Marks

- **Ledger mark** — simplified meridian for PDF exports and reports
- **App icon** — meridian centered on Ink 900, 1024×1024

→ Full exploration (10 concepts): [`LOGO_SYSTEM.md`](./LOGO_SYSTEM.md)

---

## 5. Design Principles

1. **Less but better** — Remove until only what matters remains.
2. **Executive clarity** — Every element earns its place on an executive's screen.
3. **Information hierarchy** — Attention flows: critical → important → context → archive.
4. **Progressive disclosure** — Summary first; detail on demand.
5. **Data before decoration** — No visual elements that don't encode information.
6. **Confidence through whitespace** — Space signals control, not emptiness.
7. **Motion with purpose** — Animate to orient, confirm, or reveal — never to impress.
8. **Accessibility first** — If it's not accessible, it's not executive-grade.
9. **Decision-first design** — Every surface drives toward judgment or action.
10. **Calm urgency** — Critical items use precise language and restrained visual weight.

→ Full specification: [`DESIGN_PRINCIPLES.md`](./DESIGN_PRINCIPLES.md)

---

## 6. UX Principles

### Executive User Model

Assume every user is: **busy, scanning, interrupted, mobile, time-poor, needs confidence quickly.**

Design for the 30-second morning brief, not the 30-minute exploration session.

### Navigation

- **5 primary destinations max** in main nav: Intelligence Center, Advisors, Graph, Calendar, Decisions
- Active state: Slate 900 text + Ink 900 bottom border
- Mobile: bottom bar, 56px height, 5 items max
- Breadcrumbs on nested views only

### Interaction

- **One primary action per region**
- Click targets ≥ 44px on mobile
- Hover states: 100ms elevation change — not color shifts
- Destructive actions: text link, not red button

### Search

- Global command palette (⌘K) — primary power-user path
- Search results grouped: Decisions → Initiatives → People → Meetings
- Recent searches persisted

### Notifications

- In-app only during beta; no push spam
- Critical: inline banner, dismissible
- Informational: toast, 5s auto-dismiss
- Never badge-count anxiety

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘K | Command palette |
| ⌘/ | Focus search |
| j/k | Navigate list items |
| Enter | Open selected |
| Esc | Close modal / deselect |

### Error Recovery

- State the problem in one sentence
- Offer one clear next action
- Never blame the user
- Preserve form data on failure

→ Full specification: [`UX_PRINCIPLES.md`](./UX_PRINCIPLES.md)

---

## 7. Key Experience Specifications

### Intelligence Center (Executive Dashboard)

The Intelligence Center is the product's signature surface — the morning brief made permanent.

**Information hierarchy (top → bottom):**
1. Priority strip (Ink 900 hero) — 3–5 items requiring attention today
2. Health score + decision queue — portfolio status at a glance
3. Priority cards — ranked insights by category
4. Advisor panel — specialist recommendations
5. Timeline — today's calendar + intelligence events
6. Quick actions — contextual next steps

**First-time experience:** Concierge welcome → connect M365 → first insight within 60 seconds  
**Returning experience:** "Since your last visit" delta + refreshed priority strip

→ Full specification: [`INTELLIGENCE_CENTER_UX.md`](./INTELLIGENCE_CENTER_UX.md)

### Concierge Onboarding

ExecutiveOS builds an **Executive Digital Twin** through conversation, not forms.

**Journey:** Welcome → Role & priorities (conversation) → M365 connection → Knowledge graph creation → Executive memory → First insight → First recommendation → "Aha" moment

**Principle:** One question per viewport. Chief of Staff voice. No tutorial modals.

→ Full specification: [`CONCIERGE_ONBOARDING.md`](./CONCIERGE_ONBOARDING.md)

---

## 8. Motion System

Motion creates confidence, not distraction.

### Timing

| Duration | Usage |
|----------|-------|
| 100ms | Hover, focus |
| 200ms | Page transitions, card elevation |
| 300ms | Panel slide, modal enter |
| 500ms | Skeleton shimmer cycle |
| 800ms+ | Never in product UI |

### Easing

- **Enter:** `cubic-bezier(0, 0, 0.2, 1)` — decelerate
- **Exit:** `cubic-bezier(0.4, 0, 1, 1)` — accelerate
- **Standard:** `cubic-bezier(0.4, 0, 0.2, 1)`

### Key Patterns

| Pattern | Spec |
|---------|------|
| Page transition | Fade 200ms, no slide |
| Card hover | elevation-1 → elevation-2, 100ms |
| Loading | Skeleton shimmer, not spinners (except buttons) |
| Success | Checkmark fade-in 200ms — no confetti |
| Notification | Slide from top 300ms, auto-dismiss 5s |
| Reduced motion | Respect `prefers-reduced-motion`; instant transitions |

→ Full specification: [`MOTION_SYSTEM.md`](./MOTION_SYSTEM.md)

---

## 9. Component Standards

### Global Rules

1. One primary button per viewport region
2. Semantic color only — never decorative color in data UI
3. 12px radius on all cards
4. 15px body text in product
5. Ink 900 for primary actions — blue for links only
6. Lucide icons, 1.5px stroke
7. 44px minimum touch targets
8. WCAG AA contrast on all text

### Signature Components

| Component | Key Spec |
|-----------|----------|
| **Executive Insight Card** | White, border Slate 200, 20px padding, overline + score pill |
| **Priority Strip** | Ink 900 bg, white text, 3–5 items, horizontal scroll mobile |
| **Advisor Card** | 8px color dot, 13px name, 2-line insight max |
| **Timeline Row** | Slate 50 inset, 112px time column, type pill |
| **Health Score** | Geist Mono 32px, arc indicator — not pie chart |
| **Knowledge Graph** | Slate 50 canvas, muted node fills, 1px Slate 400 edges |
| **Empty State** | Meridian mark 48px Slate 300 + h3 + one CTA — no clipart |

→ Full specification: [`COMPONENT_GUIDELINES.md`](./COMPONENT_GUIDELINES.md)

---

## 10. Brand Application

| Touchpoint | Key Rule |
|------------|----------|
| **Website** | White canvas, Ink 900 headline, real product screenshots, no stock photos |
| **Product** | Light mode default; Chief of Staff voice; no in-app photography |
| **Sales deck** | White slides, one screenshot per slide, Executive Bronze accent on slide 1 |
| **Investor deck** | Same restraint + TAM/metrics/ask slides |
| **LinkedIn** | Desaturated product crops; teach, don't sell |
| **Email** | 600px max-width, logo top, one CTA; beta pulses plain text |
| **Business cards** | Meridian + wordmark front; uncoated cotton stock |
| **Conference booth** | Quiet confidence; iPad demo stations; quality notebook swag |
| **Executive reports** | Ledger mark, serif body optional, monochrome + Meridian Blue links |

**Brand violations (critical):** Wrong logo colors, AI sparkle imagery, off-brand fonts, gradients on logo.

→ Full specification: [`BRAND_APPLICATION.md`](./BRAND_APPLICATION.md)

---

## 11. Implementation Reference

Current codebase alignment:

| Area | Location | Status |
|------|----------|--------|
| UI primitives | `src/components/ui/` | Beta — migrate to tokens |
| Intelligence Center | `src/components/intelligence-center/` | Refactor per spec |
| Design tokens | `src/app/globals.css` | Partial — Ink/Slate migration needed |
| Fonts | Geist Sans + Mono via `layout.tsx` | ✓ Deployed |
| Icons | Lucide React | ✓ Deployed |

**Before shipping any UI change:**
- [ ] Matches spacing tokens
- [ ] Uses semantic colors only
- [ ] Focus ring visible
- [ ] Touch target ≥ 44px
- [ ] Loading + empty + error states defined
- [ ] Reduced motion tested
- [ ] References this document

---

## 12. Future Evolution

### Immediate (Beta P0)

- Apply Visual Identity tokens to CSS
- Intelligence Center hierarchy refactor
- Priority strip Ink 900 implementation
- Concierge onboarding v1
- Logo mark finalization (Meridian)
- Skeleton loading on dashboard

### Beta → v1.0 (P1)

- Advisor panel UX per spec
- Motion system implementation
- Mobile bottom navigation
- Dark mode (opt-in)
- Component Storybook
- Accessibility audit (WCAG AA full)

### Enterprise (P2)

- SSO co-branding
- Custom org logo in header
- High-contrast mode
- Admin console design system
- Executive report PDF export

### Design Debt

- Inline Tailwind vs. tokens → token migration sprint
- Mixed card radius → standardize radius-lg
- zinc vs slate naming → rename to Slate in CSS
- Graph performance UX → virtualization v1.5

→ Full roadmap: [`DESIGN_ROADMAP.md`](./DESIGN_ROADMAP.md)

---

## 13. Design Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| Jul 2026 | Light mode primary | Executive daytime usage; dark mode secondary |
| Jul 2026 | Ink 900 over blue for primary actions | Authority without consumer-app feel |
| Jul 2026 | Meridian logo direction | Timeless, scalable, board-appropriate |
| Jul 2026 | 15px body text | Executive density with whitespace |
| Jul 2026 | Conversational onboarding | Forms feel administrative; executives expect concierge |
| Jul 2026 | Priority strip as signature element | Morning brief moment — product identity |
| Jul 2026 | No AI visual clichés | Trust before excitement; institutional modernism |

---

## 14. Approval & Governance

| Change type | Approver |
|-------------|----------|
| New color token | Product + Engineering |
| Logo modification | CEO / Founder |
| New component pattern | Product Design |
| Marketing asset | CEO / Founder (Beta) |
| Breaking UX pattern | Product + 1 beta executive reviewer |

**This document is versioned.** Propose changes via PR to `/docs/design/` with rationale. Major revisions increment the version number (v1.1, v2.0).

---

## Summary

ExecutiveOS design exists to make Fortune 500 leaders feel **calm, confident, and in control** — every morning, on every device, in every touchpoint.

We do not compete on visual novelty. We compete on **trust, clarity, and the quality of intelligence delivered**.

When in doubt: remove, simplify, and ask whether a CEO would trust this in a board meeting.

---

*ExecutiveOS Design Bible v1.0 — The executive intelligence platform.*
