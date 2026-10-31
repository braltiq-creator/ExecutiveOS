<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- Install with `npm ci`. Start the app with `npm run dev`. Next.js 16 listens on `0.0.0.0:3000`.
- Non-production mock mode stays on unless `NEXT_PUBLIC_EXECUTIVEOS_MOCK=false`. Open the Command Centre at `/today?demo=1` (Alex Rivera, Northline Systems). Approving a decision such as `/decisions/decision-residency` updates Organisation Health on Today. Supabase, Stripe, and OpenAI credentials are optional for this flow.
- `npm run build` compiles and typechecks. `npm test` runs Vitest. `npm run lint` already reports issues on main. The organisation-portal trial case that uses fixture date `2026-08-08` fails once the clock is past that 30-day trial window.
