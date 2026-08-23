-- Executive Meeting Intelligence

create table if not exists public.executive_meetings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  meeting_date timestamptz not null,
  duration_minutes integer not null check (duration_minutes > 0),
  participants text[] not null default '{}',
  raw_notes text not null default '',
  meeting_summary text,
  archived_at timestamptz,
  analyzed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meeting_actions (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.executive_meetings (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  owner text,
  due_date date,
  status text not null default 'open' check (
    status in ('open', 'in_progress', 'completed', 'cancelled')
  ),
  sort_order smallint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists executive_meetings_user_id_meeting_date_idx
  on public.executive_meetings (user_id, meeting_date desc)
  where archived_at is null;

create index if not exists meeting_actions_meeting_id_idx
  on public.meeting_actions (meeting_id, sort_order);

alter table public.executive_meetings enable row level security;
alter table public.meeting_actions enable row level security;

create policy "Users can read own executive meetings"
  on public.executive_meetings for select
  using (auth.uid() = user_id);

create policy "Users can insert own executive meetings"
  on public.executive_meetings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own executive meetings"
  on public.executive_meetings for update
  using (auth.uid() = user_id);

create policy "Users can delete own executive meetings"
  on public.executive_meetings for delete
  using (auth.uid() = user_id);

create policy "Users can read own meeting actions"
  on public.meeting_actions for select
  using (auth.uid() = user_id);

create policy "Users can insert own meeting actions"
  on public.meeting_actions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own meeting actions"
  on public.meeting_actions for update
  using (auth.uid() = user_id);

create policy "Users can delete own meeting actions"
  on public.meeting_actions for delete
  using (auth.uid() = user_id);
