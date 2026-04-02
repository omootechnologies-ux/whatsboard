-- ============================================================
-- WhatsBoard Supabase Persistence Migration
-- Supports: workspaces, team access, customers, orders, items,
-- follow-ups, payments, dashboard analytics queries.
-- ============================================================

-- ------------------------------------------------------------
-- Extensions required for UUID generation.
-- ------------------------------------------------------------
create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Enums for workspace roles and operational statuses.
-- ------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'workspace_role') then
    create type public.workspace_role as enum ('owner', 'admin', 'member');
  end if;

  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum (
      'new_order',
      'waiting_payment',
      'paid',
      'packing',
      'dispatched',
      'delivered'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum ('unpaid', 'partial', 'paid', 'cod');
  end if;

  if not exists (select 1 from pg_type where typname = 'follow_up_status') then
    create type public.follow_up_status as enum (
      'overdue',
      'today',
      'upcoming',
      'completed'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'follow_up_priority') then
    create type public.follow_up_priority as enum ('high', 'medium', 'low');
  end if;
end
$$;

-- ------------------------------------------------------------
-- Updated-at trigger utility for mutable entities.
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- Workspaces + membership (organization logic).
-- ------------------------------------------------------------
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.workspaces
  add column if not exists name text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.workspace_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

alter table public.workspace_members
  add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade,
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists role public.workspace_role default 'member',
  add column if not exists created_at timestamptz default now();

-- ------------------------------------------------------------
-- Customers and customer profile/metrics.
-- ------------------------------------------------------------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  legacy_id text,
  name text not null,
  phone text,
  email text,
  address text,
  location text,
  notes text,
  status text not null default 'active',
  total_orders integer not null default 0,
  total_spent numeric(14,2) not null default 0,
  last_order_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customers
  add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade,
  add column if not exists legacy_id text,
  add column if not exists name text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists address text,
  add column if not exists location text,
  add column if not exists notes text,
  add column if not exists status text default 'active',
  add column if not exists total_orders integer default 0,
  add column if not exists total_spent numeric(14,2) default 0,
  add column if not exists last_order_at timestamptz,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

-- ------------------------------------------------------------
-- Orders and order items (catalog-connected order flow).
-- ------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  order_number text not null,
  status public.order_status not null default 'new_order',
  payment_status public.payment_status not null default 'unpaid',
  subtotal numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  currency text not null default 'TZS',
  notes text,
  source text not null default 'WhatsApp',
  delivery_area text,
  due_follow_up_at timestamptz,
  dispatch_eta timestamptz,
  payment_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, order_number)
);

alter table public.orders
  add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade,
  add column if not exists customer_id uuid references public.customers(id) on delete set null,
  add column if not exists order_number text,
  add column if not exists status public.order_status default 'new_order',
  add column if not exists payment_status public.payment_status default 'unpaid',
  add column if not exists subtotal numeric(14,2) default 0,
  add column if not exists total numeric(14,2) default 0,
  add column if not exists currency text default 'TZS',
  add column if not exists notes text,
  add column if not exists source text default 'WhatsApp',
  add column if not exists delivery_area text,
  add column if not exists due_follow_up_at timestamptz,
  add column if not exists dispatch_eta timestamptz,
  add column if not exists payment_reference text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_name text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(14,2) not null default 0,
  total_price numeric(14,2) not null default 0,
  created_at timestamptz not null default now()
);

alter table public.order_items
  add column if not exists order_id uuid references public.orders(id) on delete cascade,
  add column if not exists product_name text,
  add column if not exists quantity integer default 1,
  add column if not exists unit_price numeric(14,2) default 0,
  add column if not exists total_price numeric(14,2) default 0,
  add column if not exists created_at timestamptz default now();

