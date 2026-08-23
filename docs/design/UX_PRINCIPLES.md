# ExecutiveOS UX Principles

## Executive User Model

Design for a person who is:

| Trait | Design Implication |
|-------|-------------------|
| **Busy** | 3-second scan rule; lead with conclusions |
| **Scanning** | F-pattern and top-left anchor; no deep reading required |
| **Interrupted** | State persists; no lost work; graceful resume |
| **Mobile** | Critical paths work on phone; desktop is primary but not exclusive |
| **Time-poor** | Every interaction ≤3 taps to value |
| **Accountability-focused** | Audit trail visible; actions reversible where possible |
| **Skeptical of AI** | Show sources, confidence, reasoning on demand |

**Confidence quickly:** First screen after login must show ≥1 relevant insight within 2 seconds of render.

---

## Navigation

### Principles
- **Persistent primary nav** — Never hamburger for core modules (Intelligence, Advisors, Graph, Calendar, Decisions, Initiatives)
- **Intelligence Center is home** — Logo returns to `/dashboard`, not marketing site
- **Context preserved** — Breadcrumbs on all sub-pages; back never loses unsaved work without warning
- **Command palette (⌘K)** — Power users jump anywhere; discoverable via footer hint

### Information Architecture

```
Intelligence Center (home)
├── Advisors (consult)
├── Chief of Staff (converse)
├── Calendar (time)
├── Knowledge Graph (relationships)
├── Initiatives (execution)
├── Decisions (judgment)
├── Meetings (record)
└── Settings (org, billing, integrations)
```

**Rule:** Maximum 2 levels deep to any primary action.

---

## Interaction

| Pattern | Standard |
|---------|----------|
| **Primary action** | One per view region; Ink 900 button |
| **Secondary action** | Ghost or bordered button |
| **Destructive** | Red text button, confirmation modal |
| **Inline edit** | Click-to-edit on titles; explicit save on forms |
| **Bulk actions** | Avoid in v1.0 — executives act on items individually |
| **Undo** | Required for delete/archive; 5-second toast with undo |

---

## Search

- **Global (⌘K):** Navigation + future entity search
- **Module search:** Intelligence Center insight filter; Graph semantic search
- **Search behavior:** Instant results; empty state suggests example queries
- **No search results:** "No matches for '[query]'. Try 'initiatives at risk' or browse the graph."

---

## Notifications

**Philosophy:** Few, high-signal, respectful of executive attention.

| Type | Channel (v1.0 → v1.5) | Frequency cap |
|------|---------------------|---------------|
| Critical attention | In-app badge → email (v1.5) | Max 3/day |
| Meeting prep ready | In-app | 1 per meeting |
| Decision review due | In-app | 1 per decision |
| Advisor response | In-app (if async, v2.0) | On completion |

**Never:** Marketing notifications in product. Push requires explicit opt-in.

---

## Filtering

- Filters appear as **tabs or pills**, not hidden dropdowns
- Active filter always visible
- Filter count shown: "Critical Attention (3)"
- Clear all filters in one tap

---

## Progressive Disclosure

| Level | Content |
|-------|---------|
| **Glance** | Score, title, one-line summary |
| **Scan** | Card body, badge, timestamp |
| **Read** | Expand analysis, graph connections |
| **Deep dive** | Full module (decision detail, graph expand) |

Default landing = Glance + Scan only.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` | Command palette |
| `G then D` | Go to Intelligence Center |
| `G then A` | Go to Advisors |
| `G then G` | Go to Graph |
| `Esc` | Close modal / palette |
| `/` | Focus search (in module) |

Document shortcuts in `?` help overlay (v1.0).

---

## Touch Behaviour

- Minimum touch target: 44×44px
- Swipe: not used for primary actions (accidental trigger risk)
- Pull-to-refresh: Intelligence Center only on mobile
- Long-press: no hidden menus — accessibility and discoverability conflict

---

## Error Recovery

| Error type | UX response |
|------------|-------------|
| **Network** | Inline retry + "Check connection" — preserve form input |
| **Auth expired** | Redirect to sign-in with return URL |
| **AI limit reached** | Clear upgrade path; show usage "847/1,000 requests" |
| **Integration failed** | Link to settings with provider status |
| **Empty data** | Actionable empty state — never blank screen |

**Tone:** Apologize once, explain once, offer action. No error codes visible to users unless support requested.

---

## Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| `<640px` | Single column; nav collapses to bottom tab bar (v1.0 mobile) |
| `640–1024px` | Two columns where applicable |
| `≥1024px` | Full layout; advisor panel beside conversation |
| `≥1280px` | Intelligence Center three-column card grid |

---

## UX Quality Bar

Before shipping any flow, validate with:

1. **5-second test** — Can a new executive identify the primary action?
2. **Interruption test** — Leave mid-flow, return — is state intact?
3. **Phone test** — Complete core action on iPhone Safari
4. **CoS test** — Can a Chief of Staff complete onboarding without founder help?

---

*Related: `INTELLIGENCE_CENTER_UX.md`, `CONCIERGE_ONBOARDING.md`, `MOTION_SYSTEM.md`*
