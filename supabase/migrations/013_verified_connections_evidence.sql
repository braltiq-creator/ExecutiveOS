-- Phase 37 — Verified Connections & Evidence Infrastructure
-- Extends organization_integrations with verification lifecycle.
-- Adds durable evidence + claims (organisation-scoped, RLS).
-- SYNTHETIC provenance is rejected at the database layer (Production safety).
-- Run after 012. Do NOT modify 010.

-- ---------------------------------------------------------------------------
-- 1) Expand provider catalog constraints for Simpro
-- ---------------------------------------------------------------------------

alter table public.integration_providers
  drop constraint if exists integration_providers_category_check;

alter table public.integration_providers
  add constraint integration_providers_category_check check (
    category in (
      'productivity',
      'calendar',
      'email',
      'communication',
      'crm',
      'project',
      'documentation',
      'development',
      'storage',
      'operations'
    )
  );

alter table public.integration_providers
  drop constraint if exists integration_providers_vendor_check;

alter table public.integration_providers
  add constraint integration_providers_vendor_check check (
    vendor in (
      'microsoft',
      'google',
      'slack',
      'salesforce',
      'hubspot',
      'atlassian',
      'notion',
      'github',
      'asana',
      'monday',
      'executiveos',
      'simpro'
    )
  );

insert into public.integration_providers (
  id,
  name,
  description,
  category,
  vendor,
  auth_type,
  context_domains,
  capabilities_json,
  display_order,
  is_available
)
values (
  'simpro',
  'Simpro',
  'Connect field-service operations for verified jobs, customers, and capacity evidence.',
  'operations',
  'simpro',
  'api_key',
  array['tasks']::text[],
  '{"sync": true, "verification": true}'::jsonb,
  16,
  true
)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  vendor = excluded.vendor,
  auth_type = excluded.auth_type,
  context_domains = excluded.context_domains,
  capabilities_json = excluded.capabilities_json,
  display_order = excluded.display_order,
  is_available = excluded.is_available;

-- ---------------------------------------------------------------------------
-- 2) Verified connection lifecycle columns on organization_integrations
-- ---------------------------------------------------------------------------

alter table public.organization_integrations
  add column if not exists connection_status text not null default 'not_connected';

alter table public.organization_integrations
  add column if not exists authentication_status text not null default 'none';

alter table public.organization_integrations
  add column if not exists verification_status text not null default 'unverified';

alter table public.organization_integrations
  add column if not exists scopes text[] not null default '{}'::text[];

alter table public.organization_integrations
  add column if not exists connected_at timestamptz;

alter table public.organization_integrations
  add column if not exists last_verified_at timestamptz;

alter table public.organization_integrations
  add column if not exists created_by uuid references auth.users (id) on delete set null;

alter table public.organization_integrations
  drop constraint if exists organization_integrations_connection_status_check;

alter table public.organization_integrations
  add constraint organization_integrations_connection_status_check check (
    connection_status in (
      'not_connected',
      'connecting',
      'connected',
      'verification_required',
      'degraded',
      'revoked',
      'error'
    )
  );

alter table public.organization_integrations
  drop constraint if exists organization_integrations_authentication_status_check;

alter table public.organization_integrations
  add constraint organization_integrations_authentication_status_check check (
    authentication_status in (
      'none',
      'pending',
      'authenticated',
      'expired',
      'revoked',
      'error'
    )
  );

alter table public.organization_integrations
  drop constraint if exists organization_integrations_verification_status_check;

alter table public.organization_integrations
  add constraint organization_integrations_verification_status_check check (
    verification_status in (
      'unverified',
      'verification_required',
      'verified',
      'failed',
      'stale'
    )
  );

create index if not exists organization_integrations_verification_idx
  on public.organization_integrations (organization_id, verification_status, connection_status);

-- Backfill lifecycle from legacy status where possible (honest: connected ≠ verified).
update public.organization_integrations
set
  connection_status = case
    when status = 'connected' then 'verification_required'
    when status = 'syncing' then 'connecting'
    when status = 'error' then 'error'
    else 'not_connected'
  end,
  authentication_status = case
    when status = 'connected' then 'authenticated'
    when status = 'error' then 'error'
    else 'none'
  end,
  verification_status = case
    when status = 'connected' then 'verification_required'
    else 'unverified'
  end
where connection_status = 'not_connected'
  and status is distinct from 'disconnected';

-- ---------------------------------------------------------------------------
-- 3) Evidence ledger
-- ---------------------------------------------------------------------------