-- ------------------------------------------------------------
-- Follow-ups task center.
-- ------------------------------------------------------------
create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  legacy_id text,
  customer_id uuid references public.customers(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  title text not null,
  notes text,
  due_date timestamptz not null,
  status public.follow_up_status not null default 'upcoming',
  priority public.follow_up_priority not null default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.follow_ups
  add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade,
  add column if not exists legacy_id text,
  add column if not exists customer_id uuid references public.customers(id) on delete set null,
  add column if not exists order_id uuid references public.orders(id) on delete set null,
  add column if not exists title text,
  add column if not exists notes text,
  add column if not exists due_date timestamptz,
  add column if not exists status public.follow_up_status default 'upcoming',
  add column if not exists priority public.follow_up_priority default 'medium',
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

-- ------------------------------------------------------------
-- Payments and billing/collection tracking.
-- ------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  legacy_id text,
  order_id uuid references public.orders(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  amount numeric(14,2) not null default 0,
  method text not null default 'M-Pesa',
  status public.payment_status not null default 'unpaid',
  reference text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payments
  add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade,
  add column if not exists legacy_id text,
  add column if not exists order_id uuid references public.orders(id) on delete set null,
  add column if not exists customer_id uuid references public.customers(id) on delete set null,
  add column if not exists amount numeric(14,2) default 0,
  add column if not exists method text default 'M-Pesa',
  add column if not exists status public.payment_status default 'unpaid',
  add column if not exists reference text,
  add column if not exists paid_at timestamptz,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

-- ------------------------------------------------------------
-- Indexes for workspace-scoped filters and dashboards.
-- ------------------------------------------------------------
create index if not exists idx_workspace_members_workspace
  on public.workspace_members (workspace_id);

create index if not exists idx_workspace_members_user
  on public.workspace_members (user_id);

create index if not exists idx_customers_workspace
  on public.customers (workspace_id);

create unique index if not exists ux_customers_workspace_legacy_id
  on public.customers (workspace_id, legacy_id)
  where legacy_id is not null;

create index if not exists idx_customers_workspace_status
  on public.customers (workspace_id, status);

create index if not exists idx_customers_workspace_created_at
  on public.customers (workspace_id, created_at desc);

create index if not exists idx_orders_workspace
  on public.orders (workspace_id);

create index if not exists idx_orders_workspace_status
  on public.orders (workspace_id, status);

create index if not exists idx_orders_workspace_payment_status
  on public.orders (workspace_id, payment_status);

create index if not exists idx_orders_workspace_created_at
  on public.orders (workspace_id, created_at desc);

create index if not exists idx_orders_workspace_customer
  on public.orders (workspace_id, customer_id);

create index if not exists idx_order_items_order_id
  on public.order_items (order_id);

create index if not exists idx_follow_ups_workspace
  on public.follow_ups (workspace_id);

create unique index if not exists ux_follow_ups_workspace_legacy_id
  on public.follow_ups (workspace_id, legacy_id)
  where legacy_id is not null;

create index if not exists idx_follow_ups_workspace_status
  on public.follow_ups (workspace_id, status);

create index if not exists idx_follow_ups_workspace_due_date
  on public.follow_ups (workspace_id, due_date);

create index if not exists idx_follow_ups_workspace_customer
  on public.follow_ups (workspace_id, customer_id);

create index if not exists idx_payments_workspace
  on public.payments (workspace_id);

create unique index if not exists ux_payments_workspace_legacy_id
  on public.payments (workspace_id, legacy_id)
  where legacy_id is not null;

create index if not exists idx_payments_workspace_status
  on public.payments (workspace_id, status);

create index if not exists idx_payments_workspace_created_at
  on public.payments (workspace_id, created_at desc);

create index if not exists idx_payments_workspace_order
  on public.payments (workspace_id, order_id);

-- ------------------------------------------------------------
-- Updated-at triggers.
-- ------------------------------------------------------------
drop trigger if exists trg_workspaces_set_updated_at on public.workspaces;
create trigger trg_workspaces_set_updated_at
before update on public.workspaces
for each row execute function public.set_updated_at();

drop trigger if exists trg_customers_set_updated_at on public.customers;
create trigger trg_customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_set_updated_at on public.orders;
create trigger trg_orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists trg_follow_ups_set_updated_at on public.follow_ups;
create trigger trg_follow_ups_set_updated_at
before update on public.follow_ups
for each row execute function public.set_updated_at();

drop trigger if exists trg_payments_set_updated_at on public.payments;
create trigger trg_payments_set_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Helper functions for RLS role checks.
-- ------------------------------------------------------------
create or replace function public.workspace_role_for_user(target_workspace_id uuid)
returns public.workspace_role
language sql
stable
security definer
set search_path = public
as $$
  select wm.role
  from public.workspace_members wm
  where wm.workspace_id = target_workspace_id
    and wm.user_id = auth.uid()
  limit 1
$$;

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
  )
$$;

grant execute on function public.workspace_role_for_user(uuid) to authenticated;
grant execute on function public.is_workspace_member(uuid) to authenticated;

-- ------------------------------------------------------------
-- Row Level Security (RLS) enablement.
-- ------------------------------------------------------------
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.follow_ups enable row level security;
alter table public.payments enable row level security;

-- ------------------------------------------------------------
-- Workspace policies (owner/admin/member access model).
-- ------------------------------------------------------------
drop policy if exists "Workspaces: members can view" on public.workspaces;
create policy "Workspaces: members can view"
on public.workspaces
for select
using (public.is_workspace_member(id));

drop policy if exists "Workspaces: authenticated can create" on public.workspaces;
create policy "Workspaces: authenticated can create"
on public.workspaces
for insert
with check (auth.uid() is not null);

drop policy if exists "Workspaces: owner-admin can update" on public.workspaces;
create policy "Workspaces: owner-admin can update"
on public.workspaces
for update
using (
  public.workspace_role_for_user(id) in ('owner', 'admin')
)
with check (
  public.workspace_role_for_user(id) in ('owner', 'admin')
);

drop policy if exists "Workspaces: owner can delete" on public.workspaces;
create policy "Workspaces: owner can delete"
on public.workspaces
for delete
using (public.workspace_role_for_user(id) = 'owner');

drop policy if exists "Workspace members: members can view" on public.workspace_members;
create policy "Workspace members: members can view"
on public.workspace_members
for select
using (public.is_workspace_member(workspace_id));

drop policy if exists "Workspace members: owner-admin can manage" on public.workspace_members;
create policy "Workspace members: owner-admin can manage"
on public.workspace_members
for all
using (
  public.workspace_role_for_user(workspace_id) in ('owner', 'admin')
)
with check (
  public.workspace_role_for_user(workspace_id) in ('owner', 'admin')
);

-- ------------------------------------------------------------
-- Core business tables policies (member access scoped by workspace).
-- ------------------------------------------------------------
drop policy if exists "Customers: workspace members" on public.customers;
create policy "Customers: workspace members"
on public.customers
for all
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

drop policy if exists "Orders: workspace members" on public.orders;
create policy "Orders: workspace members"
on public.orders
for all
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

drop policy if exists "Follow-ups: workspace members" on public.follow_ups;
create policy "Follow-ups: workspace members"
on public.follow_ups
for all
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

drop policy if exists "Payments: workspace members" on public.payments;
create policy "Payments: workspace members"
on public.payments
for all
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

drop policy if exists "Order items: workspace members through orders" on public.order_items;
create policy "Order items: workspace members through orders"
on public.order_items
for all
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and public.is_workspace_member(o.workspace_id)
  )
)
with check (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and public.is_workspace_member(o.workspace_id)
  )
);

-- ------------------------------------------------------------
-- NOTE: No destructive drops are executed in this migration.
-- If old table cleanup is ever required, add explicit statements
-- in a dedicated migration after data backfill verification.
-- ------------------------------------------------------------
