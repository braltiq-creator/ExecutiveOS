-- Executive Decision Register

create table if not exists public.executive_decisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  summary text not null,
  decision_reason text not null,
  alternatives_considered text,
  expected_outcome text not null,
  status text not null default 'draft' check (
    status in (
      'draft',
      'approved',
      'in_progress',
      'implemented',
      'under_review',
      'archived'
    )
  ),
  owner text not null,
  decision_date date not null,
  review_date date,
  strategic_objective_id uuid references public.strategic_objectives (id) on delete set null,
  risk_level text not null default 'medium' check (
    risk_level in ('low', 'medium', 'high', 'critical')
  ),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists executive_decisions_user_id_decision_date_idx
  on public.executive_decisions (user_id, decision_date desc)
  where archived_at is null;

create index if not exists executive_decisions_user_id_status_idx
  on public.executive_decisions (user_id, status)
  where archived_at is null;

create index if not exists executive_decisions_user_id_review_date_idx
  on public.executive_decisions (user_id, review_date)
  where archived_at is null;

alter table public.executive_decisions enable row level security;

create policy "Users can read own executive decisions"
  on public.executive_decisions for select
  using (auth.uid() = user_id);

create policy "Users can insert own executive decisions"
  on public.executive_decisions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own executive decisions"
  on public.executive_decisions for update
  using (auth.uid() = user_id);

create policy "Users can delete own executive decisions"
  on public.executive_decisions for delete
  using (auth.uid() = user_id);
