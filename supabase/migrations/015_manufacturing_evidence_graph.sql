-- Manufacturing Evidence Graph.
-- Snapshot-scoped fact grain plus evidence-backed entities and relationships.
-- This is not the executive knowledge graph (knowledge_nodes / knowledge_edges).
-- Provenance is USER_PROVIDED only. SYNTHETIC cannot be stored.
-- A later weekly snapshot inserts new rows. It does not update a previous snapshot.

create table if not exists public.manufacturing_snapshot_scopes (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  snapshot_id text not null,
  organisation_label text,
  evidence_id uuid references public.organization_evidence (id) on delete restrict,
  provenance text not null default 'USER_PROVIDED'
    check (provenance = 'USER_PROVIDED'),
  created_at timestamptz not null default now(),
  primary key (organization_id, snapshot_id)
);

create table if not exists public.manufacturing_snapshot_facts (
  id text primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  snapshot_id text not null,
  evidence_id uuid references public.organization_evidence (id) on delete restrict,
  source_record_id text not null,
  period text,
  region text,
  branch text,
  dealer text,
  machine_model text,
  machine_variant text,
  factory text,
  demand_quantity double precision,
  order_quantity double precision,
  inventory_quantity double precision,
  capacity_quantity double precision,
  forecast_quantity double precision,
  provenance text not null default 'USER_PROVIDED'
    check (provenance = 'USER_PROVIDED'),
  created_at timestamptz not null default now(),
  unique (organization_id, snapshot_id, source_record_id)
);

create table if not exists public.manufacturing_graph_entities (
  id text primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  snapshot_id text not null,
  evidence_id uuid not null references public.organization_evidence (id) on delete restrict,
  entity_type text not null
    check (entity_type in (
      'Organisation',
      'Region',
      'Dealer',
      'Branch',
      'MachineModel',
      'MachineVariant',
      'Factory',
      'Demand',
      'Order',
      'Inventory',
      'Capacity',
      'Forecast'
    )),
  entity_key text not null,
  label text not null,
  quantity double precision,
  provenance text not null default 'USER_PROVIDED'
    check (provenance = 'USER_PROVIDED'),
  source_record_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (organization_id, snapshot_id, entity_type, entity_key)
);

create table if not exists public.manufacturing_graph_relationships (
  id text primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  snapshot_id text not null,
  evidence_id uuid not null references public.organization_evidence (id) on delete restrict,
  relationship_type text not null
    check (relationship_type in (
      'CONTAINS',
      'LOCATED_IN',
      'DEMANDS',
      'HAS_VARIANT',
      'PLANNED_AT',
      'HAS_CAPACITY',
      'FOR_MODEL',
      'FOR_REGION',
      'THROUGH_DEALER',
      'CONSTRAINED_BY'
    )),
  from_entity_id text not null references public.manufacturing_graph_entities (id) on delete cascade,
  to_entity_id text not null references public.manufacturing_graph_entities (id) on delete cascade,
  from_entity_type text not null,
  to_entity_type text not null,
  from_entity_key text not null,
  to_entity_key text not null,
  provenance text not null default 'USER_PROVIDED'
    check (provenance = 'USER_PROVIDED'),
  source_record_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (
    organization_id,
    snapshot_id,
    relationship_type,
    from_entity_id,
    to_entity_id
  )
);

create index if not exists manufacturing_snapshot_facts_org_snapshot_idx
  on public.manufacturing_snapshot_facts (organization_id, snapshot_id);

create index if not exists manufacturing_graph_entities_org_snapshot_idx
  on public.manufacturing_graph_entities (organization_id, snapshot_id, entity_type);

create index if not exists manufacturing_graph_relationships_org_snapshot_idx
  on public.manufacturing_graph_relationships (organization_id, snapshot_id, relationship_type);

create index if not exists manufacturing_graph_relationships_from_idx
  on public.manufacturing_graph_relationships (organization_id, snapshot_id, from_entity_id);

create index if not exists manufacturing_graph_relationships_to_idx
  on public.manufacturing_graph_relationships (organization_id, snapshot_id, to_entity_id);

-- Facts and scopes may receive an evidence id once. Business columns stay fixed.
create or replace function public.meg_reject_fact_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.id is distinct from old.id
     or new.organization_id is distinct from old.organization_id
     or new.snapshot_id is distinct from old.snapshot_id
     or new.source_record_id is distinct from old.source_record_id
     or new.period is distinct from old.period
     or new.region is distinct from old.region
     or new.branch is distinct from old.branch
     or new.dealer is distinct from old.dealer
     or new.machine_model is distinct from old.machine_model
     or new.machine_variant is distinct from old.machine_variant
     or new.factory is distinct from old.factory
     or new.demand_quantity is distinct from old.demand_quantity
     or new.order_quantity is distinct from old.order_quantity
     or new.inventory_quantity is distinct from old.inventory_quantity
     or new.capacity_quantity is distinct from old.capacity_quantity
     or new.forecast_quantity is distinct from old.forecast_quantity
     or new.provenance is distinct from old.provenance
     or new.created_at is distinct from old.created_at
  then
    raise exception 'manufacturing snapshot facts are immutable';
  end if;
  if old.evidence_id is not null and new.evidence_id is distinct from old.evidence_id then
    raise exception 'manufacturing snapshot fact evidence binding is immutable';
  end if;
  return new;
