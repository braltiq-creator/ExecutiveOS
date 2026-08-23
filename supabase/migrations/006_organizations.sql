-- Organization management for multi-tenant ExecutiveOS
-- Run after migrations 001–005.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  industry text,
  company_size text,
  country text,
  timezone text not null default 'UTC',
  website text,
  logo_url text,
  subscription_plan text not null default 'free'
    check (subscription_plan in ('free', 'team', 'enterprise')),
  created_by uuid not null references auth.users (id) on delete restrict,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_permissions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (
    role in ('owner', 'executive', 'manager', 'contributor', 'viewer')
  ),
  status text not null default 'active' check (
    status in ('active', 'invited', 'suspended', 'removed')
  ),
  email text,
  display_name text,
  joined_at timestamptz,
  invited_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists public.organization_departments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table if not exists public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  email text not null,
  role text not null check (
    role in ('executive', 'manager', 'contributor', 'viewer')
  ),
  invitation_code text not null unique,
  invited_by uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (
    status in ('pending', 'accepted', 'revoked', 'expired')
  ),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  accepted_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_organization_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  active_organization_id uuid not null references public.organizations (id) on delete cascade,
  updated_at timestamptz not null default now()
);

create index if not exists organizations_created_by_idx
  on public.organizations (created_by);

create index if not exists organization_members_org_id_idx
  on public.organization_members (organization_id, status);

create index if not exists organization_members_user_id_idx
  on public.organization_members (user_id, status);

create index if not exists organization_departments_org_id_idx
  on public.organization_departments (organization_id);

create index if not exists organization_invitations_org_id_idx
  on public.organization_invitations (organization_id, status);

create index if not exists organization_invitations_code_idx
  on public.organization_invitations (invitation_code)
  where status = 'pending';

create index if not exists organization_invitations_email_idx
  on public.organization_invitations (email, status);

-- Permission catalog (reference for SSO / future RBAC expansion)
insert into public.organization_permissions (name, description) values
  ('org:read', 'View organization profile and settings'),
  ('org:update', 'Update organization profile and branding'),
  ('org:archive', 'Archive the organization'),
  ('members:read', 'View organization members'),
  ('members:invite', 'Invite new members'),
  ('members:remove', 'Remove members from the organization'),
  ('members:update_role', 'Change member roles'),
  ('departments:read', 'View organization departments'),
  ('departments:manage', 'Create and edit departments'),
  ('settings:read', 'View organization settings'),
  ('settings:update', 'Edit organization settings'),
  ('intelligence:read', 'Include organization context in executive intelligence')
on conflict (name) do nothing;

-- RLS helper functions
create or replace function public.is_active_organization_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = org_id
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

create or replace function public.organization_member_role(org_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.organization_members
  where organization_id = org_id
    and user_id = auth.uid()
    and status = 'active'
  limit 1;
$$;

create or replace function public.is_organization_owner(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.organization_member_role(org_id) = 'owner';
$$;

create or replace function public.can_manage_organization_members(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.organization_member_role(org_id) in ('owner', 'executive');
$$;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.organization_departments enable row level security;
alter table public.organization_permissions enable row level security;
alter table public.organization_invitations enable row level security;
alter table public.user_organization_preferences enable row level security;

-- Organizations
create policy "Members can read their organizations"
  on public.organizations for select
  using (
    archived_at is null
    and public.is_active_organization_member(id)
  );

create policy "Authenticated users can create organizations"
  on public.organizations for insert
  with check (auth.uid() = created_by);

create policy "Owners can update organizations"
  on public.organizations for update
  using (public.is_organization_owner(id))
  with check (public.is_organization_owner(id));

-- Members
create policy "Members can read organization roster"
  on public.organization_members for select
  using (public.is_active_organization_member(organization_id));

create policy "Users can read own membership rows"
  on public.organization_members for select
  using (auth.uid() = user_id);

create policy "Owners and executives can insert members"
  on public.organization_members for insert
  with check (public.can_manage_organization_members(organization_id));

create policy "Owners and executives can update members"
  on public.organization_members for update
  using (public.can_manage_organization_members(organization_id))
  with check (public.can_manage_organization_members(organization_id));

create policy "Owners can delete members"
  on public.organization_members for delete
  using (public.is_organization_owner(organization_id));

create policy "Users can insert own membership when accepting invite"
  on public.organization_members for insert
  with check (auth.uid() = user_id);

create policy "Users can update own membership when accepting invite"
  on public.organization_members for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Departments
create policy "Members can read departments"
  on public.organization_departments for select
  using (public.is_active_organization_member(organization_id));

create policy "Owners can manage departments"
  on public.organization_departments for insert
  with check (public.is_organization_owner(organization_id));

create policy "Owners can update departments"
  on public.organization_departments for update
  using (public.is_organization_owner(organization_id))
  with check (public.is_organization_owner(organization_id));

create policy "Owners can delete departments"
  on public.organization_departments for delete
  using (public.is_organization_owner(organization_id));

-- Permissions catalog is readable by authenticated users
create policy "Authenticated users can read permission catalog"
  on public.organization_permissions for select
  using (auth.uid() is not null);

-- Invitations
create policy "Managers can read organization invitations"
  on public.organization_invitations for select
  using (public.can_manage_organization_members(organization_id));

create policy "Invitees can read invitations sent to their email"
  on public.organization_invitations for select
  using (
    status = 'pending'
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

create policy "Anyone authenticated can read invitation by code lookup"
  on public.organization_invitations for select
  using (
    status = 'pending'
    and auth.uid() is not null
  );

create policy "Managers can create invitations"
  on public.organization_invitations for insert
  with check (public.can_manage_organization_members(organization_id));

create policy "Managers can update invitations"
  on public.organization_invitations for update
  using (public.can_manage_organization_members(organization_id))
  with check (public.can_manage_organization_members(organization_id));

create policy "Invitees can accept their invitations"
  on public.organization_invitations for update
  using (
    status = 'pending'
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
  with check (
    lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

-- User preferences
create policy "Users can read own organization preferences"
  on public.user_organization_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert own organization preferences"
  on public.user_organization_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own organization preferences"
  on public.user_organization_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
