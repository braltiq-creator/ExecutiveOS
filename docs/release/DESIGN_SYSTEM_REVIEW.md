# Design System Review — Version 1

## Verdict

Executive surfaces (Today, Strategy, Value, Administration hub) share Experience 2.0 language. Forms and older registers still use `components/ui`. This is **acceptable for V1** if no fourth system is introduced.

## Tokens

| Concern | Source of truth | Status |
|---------|-----------------|--------|
| Colour / semantic | `design-system/tokens.css` + `--eos-*` / `--ex-*` in `globals.css` | Consistent on Experience paths |
| Typography | Experience type scale (`ex-display`, `ex-heading`, `ex-body`, `ex-caption`) | Prefer over Inter/system defaults |
| Spacing | Brief sections + `space-y-*` patterns | Generally calm; avoid card stacks in hero |
| Motion | `experience/motion` + `prefers-reduced-motion` | Intentional; keep sparse |

## Hierarchy

1. **Brand / greeting** — Brief header  
2. **Strategic outcomes** — before tactics  
3. **Recommendations** — five-question cards + trust  
4. **Supporting** — agenda, overnight, expandable detail  

## States

| State | Experience | UI kit | Global |
|-------|------------|--------|--------|
| Empty | `ExperienceEmptyState` | `EmptyState` | — |
| Loading | `LoadingState` | `LoadingState` / Skeleton | `app/loading.tsx`, `today/loading.tsx` |
| Error | `ErrorState` | `ErrorState` | `app/error.tsx`, `ErrorBoundary` |

**V1 rule:** New executive empty/loading/error UI uses Experience primitives.

## Accessibility

- Skip link in AppShell  
- Focus-visible rings  
- ARIA on modal/tabs/loading  
- Contrast preferences in CSS  
- Gap: automated axe in CI (FE-009)

## Responsive

- Brief width constrained (`ExperiencePage width="brief"`)  
- Admin dashboards use wider shells  
- Primary nav six items — verify collapse behaviour on small screens before public GA

## Navigation

Primary: Today · Strategy · Decisions · Knowledge · Reports · Administration  
Utility (palette): adaptive, commercial, experiments, trust, providers, …

## Simplification

- Do **not** expand `ExecutiveSurface` / unused DS 1.0 primitives  
- Prefer Experience CardShell over nested bordered cards  
- Align Knowledge/Reports foundations to Experience empty pattern (Phase 33)
