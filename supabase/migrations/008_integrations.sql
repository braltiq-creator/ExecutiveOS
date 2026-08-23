-- Integration platform for ExecutiveOS
-- Run after migrations 001–007.

create table if not exists public.integration_providers (
  id text primary key,
  name text not null,
  description text not null,
  category text not null check (
    category in (
      'productivity',
      'calendar',
      'email',
      'communication',
      'crm',
      'project',
      'documentation',
      'development',
      'storage'
    )
  ),
  vendor text not null check (
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
      'executiveos'
    )
  ),
  auth_type text not null default 'oauth2'
    check (auth_type in ('oauth2', 'api_key', 'webhook', 'none')),
  context_domains text[] not null default '{}'::text[],
  capabilities_json jsonb not null default '{}'::jsonb,
  display_order smallint not null default 0,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  provider_id text not null references public.integration_providers (id),
  status text not null default 'disconnected'
    check (status in ('connected', 'disconnected', 'error', 'syncing')),
  connected_by uuid references auth.users (id) on delete set null,
  config_json jsonb not null default '{}'::jsonb,
  sync_cursor jsonb not null default '{}'::jsonb,
  health_status text not null default 'disconnected'
    check (health_status in ('connected', 'disconnected', 'error', 'syncing')),
  health_message text,
  last_sync_at timestamptz,
  next_sync_at timestamptz,
  last_error_at timestamptz,
  last_error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, provider_id)
);

