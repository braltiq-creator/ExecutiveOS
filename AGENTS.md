<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- Node 22 is on the login-shell PATH. Install dependencies with `npm ci`. The dev server is `npm run dev -- --hostname 0.0.0.0 --port 3000`.
- Non-production mock mode stays on unless `NEXT_PUBLIC_EXECUTIVEOS_MOCK=false`. Supabase, OpenAI, and Stripe secrets are not required for the marketing site or the demo Command Centre.
- The populated Command Centre is `http://localhost:3000/today?demo=1`. Opening `/today` without that query shows the empty snapshot state until a snapshot is activated. From the demo Command Centre, open a judgement item, then use the Decisions nav item to reach the decision portfolio.
- CI typecheck is `npx tsc --noEmit` and CI tests are `npm run test:smoke`. Both currently fail on existing repository issues (test type errors and one organisation-portal assertion). `npm run build` and `npx vitest run tests/integration` succeed.
