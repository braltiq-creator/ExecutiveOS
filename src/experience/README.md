# Experience 2.0

## Purpose

Presentation layer for the executive product. Renders Core and platform intelligence
without modifying engines.

## Architecture

```
runtime/experience → snapshot + attachments
        ↓
executive-brief (client) → design-system + motion + cards
```

## Public APIs

- `@/experience` — theme, type helpers, re-exports
- `@/experience/design-system/*` — Button, Card, Badge, Empty/Loading/Error
- `@/experience/executive-brief` — `ExecutiveBrief`, `actionToExperienceCard`
- `@/experience/layouts/*` — `ExperiencePage`, `BriefSection`

## Extension guidance

1. New executive screens compose Experience primitives.
2. Do not introduce another design-system package.
3. Keep Brief hierarchy: value → outcomes → summary → recommendations.

## Developer notes

- Calm warm light (`#F7F8FA` family via tokens). Cards only when interactive.
- Adaptive/Trust fields surface through `actionToExperienceCard` only.

## Future Intelligence Profiles

Profile projection supplies copy and emphasis; Experience stays profile-agnostic packaging.
