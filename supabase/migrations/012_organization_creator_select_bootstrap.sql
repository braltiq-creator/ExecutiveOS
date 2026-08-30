-- Allow organization creators to SELECT rows they just inserted (RETURNING / bootstrap).
-- Fixes first-organization creation: INSERT … SELECT requires SELECT before membership exists.
-- Does not widen INSERT. Does not grant access to other users' organizations.

create policy "Creators can read organizations they created"
  on public.organizations for select
  using (
    archived_at is null
    and created_by = auth.uid()
  );
