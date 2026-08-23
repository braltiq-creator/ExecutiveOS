# Four-User Pilot Provisioning Procedure

Manual process for the first Design Partner pilot (Users A–D).  
No automated invite email. No new admin portal.

## Prerequisites

1. Production app deployed with this hardening commit.  
2. Supabase migrations **001–011** applied (includes `011_pilot_operating_loop`).  
3. Vercel Production env:
   - `NEXT_PUBLIC_EXECUTIVEOS_MOCK=false`
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_APP_URL` = Production URL  
4. Optional: `SYSTEM_ADMIN_EMAILS` = operator emails only.

## Per pilot user

| Step | Action |
|------|--------|
| 1 | Create Supabase Auth user (Dashboard) **or** self-serve `/get-started` |
| 2 | Confirm email if required |
| 3 | Sign in → `/organization` → **Create organisation** (1:1 user↔org recommended) |
| 4 | Role: `executive` (or `owner` if they administer the org) |
| 5 | Out-of-band: send URL, email, temporary password |
| 6 | User completes Snapshot Studio manufacturing upload → activate `/today` |
| 7 | Verify `/today` shows their data — not Northline / Alex Rivera / Helix |

## Teammate invite (optional)

1. Owner opens Team management.  
2. Invite by email → copy **invitation code**.  
3. Share code manually.  
4. Invitee signs up/in → join via code on `/organization`.

## Roles (existing — do not invent RBAC)

- `owner` — manage org / invites  
- `executive` — primary pilot user  
- `manager` / `contributor` / `viewer` — optional

## Isolation rules for operators

- One browser profile (or machine) per user.  
- Never use `?demo=1` in pilot sessions.  
- After logout on a shared machine: clear site data before another user logs in.

## Password recovery

Supabase Dashboard → Auth → Users → reset. No in-app reset UI yet.
