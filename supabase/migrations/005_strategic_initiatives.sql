-- Strategic Initiative Management

create table if not exists public.strategic_initiatives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text not null default '',
  status text not null default 'planned' check (
    status in ('planned', 'active', 'on_hold', 'completed', 'archived')
  ),
  priority text not null default 'medium' check (
    priority in ('low', 'medium', 'high', 'critical')
  ),
  owner text not null,
  start_date date not null,
  target_date date,
  progress_percentage smallint not null default 0 check (
    progress_percentage between 0 and 100
  ),
  health_status text not null default 'on_track' check (
    health_status in ('on_track', 'at_risk', 'off_track', 'completed')
  ),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.initiative_links (
  id uuid primary key default gen_random_uuid(),
  initiative_id uuid not null references public.strategic_initiatives (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  link_type text not null check (
    link_type in (
      'objective',
      'decision',
      'meeting',
      'memory',
      'meeting_action',
      'risk',
      'opportunity'
    )
  ),
  linked_id uuid not null,
  created_at timestamptz not null default now(),
  unique (initiative_id, link_type, linked_id)
);

create index if not exists strategic_initiatives_user_id_status_idx
  on public.strategic_initiatives (user_id, status)
  where archived_at is null;

create index if not exists strategic_initiatives_user_id_health_idx
  on public.strategic_initiatives (user_id, health_status)
  where archived_at is null;

create index if not exists initiative_links_initiative_id_idx
  on public.initiative_links (initiative_id);

create index if not exists initiative_links_user_id_idx
  on public.initiative_links (user_id, link_type);

alter table public.strategic_initiatives enable row level security;
alter table public.initiative_links enable row level security;

create policy "Users can read own strategic initiatives"
  on public.strategic_initiatives for select
  using (auth.uid() = user_id);

create policy "Users can insert own strategic initiatives"
  on public.strategic_initiatives for insert
  with check (auth.uid() = user_id);

create policy "Users can update own strategic initiatives"
  on public.strategic_initiatives for update
  using (auth.uid() = user_id);

create policy "Users can delete own strategic initiatives"
  on public.strategic_initiatives for delete
  using (auth.uid() = user_id);

create policy "Users can read own initiative links"
  on public.initiative_links for select
  using (auth.uid() = user_id);

create policy "Users can insert own initiative links"
  on public.initiative_links for insert
  with check (auth.uid() = user_id);

create policy "Users can update own initiative links"
  on public.initiative_links for update
  using (auth.uid() = user_id);

create policy "Users can delete own initiative links"
  on public.initiative_links for delete
  using (auth.uid() = user_id);
