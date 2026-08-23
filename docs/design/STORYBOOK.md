# Storybook — UI documentation

**Status:** Sprint 3.5 Platform Foundation  
**Scope:** Document `src/components/ui/*` primitives without changing application behaviour.

## Commands

```bash
npm run storybook          # http://localhost:6006
npm run build-storybook    # static build → storybook-static/
```

## Configuration

| Path | Role |
|------|------|
| `.storybook/main.ts` | Stories glob, Vite aliases, addons |
| `.storybook/preview.tsx` | Dark-first decorator, backgrounds, a11y |
| `.storybook/storybook.css` | Font variable fallbacks for Storybook |
| `.storybook/mocks/next-link.tsx` | Stand-in for `next/link` |
| `.storybook/mocks/next-navigation.ts` | Stand-in for `next/navigation` |

Stories live beside components: `src/components/ui/*.stories.tsx`  
Catalogue intro: `src/components/ui/Introduction.mdx`

## Documented components

All exported UI primitives from `src/components/ui/index.ts` have stories:

Button, Badge, StatusBadge, Input, Textarea, Card, Avatar, Spinner, Skeleton, EmptyState, ErrorState, LoadingState, PageHeader, SectionHeader, MetricCard, Tabs, Tooltip, Breadcrumb, Dropdown, Modal, Drawer, Table, Timeline, ResponsiveGrid, Toast, CommandPalette.

## Notes

- Product feature surfaces (Briefing, Outcome Engine, Decision Engine) are **not** Storybook-covered in Sprint 3.5 — engines remain app-route documentation via ADRs / domain model.
- Some primitives still use legacy Tailwind zinc/emerald colors; see `docs/architecture/CONSTITUTION_INCONSISTENCIES.md` §D1.
- Autodocs is enabled via the `autodocs` tag in preview.
