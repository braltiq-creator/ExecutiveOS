-- Executive Digital Twin onboarding tables
-- Run in Supabase SQL editor if not already applied.

create table if not exists public.executive_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade unique,
  full_name text,
  preferred_name text,
  job_title text,
  company text,
  industry text,
  country text,
  timezone text,
  company_size text,
  annual_revenue_band text,
  team_size integer,
  direct_reports integer,
  departments_responsible_for text,
  geographic_responsibility text,
  biggest_business_challenge text,
  biggest_leadership_challenge text,
  biggest_productivity_challenge text,
  business_systems text[] not null default '{}',
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.strategic_objectives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  executive_profile_id uuid not null references public.executive_profiles (id) on delete cascade,
  title text not null,
  description text,
  priority text not null check (priority in ('high', 'medium', 'low')),
  sort_order smallint not null check (sort_order between 1 and 3),
  created_at timestamptz not null default now(),
  unique (executive_profile_id, sort_order)
);

create index if not exists strategic_objectives_user_id_idx
  on public.strategic_objectives (user_id);

alter table public.executive_profiles enable row level security;
alter table public.strategic_objectives enable row level security;

create policy "Users can read own executive profile"
  on public.executive_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own executive profile"
  on public.executive_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own executive profile"
  on public.executive_profiles for update
  using (auth.uid() = user_id);

create policy "Users can read own strategic objectives"
  on public.strategic_objectives for select
  using (auth.uid() = user_id);

create policy "Users can insert own strategic objectives"
  on public.strategic_objectives for insert
  with check (auth.uid() = user_id);

create policy "Users can update own strategic objectives"
  on public.strategic_objectives for update
  using (auth.uid() = user_id);

create policy "Users can delete own strategic objectives"
  on public.strategic_objectives for delete
  using (auth.uid() = user_id);
