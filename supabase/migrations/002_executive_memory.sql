-- Executive Memory: persistent knowledge base for the Executive Digital Twin

create table if not exists public.executive_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  memory_type text not null check (
    memory_type in (
      'decision',
      'meeting',
      'insight',
      'commitment',
      'risk',
      'opportunity',
      'achievement',
      'observation'
    )
  ),
  title text not null,
  content text not null,
  importance text not null check (
    importance in ('low', 'medium', 'high', 'critical')
  ),
  source text not null default 'manual',
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists executive_memory_user_id_created_at_idx
  on public.executive_memory (user_id, created_at desc)
  where archived_at is null;

create index if not exists executive_memory_user_id_importance_idx
  on public.executive_memory (user_id, importance, updated_at desc)
  where archived_at is null;

-- Reserved for future semantic / full-text search (embeddings added in a later migration)
create index if not exists executive_memory_user_id_title_content_idx
  on public.executive_memory (user_id)
  where archived_at is null;

alter table public.executive_memory enable row level security;

create policy "Users can read own executive memory"
  on public.executive_memory for select
  using (auth.uid() = user_id);

create policy "Users can insert own executive memory"
  on public.executive_memory for insert
  with check (auth.uid() = user_id);

create policy "Users can update own executive memory"
  on public.executive_memory for update
  using (auth.uid() = user_id);

create policy "Users can delete own executive memory"
  on public.executive_memory for delete
  using (auth.uid() = user_id);
