-- Billing, subscriptions, and usage tracking for ExecutiveOS

create table if not exists public.plans (
  id text primary key,
  name text not null,
  description text not null,
  monthly_price integer not null,
  annual_price integer not null,
  seat_limit integer not null,
  ai_request_limit integer not null,
  storage_limit bigint not null,
  features_json jsonb not null default '{}'::jsonb,
  display_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null references public.plans (id),
  status text not null default 'trialing'
    check (status in (
      'trialing',
      'active',
      'past_due',
      'cancelled',
      'incomplete',
      'incomplete_expired',
      'paused'
    )),
  billing_cycle text not null default 'monthly'
    check (billing_cycle in ('monthly', 'annual')),
  seat_limit integer not null,
  seat_count integer not null default 1,
  trial_ends_at timestamptz,
  renews_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  stripe_invoice_id text not null unique,
  amount integer not null,
  currency text not null default 'usd',
  status text not null,
  invoice_url text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_usage (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  ai_requests integer not null default 0,
  storage_bytes bigint not null default 0,
  meetings_count integer not null default 0,
  memory_count integer not null default 0,
  decisions_count integer not null default 0,
  initiatives_count integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_stripe_customer_id_idx
  on public.subscriptions (stripe_customer_id);

create index if not exists subscriptions_stripe_subscription_id_idx
  on public.subscriptions (stripe_subscription_id);

create index if not exists payment_history_organization_id_idx
  on public.payment_history (organization_id, created_at desc);

insert into public.plans (
  id,
  name,
  description,
  monthly_price,
  annual_price,
  seat_limit,
  ai_request_limit,
  storage_limit,
  features_json,
  display_order
) values
  (
    'starter',
    'Starter',
    'For individual executives getting started with ExecutiveOS.',
    4900,
    47000,
    3,
    100,
    5368709120,
    '{
      "ai_chief_of_staff": true,
      "meeting_intelligence": false,
      "unlimited_memory": false,
      "enterprise_health_analytics": false,
      "future_integrations": false
    }'::jsonb,
    1
  ),
  (
    'professional',
    'Professional',
    'For leadership teams running executive operations in one workspace.',
    14900,
    143000,
    10,
    1000,
    53687091200,
    '{
      "ai_chief_of_staff": true,
      "meeting_intelligence": true,
      "unlimited_memory": false,
      "enterprise_health_analytics": false,
      "future_integrations": false
    }'::jsonb,
    2
  ),
  (
    'executive',
    'Executive',
    'For executive offices needing advanced intelligence and health analytics.',
    34900,
    335000,
    25,
    5000,
    214748364800,
    '{
      "ai_chief_of_staff": true,
      "meeting_intelligence": true,
      "unlimited_memory": true,
      "enterprise_health_analytics": true,
      "future_integrations": false
    }'::jsonb,
    3
  ),
  (
    'enterprise',
    'Enterprise',
    'For global enterprises requiring scale, security, and custom integrations.',
    99900,
    959000,
    999,
    100000,
    1099511627776,
    '{
      "ai_chief_of_staff": true,
      "meeting_intelligence": true,
      "unlimited_memory": true,
      "enterprise_health_analytics": true,
      "future_integrations": true
    }'::jsonb,
    4
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  monthly_price = excluded.monthly_price,
  annual_price = excluded.annual_price,
  seat_limit = excluded.seat_limit,
  ai_request_limit = excluded.ai_request_limit,
  storage_limit = excluded.storage_limit,
  features_json = excluded.features_json,
  display_order = excluded.display_order;

alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payment_history enable row level security;
alter table public.organization_usage enable row level security;

create policy "Authenticated users can read plans"
  on public.plans for select
  using (auth.uid() is not null);

create policy "Organization members can read subscription"
  on public.subscriptions for select
  using (public.is_active_organization_member(organization_id));

create policy "Organization members can read payment history"
  on public.payment_history for select
  using (public.is_active_organization_member(organization_id));

create policy "Organization members can read usage"
  on public.organization_usage for select
  using (public.is_active_organization_member(organization_id));

create policy "Owners can manage subscription rows"
  on public.subscriptions for all
  using (public.is_organization_owner(organization_id))
  with check (public.is_organization_owner(organization_id));

create policy "Owners can manage payment history rows"
  on public.payment_history for all
  using (public.is_organization_owner(organization_id))
  with check (public.is_organization_owner(organization_id));

create policy "Owners can manage usage rows"
  on public.organization_usage for all
  using (public.is_organization_owner(organization_id))
  with check (public.is_organization_owner(organization_id));
