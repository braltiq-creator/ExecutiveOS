# ExecutiveOS Component Guidelines

## Consistency Rules (Global)

1. **One primary button per viewport region**
2. **Semantic color only** — never decorative color in data UI
3. **12px radius on cards** — always `radius-lg`
4. **15px body text** — never 16px in product (feels consumer)
5. **Ink 900 for primary actions** — not blue (blue = links/accents only)
6. **Icons 1.5px stroke** — Lucide standard
7. **Minimum 44px touch targets** on mobile
8. **WCAG AA contrast** on all text

---

## Cards

### Executive Insight Card
| Property | Value |
|----------|-------|
| Surface | White, border Slate 200, elevation-1 |
| Padding | 20px |
| Header | Overline category + score pill (Ink 900) |
| Title | h3, max 2 lines |
| Body | body-sm, Slate 600, max 3 lines |
| Footer | Text link with → |
| Hover | elevation-2, 100ms |
| Critical variant | Border Critical/30, bg `#FEF2F2` at 40% opacity — not full red |

### Metric Card
| Property | Value |
|----------|-------|
| Label | overline |
| Value | 32px mono semibold |
| Hint | caption, Slate 500 |
| No icon unless semantic |

### Advisor Card
| Property | Value |
|----------|-------|
| Accent | 8px dot, advisor color |
| Name | 13px semibold |
| Insight | 12px, 2 lines max |
| Confidence | caption, right-aligned |
| Full card clickable |

---

## Tables

| Property | Value |
|----------|-------|
| Header | Slate 50 bg, 11px uppercase tracking |
| Row height | 48px minimum |
| Border | Horizontal only, Slate 100 |
| Hover | Slate 50 row bg |
| Sort | Chevron icon, no heavy indicators |
| Mobile | Horizontal scroll or card collapse — never tiny columns |

**Use for:** Decision register, team list, billing history, admin errors — not Intelligence Center priorities.

---

## Buttons

| Variant | Background | Text | Border |
|---------|------------|------|--------|
| Primary | Ink 900 | White | none |
| Secondary | White | Ink 900 | Slate 200 |
| Ghost | transparent | Slate 700 | none |
| Danger | transparent | Critical | none |

| Size | Height | Padding | Font |
|------|--------|---------|------|
| sm | 36px | 12px | 13px |
| md | 44px | 16px | 14px |
| lg | 48px | 20px | 14px |

Loading: spinner replaces label; width preserved.

---

## Forms

| Element | Spec |
|---------|------|
| Label | 14px medium, Slate 700, above field |
| Input height | 44px |
| Border | Slate 200; focus Ink 900 ring |
| Error | Red border + caption below — never shake |
| Hint | caption, Slate 500 |
| Required | asterisk, not "required" text |

**Conversational onboarding:** One field per viewport; label becomes Chief of Staff question.

---

## Charts

| Property | Value |
|----------|-------|
| Palette | Ink 900, Meridian Blue, Success, Warning, Critical only |
| Grid | Slate 100, minimal |
| Labels | 12px, Slate 600 |
| No 3D, no gradients in chart fills |
| Health score | Arc or single bar — not pie charts |

---

## Avatars

| Size | Usage |
|------|-------|
| 32px | Inline mentions |
| 40px | Team list |
| 48px | Profile |

Fallback: Initials on Ink 900 circle, white text. No generic person silhouette.

---

## Badges

| Variant | Usage |
|---------|-------|
| Default | Slate 100 bg, Slate 700 text |
| Success | Success surface + text |
| Warning | Warning surface + text |
| Critical | Critical surface + text |
| Score | Ink 900 bg, white text, mono font |

Always sentence case except overlines. Never ALL CAPS except overline labels.

---

## Alerts

| Type | Border | Background | Icon |
|------|--------|------------|------|
| Info | Meridian Blue | `#EFF6FF` | ℹ stroke |
| Success | Success | `#ECFDF5` | ✓ |
| Warning | Warning | `#FFFBEB` | ⚠ |
| Error | Critical | `#FEF2F2` | ✕ |

Inline alerts only — no floating alert banners except critical system status.

---

## Navigation

| Element | Spec |
|---------|------|
| Header height | 64px |
| Nav item | 14px medium, Slate 700, hover Slate 900 |
| Active | Slate 900, subtle bottom border Ink 900 |
| Breadcrumb | 13px, `/` separator Slate 300 |
| Mobile bottom bar | 5 items max, 56px height |

---

## Dialogs

| Property | Value |
|----------|-------|
| Max width | 480px (confirm), 640px (form) |
| Radius | radius-xl |
| Overlay | Ink 900 @ 40% + blur 8px |
| Close | Top-right ×, 44px target |
| Actions | Right-aligned, secondary + primary |

Destructive confirmations: red primary button prohibited — use red text link "Delete" + neutral confirm.

---

## Timeline

| Property | Value |
|----------|-------|
| Row | Slate 50 inset, radius-lg, 12px padding |
| Time column | 112px fixed, caption |
| Type pill | 10px uppercase, semantic surface |
| Title | 14px semibold |
| Summary | 12px, Slate 600 |

---

## Knowledge Graph

| Property | Value |
|----------|-------|
| Canvas bg | Slate 50 |
| Node | Circle 32–48px by type; label below |
| Node colors | Type-specific muted fills — not neon |
| Edge | 1px Slate 400; selected Meridian Blue |
| Selected node | Ink 900 ring 2px |
| Controls | Bottom-left zoom; top-right search |
| Performance | Virtualize >100 nodes (v1.5) |

**Interaction:** Click select, double-click expand, drag pan, scroll zoom.

---

## Advisor Panel (Conversation)

| Property | Value |
|----------|-------|
| Layout | 60/40 chat / reasoning panel on desktop |
| Message user | Slate 100 bubble, right |
| Message advisor | White bubble, border, left |
| Reasoning panel | Slate 50 inset, collapsible sections |
| Input | Fixed bottom, 3 rows max textarea |

---

## Empty States

| Property | Value |
|----------|-------|
| Illustration | Meridian mark, 48px, Slate 300 |
| Title | h3 |
| Description | body-sm, max 2 lines, actionable |
| CTA | One primary button |
| Never | Sad faces, empty boxes clipart |

---

## Loading States

Use skeletons per `MOTION_SYSTEM.md`. Spinner only for button-level and inline refresh.

---

## Component Audit Checklist

Before shipping any component:

- [ ] Matches spacing tokens
- [ ] Uses semantic colors only
- [ ] Focus ring visible
- [ ] Touch target ≥44px
- [ ] Loading + empty + error states defined
- [ ] Reduced motion tested
- [ ] Documented in Storybook (v1.0)

---

*Related: `VISUAL_IDENTITY.md`, `MOTION_SYSTEM.md`, `src/components/ui/` (implementation reference)*
