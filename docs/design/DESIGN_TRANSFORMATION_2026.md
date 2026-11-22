# ExecutiveOS Design Transformation — Visual OS (2026)

**Status:** Implemented locally — awaiting approval to commit / push / deploy  
**Scope:** Visual and interaction design only  
**Constraint:** No backend, schema, auth, RLS, forecasting, knowledge graph persistence, or API contract changes

---

## Pre-implementation deliverables (summary)

### 1. Current design audit

- Token stack: EOS → DS → EXDS → Experience 2 → EXS → Command Centre
- Product default was **light** institutional grey; dark tokens existed but were secondary
- EXS tokens were light-only (dark left `--exs-*` unset)
- Today = Mission Control → CommandCentreExperience (Brief → Investigate → Operate)
- Manufacturing = same `/today` path when snapshot `profileId === "manufacturing"`
- Knowledge live UI = Q&A workspace; SVG graph explorer unmounted (FE-001)
- Charts = custom SVG; motion = CSS only

### 2. Visual design system

- **Primary environment:** deep graphite / midnight charcoal / near-black
- **Accents:** Executive Blue, Intelligence Teal, Strategic Purple, Executive Gold (sparse)
- **Type:** Inter UI · Geist display/metrics · Geist Mono
- **Surfaces:** layered graphite, fine borders, restrained radius, soft elevation
- **Motion:** 140/280/520ms; reduced-motion respected
- Light theme remains available via Account menu

### 3. Application shell

- Narrower OS nav rail, Environment label, org identity in footer
- Header: module / briefing context, Outcome Health, ⌘K, account
- Nav active: Executive Blue accent bar + muted fill
- Routes unchanged

### 4. Today / Executive Briefing

- Dark Command Centre canvas via EXDS + command-centre.css tokens
- Cognitive switch loading (`BriefPreparingState`)
- Hero judgement remains first-viewport focal point
- Builders / hooks / analysis untouched

### 5. Manufacturing Command Centre

- Same shell; Evidence Lab tabs and manufacturing builders unchanged
- Heat map + forecast chart restyled for dark instruments
- **Limitation:** no geographic map library — region×model heat grid remains

### 6. Files changed

See git working tree (presentation CSS/TSX only). Key paths:

- `src/app/globals.css`, `layout.tsx`
- `ThemeProvider`, `AccountMenu`, `AppShell`, `ExecutiveNavigationItem`
- `experience/exs/tokens.css`, `themes/experience-2.css`
- `design-system/executive-experience/tokens.css`, `tokens.css`
- `mission-control/command-centre.css`, `CommandCentreExperience.tsx` (copy/classes only)
- `BriefPreparingState`, Knowledge / Strategy / Decision headers
- Reports / Data / Administration page chrome

### 7. Architectural boundaries (confirmed)

- No migrations, auth, RLS, org isolation, KG persistence, manufacturing calc, forecast logic, API contracts, fake data, or env var changes

---

## Validation

| Check | Result |
|-------|--------|
| Production build | Passed |
| Unit tests | 665 passed; 1 pre-existing failure (`organisation-portal/portal.test.ts` trial.active) |
| Integration tests | 4 passed |
| Routes | Unchanged; build lists `/today`, `/strategy`, `/decisions`, `/knowledge`, `/reports`, `/data`, `/administration` |

---

## Known limitations (documented, not fabricated)

1. Calendar Context and Recommended Actions lists are not on the live Command Centre data path — legacy only
2. Knowledge SVG graph explorer is not mounted — relationships use accented cards
3. No geographic map for manufacturing — heat grid is the instrument
4. Marketing surfaces retain their own visual language (out of product shell scope)

---

## Explicit confirmation

**No backend, database, architecture, or intelligence logic was modified.**  
Changes are CSS tokens, layout chrome, and presentation-layer React markup only.