create table if not exists public.organization_evidence (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  connection_id uuid references public.organization_integrations (id) on delete set null,
  provider text not null
    check (provider in ('microsoft365', 'simpro', 'user_upload', 'executiveos')),
  source_system text not null,
  source_object_type text not null,
  source_identifier text not null,
  observed_at timestamptz,
  retrieved_at timestamptz not null default now(),
  provenance text not null
    check (provenance in ('DIRECT', 'USER_PROVIDED', 'DERIVED', 'INFERRED', 'SYNTHETIC')),
  evidence_status text not null default 'active'
    check (evidence_status in ('draft', 'active', 'superseded', 'rejected')),
  confidence numeric
    check (confidence is null or (confidence >= 0 and confidence <= 1)),
  content_payload jsonb not null default '{}'::jsonb,
  schema_version text not null default '1',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Production Truth Boundary: SYNTHETIC may never be stored.
  constraint organization_evidence_no_synthetic check (provenance <> 'SYNTHETIC')
);

create index if not exists organization_evidence_org_retrieved_idx
  on public.organization_evidence (organization_id, retrieved_at desc);

create index if not exists organization_evidence_org_provider_idx
  on public.organization_evidence (organization_id, provider, evidence_status);

create unique index if not exists organization_evidence_source_uniq
  on public.organization_evidence (
    organization_id,
    provider,
    source_system,
    source_object_type,
    source_identifier
  )
  where evidence_status = 'active';

-- ---------------------------------------------------------------------------
-- 4) Claims (must reference evidence)
-- ---------------------------------------------------------------------------

create table if not exists public.organization_claims (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  claim_kind text not null,
  statement text not null,
  classification text not null
    check (classification in ('DIRECT', 'DERIVED', 'INFERRED')),
  -- Never SYNTHETIC as a persisted claim classification.
  evidence_ids uuid[] not null,
  confidence numeric
    check (confidence is null or (confidence >= 0 and confidence <= 1)),
  claim_status text not null default 'proposed'
    check (claim_status in ('proposed', 'accepted', 'rejected', 'superseded')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_claims_requires_evidence check (cardinality(evidence_ids) >= 1)
);

create index if not exists organization_claims_org_created_idx
  on public.organization_claims (organization_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 5) Knowledge Graph preparation — evidence-backed entity stubs
-- ---------------------------------------------------------------------------

create table if not exists public.organization_evidence_entities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  evidence_id uuid not null references public.organization_evidence (id) on delete cascade,
  entity_type text not null,
  entity_key text not null,
  label text not null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (organization_id, entity_type, entity_key, evidence_id)
);

create table if not exists public.organization_evidence_relationships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  evidence_id uuid not null references public.organization_evidence (id) on delete cascade,
  from_entity_id uuid not null references public.organization_evidence_entities (id) on delete cascade,
  to_entity_id uuid not null references public.organization_evidence_entities (id) on delete cascade,
  relationship_type text not null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists organization_evidence_entities_org_idx
  on public.organization_evidence_entities (organization_id, entity_type);

create index if not exists organization_evidence_relationships_org_idx
  on public.organization_evidence_relationships (organization_id, relationship_type);

-- ---------------------------------------------------------------------------
-- 6) RLS
-- ---------------------------------------------------------------------------

alter table public.organization_evidence enable row level security;
alter table public.organization_claims enable row level security;
alter table public.organization_evidence_entities enable row level security;
alter table public.organization_evidence_relationships enable row level security;

do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'is_active_organization_member'
  ) then
    create policy "evidence_member_select"
      on public.organization_evidence for select
      using (public.is_active_organization_member(organization_id));
    create policy "evidence_member_insert"
      on public.organization_evidence for insert
      with check (public.is_active_organization_member(organization_id));
    create policy "evidence_member_update"
      on public.organization_evidence for update
      using (public.is_active_organization_member(organization_id));

    create policy "claims_member_select"
      on public.organization_claims for select
      using (public.is_active_organization_member(organization_id));
    create policy "claims_member_insert"
      on public.organization_claims for insert
      with check (public.is_active_organization_member(organization_id));
    create policy "claims_member_update"
      on public.organization_claims for update
      using (public.is_active_organization_member(organization_id));

    create policy "evidence_entities_member_select"
      on public.organization_evidence_entities for select
      using (public.is_active_organization_member(organization_id));
    create policy "evidence_entities_member_insert"
      on public.organization_evidence_entities for insert
      with check (public.is_active_organization_member(organization_id));

    create policy "evidence_relationships_member_select"
      on public.organization_evidence_relationships for select
      using (public.is_active_organization_member(organization_id));
    create policy "evidence_relationships_member_insert"
      on public.organization_evidence_relationships for insert
      with check (public.is_active_organization_member(organization_id));
  end if;
end $$;