create table if not exists public.integration_sync_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_integration_id uuid not null
    references public.organization_integrations (id) on delete cascade,
  trigger_type text not null
    check (trigger_type in ('manual', 'scheduled', 'webhook', 'incremental')),
  status text not null default 'pending'
    check (status in ('pending', 'running', 'completed', 'failed', 'retrying')),
  started_at timestamptz,
  completed_at timestamptz,
  records_processed integer not null default 0,
  error_message text,
  retry_count integer not null default 0,
  max_retries integer not null default 3,
  cursor_before jsonb not null default '{}'::jsonb,
  cursor_after jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.integration_events (
  id uuid primary key default gen_random_uuid(),
  organization_integration_id uuid not null
    references public.organization_integrations (id) on delete cascade,
  event_type text not null check (
    event_type in (
      'connected',
      'disconnected',
      'sync_started',
      'sync_completed',
      'sync_failed',
      'token_refreshed',
      'webhook_received',
      'error'
    )
  ),
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.oauth_tokens (
  id uuid primary key default gen_random_uuid(),
  organization_integration_id uuid not null
    references public.organization_integrations (id) on delete cascade unique,
  access_token_encrypted text not null,
  refresh_token_encrypted text,
  token_type text not null default 'Bearer',
  expires_at timestamptz,
  scopes text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.integration_oauth_states (
  id uuid primary key default gen_random_uuid(),
  state_token text not null unique,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  provider_id text not null references public.integration_providers (id),
  user_id uuid not null references auth.users (id) on delete cascade,
  redirect_path text not null default '/settings/integrations',
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists organization_integrations_org_idx
  on public.organization_integrations (organization_id, status);

create index if not exists integration_sync_jobs_integration_idx
  on public.integration_sync_jobs (organization_integration_id, created_at desc);

create index if not exists integration_events_integration_idx
  on public.integration_events (organization_integration_id, created_at desc);

create index if not exists integration_oauth_states_expires_idx
  on public.integration_oauth_states (expires_at);

insert into public.integration_providers (
  id,
  name,
  description,
  category,
  vendor,
  auth_type,
  context_domains,
  capabilities_json,
  display_order
)
values
  (
    'microsoft_365',
    'Microsoft 365',
    'Connect Outlook, Teams, SharePoint, and Microsoft productivity services.',
    'productivity',
    'microsoft',
    'oauth2',
    array['email', 'calendar', 'meetings', 'documents'],
    '{"sync": true, "webhooks": true}'::jsonb,
    1
  ),
  (
    'google_workspace',
    'Google Workspace',
    'Connect Gmail, Drive, and Google productivity services.',
    'productivity',
    'google',
    'oauth2',
    array['email', 'calendar', 'documents'],
    '{"sync": true, "webhooks": true}'::jsonb,
    2
  ),
  (
    'google_calendar',
    'Google Calendar',
    'Sync executive calendar events for briefings and scheduling intelligence.',
    'calendar',
    'google',
    'oauth2',
    array['calendar'],
    '{"sync": true, "incremental": true}'::jsonb,
    3
  ),
  (
    'outlook_calendar',
    'Outlook Calendar',
    'Sync Microsoft Outlook calendar events into ExecutiveOS.',
    'calendar',
    'microsoft',
    'oauth2',
    array['calendar'],
    '{"sync": true, "incremental": true}'::jsonb,
    4
  ),
  (
    'microsoft_teams',
    'Microsoft Teams',
    'Import Teams meetings and collaboration signals.',
    'communication',
    'microsoft',
    'oauth2',
    array['meetings', 'communication'],
    '{"sync": true, "webhooks": true}'::jsonb,
    5
  ),
  (
    'slack',
    'Slack',
    'Connect Slack channels for executive communication context.',
    'communication',
    'slack',
    'oauth2',
    array['communication'],
    '{"sync": true, "webhooks": true}'::jsonb,
    6
  ),
  (
    'salesforce',
    'Salesforce',
    'Sync CRM records, accounts, and pipeline intelligence.',
    'crm',
    'salesforce',
    'oauth2',
    array['crm'],
    '{"sync": true, "incremental": true}'::jsonb,
    7
  ),
  (
    'hubspot',
    'HubSpot',
    'Connect HubSpot CRM and marketing intelligence.',
    'crm',
    'hubspot',
    'oauth2',
    array['crm'],
    '{"sync": true, "incremental": true}'::jsonb,
    8
  ),
  (
    'jira',
    'Jira',
    'Sync project issues and delivery signals.',
    'project',
    'atlassian',
    'oauth2',
    array['tasks'],
    '{"sync": true, "incremental": true}'::jsonb,
    9
  ),
  (
    'confluence',
    'Confluence',
    'Import knowledge base pages and documentation.',
    'documentation',
    'atlassian',
    'oauth2',
    array['documents', 'knowledgeGraph'],
    '{"sync": true}'::jsonb,
    10
  ),
  (
    'sharepoint',
    'SharePoint',
    'Connect SharePoint document libraries.',
    'storage',
    'microsoft',
    'oauth2',
    array['documents'],
    '{"sync": true}'::jsonb,
    11
  ),
  (
    'notion',
    'Notion',
    'Sync Notion pages and workspace knowledge.',
    'documentation',
    'notion',
    'oauth2',
    array['documents', 'knowledgeGraph'],
    '{"sync": true}'::jsonb,
    12
  ),
  (
    'github',
    'GitHub',
    'Connect repositories, issues, and engineering delivery signals.',
    'development',
    'github',
    'oauth2',
    array['tasks'],
    '{"sync": true, "webhooks": true}'::jsonb,
    13
  ),
  (
    'asana',
    'Asana',
    'Sync Asana projects and executive task context.',
    'project',
    'asana',
    'oauth2',
    array['tasks'],
    '{"sync": true}'::jsonb,
    14
  ),
  (
    'monday',
    'Monday.com',
    'Connect Monday.com boards and work management data.',
    'project',
    'monday',
    'oauth2',
    array['tasks'],
    '{"sync": true}'::jsonb,
    15
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

alter table public.integration_providers enable row level security;
alter table public.organization_integrations enable row level security;
alter table public.integration_sync_jobs enable row level security;
alter table public.integration_events enable row level security;
alter table public.oauth_tokens enable row level security;
alter table public.integration_oauth_states enable row level security;

create policy "Authenticated users can read integration providers"
  on public.integration_providers for select
  using (auth.uid() is not null);

create policy "Org members can read organization integrations"
  on public.organization_integrations for select
  using (public.is_active_organization_member(organization_id));

create policy "Org admins can manage organization integrations"
  on public.organization_integrations for all
  using (public.is_organization_owner(organization_id))
  with check (public.is_organization_owner(organization_id));

create policy "Org members can read integration sync jobs"
  on public.integration_sync_jobs for select
  using (
    exists (
      select 1
      from public.organization_integrations oi
      where oi.id = organization_integration_id
        and public.is_active_organization_member(oi.organization_id)
    )
  );

create policy "Org admins can manage integration sync jobs"
  on public.integration_sync_jobs for all
  using (
    exists (
      select 1
      from public.organization_integrations oi
      where oi.id = organization_integration_id
        and public.is_organization_owner(oi.organization_id)
    )
  )
  with check (
    exists (
      select 1
      from public.organization_integrations oi
      where oi.id = organization_integration_id
        and public.is_organization_owner(oi.organization_id)
    )
  );

create policy "Org members can read integration events"
  on public.integration_events for select
  using (
    exists (
      select 1
      from public.organization_integrations oi
      where oi.id = organization_integration_id
        and public.is_active_organization_member(oi.organization_id)
    )
  );

create policy "Org admins can insert integration events"
  on public.integration_events for insert
  with check (
    exists (
      select 1
      from public.organization_integrations oi
      where oi.id = organization_integration_id
        and public.is_organization_owner(oi.organization_id)
    )
  );

create policy "Org admins can manage oauth tokens"
  on public.oauth_tokens for all
  using (
    exists (
      select 1
      from public.organization_integrations oi
      where oi.id = organization_integration_id
        and public.is_organization_owner(oi.organization_id)
    )
  )
  with check (
    exists (
      select 1
      from public.organization_integrations oi
      where oi.id = organization_integration_id
        and public.is_organization_owner(oi.organization_id)
    )
  );

create policy "Users can manage own oauth states"
  on public.integration_oauth_states for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
