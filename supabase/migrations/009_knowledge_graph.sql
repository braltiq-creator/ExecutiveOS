-- Executive knowledge graph for ExecutiveOS
-- Run after migrations 001–008.

create table if not exists public.knowledge_nodes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  node_type text not null check (
    node_type in (
      'executive',
      'organization',
      'department',
      'person',
      'meeting',
      'decision',
      'initiative',
      'objective',
      'risk',
      'opportunity',
      'action',
      'memory',
      'calendar_event',
      'email',
      'document',
      'crm_opportunity',
      'task'
    )
  ),
  source_type text not null,
  source_id text not null,
  label text not null,
  summary text,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, node_type, source_type, source_id)
);

create table if not exists public.knowledge_edges (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  source_node_id uuid not null references public.knowledge_nodes (id) on delete cascade,
  target_node_id uuid not null references public.knowledge_nodes (id) on delete cascade,
  edge_type text not null check (
    edge_type in (
      'owns',
      'attended',
      'related_to',
      'created',
      'assigned_to',
      'blocks',
      'supports',
      'depends_on',
      'references',
      'generated',
      'connected_to'
    )
  ),
  weight numeric(5, 2) not null default 1.0,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (organization_id, source_node_id, target_node_id, edge_type)
);

create table if not exists public.knowledge_labels (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references public.knowledge_nodes (id) on delete cascade,
  label text not null,
  created_at timestamptz not null default now(),
  unique (node_id, label)
);

create table if not exists public.knowledge_index (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references public.knowledge_nodes (id) on delete cascade unique,
  search_text text not null,
  token_count integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.graph_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  node_count integer not null default 0,
  edge_count integer not null default 0,
  snapshot_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists knowledge_nodes_org_type_idx
  on public.knowledge_nodes (organization_id, node_type);

create index if not exists knowledge_nodes_source_idx
  on public.knowledge_nodes (organization_id, source_type, source_id);

create index if not exists knowledge_nodes_user_idx
  on public.knowledge_nodes (user_id, updated_at desc);

create index if not exists knowledge_edges_org_idx
  on public.knowledge_edges (organization_id, edge_type);

create index if not exists knowledge_edges_source_idx
  on public.knowledge_edges (source_node_id);

create index if not exists knowledge_edges_target_idx
  on public.knowledge_edges (target_node_id);

create index if not exists knowledge_index_search_idx
  on public.knowledge_index using gin (to_tsvector('english', search_text));

create index if not exists graph_snapshots_org_idx
  on public.graph_snapshots (organization_id, created_at desc);

alter table public.knowledge_nodes enable row level security;
alter table public.knowledge_edges enable row level security;
alter table public.knowledge_labels enable row level security;
alter table public.knowledge_index enable row level security;
alter table public.graph_snapshots enable row level security;

create policy "Org members can read knowledge nodes"
  on public.knowledge_nodes for select
  using (public.is_active_organization_member(organization_id));

create policy "Org owners can manage knowledge nodes"
  on public.knowledge_nodes for all
  using (public.is_organization_owner(organization_id))
  with check (public.is_organization_owner(organization_id));

create policy "Org members can read knowledge edges"
  on public.knowledge_edges for select
  using (public.is_active_organization_member(organization_id));

create policy "Org owners can manage knowledge edges"
  on public.knowledge_edges for all
  using (public.is_organization_owner(organization_id))
  with check (public.is_organization_owner(organization_id));

create policy "Org members can read knowledge labels"
  on public.knowledge_labels for select
  using (
    exists (
      select 1 from public.knowledge_nodes kn
      where kn.id = node_id
        and public.is_active_organization_member(kn.organization_id)
    )
  );

create policy "Org owners can manage knowledge labels"
  on public.knowledge_labels for all
  using (
    exists (
      select 1 from public.knowledge_nodes kn
      where kn.id = node_id
        and public.is_organization_owner(kn.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.knowledge_nodes kn
      where kn.id = node_id
        and public.is_organization_owner(kn.organization_id)
    )
  );

create policy "Org members can read knowledge index"
  on public.knowledge_index for select
  using (
    exists (
      select 1 from public.knowledge_nodes kn
      where kn.id = node_id
        and public.is_active_organization_member(kn.organization_id)
    )
  );

create policy "Org owners can manage knowledge index"
  on public.knowledge_index for all
  using (
    exists (
      select 1 from public.knowledge_nodes kn
      where kn.id = node_id
        and public.is_organization_owner(kn.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.knowledge_nodes kn
      where kn.id = node_id
        and public.is_organization_owner(kn.organization_id)
    )
  );

create policy "Org members can read graph snapshots"
  on public.graph_snapshots for select
  using (public.is_active_organization_member(organization_id));

create policy "Org owners can manage graph snapshots"
  on public.graph_snapshots for all
  using (public.is_organization_owner(organization_id))
  with check (public.is_organization_owner(organization_id));