end;
$$;

create or replace function public.meg_reject_scope_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.organization_id is distinct from old.organization_id
     or new.snapshot_id is distinct from old.snapshot_id
     or new.organisation_label is distinct from old.organisation_label
     or new.provenance is distinct from old.provenance
     or new.created_at is distinct from old.created_at
  then
    raise exception 'manufacturing snapshot scope is immutable';
  end if;
  if old.evidence_id is not null and new.evidence_id is distinct from old.evidence_id then
    raise exception 'manufacturing snapshot evidence binding is immutable';
  end if;
  return new;
end;
$$;

drop trigger if exists meg_facts_immutable on public.manufacturing_snapshot_facts;
create trigger meg_facts_immutable
  before update on public.manufacturing_snapshot_facts
  for each row
  execute function public.meg_reject_fact_mutation();

drop trigger if exists meg_scopes_immutable on public.manufacturing_snapshot_scopes;
create trigger meg_scopes_immutable
  before update on public.manufacturing_snapshot_scopes
  for each row
  execute function public.meg_reject_scope_mutation();

alter table public.manufacturing_snapshot_scopes enable row level security;
alter table public.manufacturing_snapshot_facts enable row level security;
alter table public.manufacturing_graph_entities enable row level security;
alter table public.manufacturing_graph_relationships enable row level security;

drop policy if exists manufacturing_snapshot_scopes_select on public.manufacturing_snapshot_scopes;
create policy manufacturing_snapshot_scopes_select
  on public.manufacturing_snapshot_scopes
  for select
  to authenticated
  using (public.is_active_organization_member(organization_id));

drop policy if exists manufacturing_snapshot_scopes_insert on public.manufacturing_snapshot_scopes;
create policy manufacturing_snapshot_scopes_insert
  on public.manufacturing_snapshot_scopes
  for insert
  to authenticated
  with check (public.is_active_organization_member(organization_id));

drop policy if exists manufacturing_snapshot_scopes_update on public.manufacturing_snapshot_scopes;
create policy manufacturing_snapshot_scopes_update
  on public.manufacturing_snapshot_scopes
  for update
  to authenticated
  using (public.is_active_organization_member(organization_id))
  with check (public.is_active_organization_member(organization_id));

drop policy if exists manufacturing_snapshot_facts_select on public.manufacturing_snapshot_facts;
create policy manufacturing_snapshot_facts_select
  on public.manufacturing_snapshot_facts
  for select
  to authenticated
  using (public.is_active_organization_member(organization_id));

drop policy if exists manufacturing_snapshot_facts_insert on public.manufacturing_snapshot_facts;
create policy manufacturing_snapshot_facts_insert
  on public.manufacturing_snapshot_facts
  for insert
  to authenticated
  with check (public.is_active_organization_member(organization_id));

drop policy if exists manufacturing_snapshot_facts_update on public.manufacturing_snapshot_facts;
create policy manufacturing_snapshot_facts_update
  on public.manufacturing_snapshot_facts
  for update
  to authenticated
  using (public.is_active_organization_member(organization_id))
  with check (public.is_active_organization_member(organization_id));

drop policy if exists manufacturing_graph_entities_select on public.manufacturing_graph_entities;
create policy manufacturing_graph_entities_select
  on public.manufacturing_graph_entities
  for select
  to authenticated
  using (public.is_active_organization_member(organization_id));

drop policy if exists manufacturing_graph_entities_insert on public.manufacturing_graph_entities;
create policy manufacturing_graph_entities_insert
  on public.manufacturing_graph_entities
  for insert
  to authenticated
  with check (public.is_active_organization_member(organization_id));

drop policy if exists manufacturing_graph_relationships_select on public.manufacturing_graph_relationships;
create policy manufacturing_graph_relationships_select
  on public.manufacturing_graph_relationships
  for select
  to authenticated
  using (public.is_active_organization_member(organization_id));

drop policy if exists manufacturing_graph_relationships_insert on public.manufacturing_graph_relationships;
create policy manufacturing_graph_relationships_insert
  on public.manufacturing_graph_relationships
  for insert
  to authenticated
  with check (public.is_active_organization_member(organization_id));
