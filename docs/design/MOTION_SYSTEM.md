# ExecutiveOS Motion System

## Motion Philosophy

Motion in ExecutiveOS **confirms state change** and **builds confidence**. It never decorates, entertains, or delays.

**Reference:** Linear (speed), Apple (restraint), Stripe (functional polish)

**Default:** If removing the animation doesn't reduce clarity, remove it.

---

## Timing Scale

| Token | Duration | Usage |
|-------|----------|-------|
| `instant` | 0ms | Reduced motion fallback |
| `fast` | 100ms | Hover, focus, toggle |
| `normal` | 200ms | Page transitions, fades, tab switch |
| `moderate` | 300ms | Card expand, modal enter |
| `slow` | 400ms | Score count-up, graph node appear |
| `deliberate` | 600ms | Onboarding graph build (max) |

**Easing:**

| Token | Curve | Usage |
|-------|-------|-------|
| `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Enter animations |
| `ease-in` | `cubic-bezier(0.7, 0, 0.84, 0)` | Exit animations |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | State change |

**Never:** Bounce, elastic, spring overshoot in product UI.

---

## Page Transitions

| Transition | Spec |
|------------|------|
| Module navigation | 200ms fade; no slide (disorienting for executives) |
| Modal open | 300ms fade + 8px translate Y (from below) |
| Modal close | 200ms fade out |
| Drawer open | 300ms slide from right |
| Drawer close | 200ms slide out |

---

## Hover Behaviour

| Element | Hover |
|---------|-------|
| Cards | `elevation-1` → `elevation-2`, 100ms; border Slate 200 → Slate 300 |
| Buttons primary | Ink 900 → Ink 800, 100ms |
| Buttons secondary | bg white → Slate 50, 100ms |
| Links | underline appear, 100ms |
| Nav items | bg Slate 50, 100ms |

**No:** Scale transform on hover ( feels consumer-app).

---

## Loading Animations

| Pattern | Spec |
|---------|------|
| **Skeleton shimmer** | Slate 100 → Slate 200 gradient, 1.5s loop, opacity 0.5 |
| **Spinner** | 1 rotation/sec, 1.5px stroke, inherit color |
| **Progress bar** | Indeterminate: 2s loop; determinate: width transition 300ms |
| **Graph building** | Nodes fade-in 400ms stagger 50ms; edges draw 300ms |

**Rule:** Show skeleton within 100ms of navigation. Never blank white >200ms.

---

## Micro Interactions

| Action | Feedback |
|--------|----------|
| Button click | 100ms scale 0.98 → 1 (subtle) |
| Toggle | 200ms slide + color |
| Checkbox | 150ms check draw |
| Copy | Toast slide-up 200ms |
| Save success | Green check 400ms fade |
| Delete confirm | Modal shake prohibited — calm confirm only |

---

## Success Animations

| Context | Animation |
|---------|-------------|
| Decision saved | Toast: "Decision recorded" — 200ms slide up, 4s display |
| Initiative created | Brief green border flash on new card, 400ms |
| Graph rebuilt | "Graph updated" meta text pulse once |
| Onboarding complete | Meridian mark draw 600ms → fade to Intelligence Center |

**Never:** Confetti, celebration modals, achievement badges.

---

## Notification Behaviour

| Type | Enter | Exit |
|------|-------|------|
| Toast | Slide up 200ms + fade | Fade 200ms after 4s |
| Inline alert | Fade in 200ms | Dismiss fade 200ms |
| Critical banner | Slide down 300ms (Intelligence Center only) | Manual dismiss |

Maximum 3 toasts stacked. New toast replaces oldest.

---

## Skeleton Loading Standards

Skeleton shapes must **match final layout exactly** — same heights, same grid.

| Component | Skeleton |
|-----------|----------|
| Priority strip | Ink 800 rectangle, 120px height |
| Card | Title bar 60% width + 3 text lines |
| Timeline row | Time block + 2 lines |
| Advisor card | Dot + 2 lines |
| Metric tile | Number block 48px + label 40% |

---

## Intelligence Center Specific

| Moment | Motion |
|--------|--------|
| First load | Stagger cards 50ms delay each, max 6 |
| Refresh | Changed cards: background flash `#EFF6FF` 400ms |
| Score update | Count-up 400ms ease-out |
| Digest switch | Crossfade 200ms |
| New critical item | Single subtle pulse on strip border (once) |

---

## Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  /* All durations → 0ms; opacity-only transitions permitted */
}
```

- No motion-required information
- Pause/stop not needed (no infinite decorative animation except skeleton — respects reduced motion)
- Vestibular safety: no parallax, no zoom transitions

---

*Related: `INTELLIGENCE_CENTER_UX.md`, `COMPONENT_GUIDELINES.md`, `VISUAL_IDENTITY.md`*
