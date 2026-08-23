-- Pilot operating loop — durable org-scoped Snapshot / Decision / Action state.
-- Authoritative SoT for Design Partner Manufacturing (and commercial) pilot path.
-- Process Maps / browser localStorage are NOT authoritative after this migration.

create table if not exists public.pilot_executive_snapshots (
  id text primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  studio_id text,
  profile_id text not null,
  profile_label text,
  organisation_name text,
  source_kind text,
  filename text,
  record_count integer not null default 0,
  confidence_overall numeric,
  -- Immutable activation payload (context + analysis + initial portfolio).
  context_payload jsonb not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.pilot_outcome_portfolios (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  origin_snapshot_id text not null references public.pilot_executive_snapshots (id) on delete restrict,
  portfolio jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  primary key (organization_id, origin_snapshot_id)
);

-- Normalized decision rows for isolation queries (mirrors portfolio.decisions).
create table if not exists public.pilot_decisions (
  id text not null,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  origin_snapshot_id text not null references public.pilot_executive_snapshots (id) on delete restrict,
  selection_state text,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (organization_id, id)
);

create table if not exists public.pilot_actions (
  id text not null,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  decision_id text not null,
  origin_snapshot_id text not null references public.pilot_executive_snapshots (id) on delete restrict,
  owner text,
  due_date text,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (organization_id, id)
);

create index if not exists pilot_snapshots_org_created_idx
  on public.pilot_executive_snapshots (organization_id, created_at desc);

create index if not exists pilot_decisions_org_snapshot_idx
  on public.pilot_decisions (organization_id, origin_snapshot_id);

create index if not exists pilot_actions_org_decision_idx
  on public.pilot_actions (organization_id, decision_id);

alter table public.pilot_executive_snapshots enable row level security;
alter table public.pilot_outcome_portfolios enable row level security;
alter table public.pilot_decisions enable row level security;
alter table public.pilot_actions enable row level security;

-- Reuse org membership helper when present (migration 006).
do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'is_active_organization_member'
  ) then
    create policy "pilot_snapshots_member_select"
      on public.pilot_executive_snapshots for select
      using (public.is_active_organization_member(organization_id));
    create policy "pilot_snapshots_member_insert"
      on public.pilot_executive_snapshots for insert
      with check (public.is_active_organization_member(organization_id));
    -- No update/delete policies — snapshots are immutable via RLS.

    create policy "pilot_portfolios_member_select"
      on public.pilot_outcome_portfolios for select
      using (public.is_active_organization_member(organization_id));
    create policy "pilot_portfolios_member_insert"
      on public.pilot_outcome_portfolios for insert
      with check (public.is_active_organization_member(organization_id));
    create policy "pilot_portfolios_member_update"
      on public.pilot_outcome_portfolios for update
      using (public.is_active_organization_member(organization_id));

    create policy "pilot_decisions_member_select"
      on public.pilot_decisions for select
      using (public.is_active_organization_member(organization_id));
    create policy "pilot_decisions_member_insert"
      on public.pilot_decisions for insert
      with check (public.is_active_organization_member(organization_id));
    create policy "pilot_decisions_member_update"
      on public.pilot_decisions for update
      using (public.is_active_organization_member(organization_id));

    create policy "pilot_actions_member_select"
      on public.pilot_actions for select
      using (public.is_active_organization_member(organization_id));
    create policy "pilot_actions_member_insert"
      on public.pilot_actions for insert
      with check (public.is_active_organization_member(organization_id));
    create policy "pilot_actions_member_update"
      on public.pilot_actions for update
      using (public.is_active_organization_member(organization_id));
  end if;
end $$;
