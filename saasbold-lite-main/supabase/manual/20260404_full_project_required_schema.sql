-- =====================================================================
-- WhatsBoard Full Required Schema (Legacy + Current Dashboard Compatibility)
-- Paste this whole file in Supabase SQL Editor and run once.
--
-- Covers:
-- - Auth-linked org model: businesses, profiles, business_members
-- - Workspace model: workspaces, workspace_members
-- - Commerce data: customers, orders, order_items, follow_ups, payments
-- - Billing/catalog/referrals: billing_transactions, catalog_products, referral_events
-- - Legacy support columns used by compatibility repository
-- - Indexes, triggers, helper functions, and RLS policies
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_stage') then
    create type public.order_stage as enum (
      'new_order',
      'waiting_payment',
      'paid',
      'packing',
      'dispatched',
      'delivered',
      'follow_up'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum ('unpaid', 'partial', 'paid', 'cod');
  end if;

  if not exists (select 1 from pg_type where typname = 'customer_status') then
    create type public.customer_status as enum ('active', 'inactive');
  end if;

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
end $$;

-- ---------------------------------------------------------------------
-- Shared trigger utility
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Core org/business tables
-- ---------------------------------------------------------------------
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  name text,
  phone text,
  brand_color text default '#22c55e',
  currency text default 'TZS',
  referral_code text,
  referral_credit_days integer not null default 0,
  referred_by_business_id uuid references public.businesses(id) on delete set null,
  billing_provider text,
  billing_plan text,
  billing_status text not null default 'inactive',
  billing_provider_reference text,
  billing_provider_session_reference text,
  billing_last_paid_at timestamptz,
  billing_current_period_starts_at timestamptz,
  billing_current_period_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.businesses
  add column if not exists owner_id uuid references auth.users(id) on delete cascade,
  add column if not exists name text,
  add column if not exists phone text,
  add column if not exists brand_color text default '#22c55e',
  add column if not exists currency text default 'TZS',
  add column if not exists referral_code text,
  add column if not exists referral_credit_days integer not null default 0,
  add column if not exists referred_by_business_id uuid references public.businesses(id) on delete set null,
  add column if not exists billing_provider text,
  add column if not exists billing_plan text,
  add column if not exists billing_status text not null default 'inactive',
  add column if not exists billing_provider_reference text,
  add column if not exists billing_provider_session_reference text,
  add column if not exists billing_last_paid_at timestamptz,
  add column if not exists billing_current_period_starts_at timestamptz,
  add column if not exists billing_current_period_ends_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'businesses_referral_code_key'
  ) then
    alter table public.businesses
      add constraint businesses_referral_code_key unique (referral_code);
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  full_name text,
  email text,
  business_name text,
  phone text,
  whatsapp_number text,
  instagram_handle text,
  tiktok_handle text,
  default_currency text default 'TZS',
  default_area text,
  notes text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists business_name text,
  add column if not exists phone text,
  add column if not exists whatsapp_number text,
  add column if not exists instagram_handle text,
  add column if not exists tiktok_handle text,
  add column if not exists default_currency text default 'TZS',
  add column if not exists default_area text,
  add column if not exists notes text,
  add column if not exists is_admin boolean not null default false,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.business_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint business_members_role_check check (role in ('owner', 'member'))
);

alter table public.business_members
  add column if not exists business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists role text not null default 'member',
  add column if not exists invited_by uuid references auth.users(id) on delete set null,
  add column if not exists created_at timestamptz not null default now();

create unique index if not exists business_members_user_id_key
  on public.business_members(user_id);
create index if not exists business_members_business_id_idx
  on public.business_members(business_id);
create index if not exists business_members_user_id_idx
  on public.business_members(user_id);

insert into public.business_members (business_id, user_id, role, invited_by)
select b.id, b.owner_id, 'owner', b.owner_id
from public.businesses b
where b.owner_id is not null
on conflict (user_id) do nothing;

-- ---------------------------------------------------------------------
-- Workspace model (current app migration target)
-- ---------------------------------------------------------------------
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.workspaces
  add column if not exists name text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

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
  add column if not exists role public.workspace_role not null default 'member',
  add column if not exists created_at timestamptz not null default now();

create index if not exists idx_workspace_members_workspace
  on public.workspace_members(workspace_id);
create index if not exists idx_workspace_members_user
  on public.workspace_members(user_id);

-- ---------------------------------------------------------------------
-- Catalog / billing / referrals
-- ---------------------------------------------------------------------
create table if not exists public.catalog_products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  description text,
  image_url text,
  price numeric(12,2) not null default 0,
  stock_count integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.catalog_products
  add column if not exists business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists name text,
  add column if not exists description text,
  add column if not exists image_url text,
  add column if not exists price numeric(12,2) not null default 0,
  add column if not exists stock_count integer not null default 0,
  add column if not exists is_active boolean not null default true,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists catalog_products_business_id_created_at_idx
  on public.catalog_products (business_id, created_at desc);

create table if not exists public.billing_transactions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  provider text not null default 'snippe',
  plan_key text not null,
  status text not null default 'pending',
  amount numeric(12,2) not null default 0,
  currency text not null default 'TZS',
  session_reference text unique,
  payment_reference text unique,
  webhook_event_id text unique,
  checkout_url text,
  customer_name text,
  customer_phone text,
  customer_email text,
  paid_at timestamptz,
  period_starts_at timestamptz,
  period_ends_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.billing_transactions
  add column if not exists business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists provider text not null default 'snippe',
  add column if not exists plan_key text,
  add column if not exists status text not null default 'pending',
  add column if not exists amount numeric(12,2) not null default 0,
  add column if not exists currency text not null default 'TZS',
  add column if not exists session_reference text,
  add column if not exists payment_reference text,
  add column if not exists webhook_event_id text,
  add column if not exists checkout_url text,
  add column if not exists customer_name text,
  add column if not exists customer_phone text,
  add column if not exists customer_email text,
  add column if not exists paid_at timestamptz,
  add column if not exists period_starts_at timestamptz,
  add column if not exists period_ends_at timestamptz,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists billing_transactions_business_id_created_at_idx
  on public.billing_transactions (business_id, created_at desc);

create table if not exists public.referral_events (
  id uuid primary key default gen_random_uuid(),
  referrer_business_id uuid not null references public.businesses(id) on delete cascade,
  referred_business_id uuid references public.businesses(id) on delete set null,
  referred_email text,
  referral_code text not null,
  reward_days integer not null default 30,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  converted_at timestamptz
);

alter table public.referral_events
  add column if not exists referrer_business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists referred_business_id uuid references public.businesses(id) on delete set null,
  add column if not exists referred_email text,
  add column if not exists referral_code text,
  add column if not exists reward_days integer not null default 30,
  add column if not exists status text not null default 'pending',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists converted_at timestamptz;

create index if not exists referral_events_referrer_business_id_created_at_idx
  on public.referral_events (referrer_business_id, created_at desc);
create index if not exists referral_events_referred_business_id_created_at_idx
  on public.referral_events (referred_business_id, created_at desc);

-- ---------------------------------------------------------------------
-- Customers / Orders / Follow-ups / Payments (superset model)
-- ---------------------------------------------------------------------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  legacy_id text,
  name text not null,
  phone text,
  email text,
  address text,
  area text,
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
  add column if not exists business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade,
  add column if not exists legacy_id text,
  add column if not exists name text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists address text,
  add column if not exists area text,
  add column if not exists location text,
  add column if not exists notes text,
  add column if not exists status text not null default 'active',
  add column if not exists total_orders integer not null default 0,
  add column if not exists total_spent numeric(14,2) not null default 0,
  add column if not exists last_order_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists customers_business_phone_unique
  on public.customers (business_id, phone);
create unique index if not exists ux_customers_workspace_legacy_id
  on public.customers (workspace_id, legacy_id)
  where legacy_id is not null;
create index if not exists idx_customers_workspace
  on public.customers (workspace_id);
create index if not exists idx_customers_workspace_status
  on public.customers (workspace_id, status);
create index if not exists idx_customers_workspace_created_at
  on public.customers (workspace_id, created_at desc);
create index if not exists idx_customers_business_created_at
  on public.customers (business_id, created_at desc);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  catalog_product_id uuid references public.catalog_products(id) on delete set null,
  order_number text,
  product_name text,
  amount numeric(12,2) not null default 0,
  subtotal numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  currency text not null default 'TZS',
  delivery_area text,
  area text,
  stage public.order_stage not null default 'new_order',
  status public.order_status not null default 'new_order',
  payment_status public.payment_status not null default 'unpaid',
  payment_method text,
  payment_reference text,
  payment_date timestamptz,
  source text not null default 'WhatsApp',
  due_follow_up_at timestamptz,
  dispatch_eta timestamptz,
  assigned_staff text,
  notes text,
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders
  add column if not exists business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade,
  add column if not exists customer_id uuid references public.customers(id) on delete set null,
  add column if not exists catalog_product_id uuid references public.catalog_products(id) on delete set null,
  add column if not exists order_number text,
  add column if not exists product_name text,
  add column if not exists amount numeric(12,2) not null default 0,
  add column if not exists subtotal numeric(14,2) not null default 0,
  add column if not exists total numeric(14,2) not null default 0,
  add column if not exists currency text not null default 'TZS',
  add column if not exists delivery_area text,
  add column if not exists area text,
  add column if not exists stage public.order_stage not null default 'new_order',
  add column if not exists status public.order_status not null default 'new_order',
  add column if not exists payment_status public.payment_status not null default 'unpaid',
  add column if not exists payment_method text,
  add column if not exists payment_reference text,
  add column if not exists payment_date timestamptz,
  add column if not exists source text not null default 'WhatsApp',
  add column if not exists due_follow_up_at timestamptz,
  add column if not exists dispatch_eta timestamptz,
  add column if not exists assigned_staff text,
  add column if not exists notes text,
  add column if not exists tags text[] default '{}',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_workspace_order_number_key'
  ) then
    alter table public.orders
      add constraint orders_workspace_order_number_key unique (workspace_id, order_number);
  end if;
end $$;

create index if not exists orders_business_stage_idx
  on public.orders (business_id, stage);
create index if not exists orders_business_payment_idx
  on public.orders (business_id, payment_status);
create index if not exists orders_business_id_catalog_product_id_idx
  on public.orders (business_id, catalog_product_id);
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
  add column if not exists quantity integer not null default 1,
  add column if not exists unit_price numeric(14,2) not null default 0,
  add column if not exists total_price numeric(14,2) not null default 0,
  add column if not exists created_at timestamptz not null default now();

create index if not exists idx_order_items_order_id
  on public.order_items(order_id);

create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  legacy_id text,
  order_id uuid references public.orders(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  due_at timestamptz,
  due_date timestamptz,
  note text,
  notes text,
  title text,
  completed boolean not null default false,
  completed_at timestamptz,
  status public.follow_up_status not null default 'upcoming',
  priority public.follow_up_priority not null default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.follow_ups
  add column if not exists business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade,
  add column if not exists legacy_id text,
  add column if not exists order_id uuid references public.orders(id) on delete set null,
  add column if not exists customer_id uuid references public.customers(id) on delete set null,
  add column if not exists due_at timestamptz,
  add column if not exists due_date timestamptz,
  add column if not exists note text,
  add column if not exists notes text,
  add column if not exists title text,
  add column if not exists completed boolean not null default false,
  add column if not exists completed_at timestamptz,
  add column if not exists status public.follow_up_status not null default 'upcoming',
  add column if not exists priority public.follow_up_priority not null default 'medium',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists follow_ups_business_due_idx
  on public.follow_ups (business_id, due_at);
create unique index if not exists ux_follow_ups_workspace_legacy_id
  on public.follow_ups (workspace_id, legacy_id)
  where legacy_id is not null;
create index if not exists idx_follow_ups_workspace
  on public.follow_ups (workspace_id);
create index if not exists idx_follow_ups_workspace_status
  on public.follow_ups (workspace_id, status);
create index if not exists idx_follow_ups_workspace_due_date
  on public.follow_ups (workspace_id, due_date);
create index if not exists idx_follow_ups_workspace_customer
  on public.follow_ups (workspace_id, customer_id);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
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
  add column if not exists business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists legacy_id text,
  add column if not exists order_id uuid references public.orders(id) on delete set null,
  add column if not exists customer_id uuid references public.customers(id) on delete set null,
  add column if not exists amount numeric(14,2) not null default 0,
  add column if not exists method text not null default 'M-Pesa',
  add column if not exists status public.payment_status not null default 'unpaid',
  add column if not exists reference text,
  add column if not exists paid_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists ux_payments_workspace_legacy_id
  on public.payments (workspace_id, legacy_id)
  where legacy_id is not null;
create index if not exists idx_payments_workspace
  on public.payments (workspace_id);
create index if not exists idx_payments_workspace_status
  on public.payments (workspace_id, status);
create index if not exists idx_payments_workspace_created_at
  on public.payments (workspace_id, created_at desc);
create index if not exists idx_payments_workspace_order
  on public.payments (workspace_id, order_id);

-- Legacy audit tables used by old app flows
create table if not exists public.order_notes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

alter table public.order_notes
  add column if not exists order_id uuid references public.orders(id) on delete cascade,
  add column if not exists business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists note text,
  add column if not exists created_at timestamptz not null default now();

create table if not exists public.order_activity (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.order_activity
  add column if not exists order_id uuid references public.orders(id) on delete cascade,
  add column if not exists business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists action text,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now();

-- ---------------------------------------------------------------------
-- Updated-at triggers
-- ---------------------------------------------------------------------
drop trigger if exists trg_businesses_set_updated_at on public.businesses;
create trigger trg_businesses_set_updated_at
before update on public.businesses
for each row execute function public.set_updated_at();

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

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

drop trigger if exists trg_catalog_products_set_updated_at on public.catalog_products;
create trigger trg_catalog_products_set_updated_at
before update on public.catalog_products
for each row execute function public.set_updated_at();

drop trigger if exists trg_billing_transactions_set_updated_at on public.billing_transactions;
create trigger trg_billing_transactions_set_updated_at
before update on public.billing_transactions
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Membership helper functions
-- ---------------------------------------------------------------------
create or replace function public.is_business_member(target_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.business_members bm
    where bm.business_id = target_business_id
      and bm.user_id = auth.uid()
  );
$$;

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
  limit 1;
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
  );
$$;

grant execute on function public.is_business_member(uuid) to authenticated;
grant execute on function public.workspace_role_for_user(uuid) to authenticated;
grant execute on function public.is_workspace_member(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------
alter table public.businesses enable row level security;
alter table public.profiles enable row level security;
alter table public.business_members enable row level security;
alter table public.catalog_products enable row level security;
alter table public.billing_transactions enable row level security;
alter table public.referral_events enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.follow_ups enable row level security;
alter table public.payments enable row level security;
alter table public.order_notes enable row level security;
alter table public.order_activity enable row level security;

-- ---------------------------------------------------------------------
-- Policies
-- ---------------------------------------------------------------------
drop policy if exists "Users can view own business" on public.businesses;
create policy "Users can view own business"
on public.businesses for select
using (
  owner_id = auth.uid()
  or public.is_business_member(id)
);

drop policy if exists "Users can manage own business" on public.businesses;
create policy "Users can manage own business"
on public.businesses for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "Users can view own or teammate profiles" on public.profiles;
create policy "Users can view own or teammate profiles"
on public.profiles for select
using (
  id = auth.uid()
  or public.is_business_member(business_id)
);

drop policy if exists "Users can manage own profile" on public.profiles;
create policy "Users can manage own profile"
on public.profiles for all
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Business members can view memberships" on public.business_members;
create policy "Business members can view memberships"
on public.business_members for select
using (user_id = auth.uid() or public.is_business_member(business_id));

drop policy if exists "Business owners can manage memberships" on public.business_members;
create policy "Business owners can manage memberships"
on public.business_members for all
using (
  exists (
    select 1
    from public.businesses b
    where b.id = business_members.business_id
      and b.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.businesses b
    where b.id = business_members.business_id
      and b.owner_id = auth.uid()
  )
);

drop policy if exists "Workspaces: members can view" on public.workspaces;
create policy "Workspaces: members can view"
on public.workspaces for select
using (public.is_workspace_member(id));

drop policy if exists "Workspaces: authenticated can create" on public.workspaces;
create policy "Workspaces: authenticated can create"
on public.workspaces for insert
with check (auth.uid() is not null);

drop policy if exists "Workspaces: owner-admin can update" on public.workspaces;
create policy "Workspaces: owner-admin can update"
on public.workspaces for update
using (public.workspace_role_for_user(id) in ('owner', 'admin'))
with check (public.workspace_role_for_user(id) in ('owner', 'admin'));

drop policy if exists "Workspaces: owner can delete" on public.workspaces;
create policy "Workspaces: owner can delete"
on public.workspaces for delete
using (public.workspace_role_for_user(id) = 'owner');

drop policy if exists "Workspace members: members can view" on public.workspace_members;
create policy "Workspace members: members can view"
on public.workspace_members for select
using (public.is_workspace_member(workspace_id));

drop policy if exists "Workspace members: owner-admin can manage" on public.workspace_members;
create policy "Workspace members: owner-admin can manage"
on public.workspace_members for all
using (public.workspace_role_for_user(workspace_id) in ('owner', 'admin'))
with check (public.workspace_role_for_user(workspace_id) in ('owner', 'admin'));

drop policy if exists "Customers scoped by org context" on public.customers;
create policy "Customers scoped by org context"
on public.customers for all
using (
  (business_id is not null and public.is_business_member(business_id))
  or (workspace_id is not null and public.is_workspace_member(workspace_id))
)
with check (
  (business_id is not null and public.is_business_member(business_id))
  or (workspace_id is not null and public.is_workspace_member(workspace_id))
);

drop policy if exists "Orders scoped by org context" on public.orders;
create policy "Orders scoped by org context"
on public.orders for all
using (
  (business_id is not null and public.is_business_member(business_id))
  or (workspace_id is not null and public.is_workspace_member(workspace_id))
)
with check (
  (business_id is not null and public.is_business_member(business_id))
  or (workspace_id is not null and public.is_workspace_member(workspace_id))
);

drop policy if exists "Followups scoped by org context" on public.follow_ups;
create policy "Followups scoped by org context"
on public.follow_ups for all
using (
  (business_id is not null and public.is_business_member(business_id))
  or (workspace_id is not null and public.is_workspace_member(workspace_id))
)
with check (
  (business_id is not null and public.is_business_member(business_id))
  or (workspace_id is not null and public.is_workspace_member(workspace_id))
);

drop policy if exists "Payments scoped by org context" on public.payments;
create policy "Payments scoped by org context"
on public.payments for all
using (
  (business_id is not null and public.is_business_member(business_id))
  or (workspace_id is not null and public.is_workspace_member(workspace_id))
)
with check (
  (business_id is not null and public.is_business_member(business_id))
  or (workspace_id is not null and public.is_workspace_member(workspace_id))
);

drop policy if exists "Order notes scoped by business" on public.order_notes;
create policy "Order notes scoped by business"
on public.order_notes for all
using (public.is_business_member(business_id))
with check (public.is_business_member(business_id));

drop policy if exists "Order activity scoped by business" on public.order_activity;
create policy "Order activity scoped by business"
on public.order_activity for all
using (public.is_business_member(business_id))
with check (public.is_business_member(business_id));

drop policy if exists "Order items: workspace members through orders" on public.order_items;
create policy "Order items: workspace members through orders"
on public.order_items for all
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and (
        (o.workspace_id is not null and public.is_workspace_member(o.workspace_id))
        or (o.business_id is not null and public.is_business_member(o.business_id))
      )
  )
)
with check (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and (
        (o.workspace_id is not null and public.is_workspace_member(o.workspace_id))
        or (o.business_id is not null and public.is_business_member(o.business_id))
      )
  )
);

drop policy if exists "Billing transactions scoped by business" on public.billing_transactions;
create policy "Billing transactions scoped by business"
on public.billing_transactions for all
using (public.is_business_member(business_id))
with check (public.is_business_member(business_id));

drop policy if exists "Referral events scoped by business" on public.referral_events;
create policy "Referral events scoped by business"
on public.referral_events for all
using (
  public.is_business_member(referrer_business_id)
  or (referred_business_id is not null and public.is_business_member(referred_business_id))
)
with check (
  public.is_business_member(referrer_business_id)
  or (referred_business_id is not null and public.is_business_member(referred_business_id))
);

drop policy if exists "Catalog products scoped by business" on public.catalog_products;
create policy "Catalog products scoped by business"
on public.catalog_products for all
using (public.is_business_member(business_id))
with check (public.is_business_member(business_id));

-- ---------------------------------------------------------------------
-- End
-- ---------------------------------------------------------------------


-- =====================================================================
-- APPENDED: 20260403_auth_business_bootstrap.sql
-- =====================================================================



-- =====================================================================
-- APPENDED: 20260403_pricing_plan_enforcement.sql
-- =====================================================================



-- =====================================================================
-- APPENDED: 20260403_mobile_money_reconciliation.sql
-- =====================================================================

-- =====================================================================
-- WhatsBoard Auth Onboarding Bootstrap
-- Supports:
-- - Automatic business/profile/member provisioning on signup
-- - Backfill for existing auth users missing business linkage
-- - Immediate visibility of business info after signup/login
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Helper to generate a readable fallback business name from email.
-- ---------------------------------------------------------------------
create or replace function public.whatsboard_business_name_from_email(email text)
returns text
language plpgsql
stable
as $$
declare
  local_part text;
  cleaned text;
begin
  local_part := split_part(coalesce(email, ''), '@', 1);
  local_part := btrim(local_part);

  if local_part = '' then
    return 'WhatsBoard Business';
  end if;

  cleaned := regexp_replace(local_part, '[._-]+', ' ', 'g');
  cleaned := btrim(cleaned);

  if cleaned = '' then
    return 'WhatsBoard Business';
  end if;

  return initcap(cleaned) || ' Business';
end;
$$;

-- ---------------------------------------------------------------------
-- Core bootstrap function: ensure businesses, business_members, and
-- profiles are linked to a concrete auth user.
-- ---------------------------------------------------------------------
create or replace function public.whatsboard_bootstrap_business_for_user(
  p_user_id uuid,
  p_email text default null,
  p_business_name text default null,
  p_full_name text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_business_id uuid;
  v_business_name text;
  v_full_name text;
  v_email text;
begin
  v_business_name := nullif(btrim(coalesce(p_business_name, '')), '');
  v_full_name := nullif(btrim(coalesce(p_full_name, '')), '');
  v_email := nullif(lower(btrim(coalesce(p_email, ''))), '');

  if v_business_name is null then
    v_business_name := v_full_name;
  end if;
  if v_business_name is null then
    v_business_name := public.whatsboard_business_name_from_email(v_email);
  end if;

  select bm.business_id
    into v_business_id
  from public.business_members bm
  where bm.user_id = p_user_id
  limit 1;

  if v_business_id is null then
    select b.id
      into v_business_id
    from public.businesses b
    where b.owner_id = p_user_id
    limit 1;
  end if;

  if v_business_id is null then
    insert into public.businesses (
      owner_id,
      name,
      currency
    )
    values (
      p_user_id,
      v_business_name,
      'TZS'
    )
    returning id into v_business_id;
  elsif v_business_name is not null then
    update public.businesses
    set
      name = v_business_name,
      updated_at = now()
    where id = v_business_id
      and owner_id = p_user_id;
  end if;

  insert into public.business_members (
    business_id,
    user_id,
    role,
    invited_by
  )
  values (
    v_business_id,
    p_user_id,
    'owner',
    p_user_id
  )
  on conflict (user_id) do update
    set
      business_id = excluded.business_id,
      role = 'owner',
      invited_by = excluded.invited_by;

  insert into public.profiles (
    id,
    business_id,
    business_name,
    full_name,
    email,
    updated_at
  )
  values (
    p_user_id,
    v_business_id,
    v_business_name,
    v_full_name,
    v_email,
    now()
  )
  on conflict (id) do update
    set
      business_id = excluded.business_id,
      business_name = coalesce(excluded.business_name, public.profiles.business_name),
      full_name = coalesce(excluded.full_name, public.profiles.full_name),
      email = coalesce(excluded.email, public.profiles.email),
      updated_at = now();

  return v_business_id;
end;
$$;

grant execute on function public.whatsboard_bootstrap_business_for_user(uuid, text, text, text)
to authenticated, service_role;

-- ---------------------------------------------------------------------
-- Trigger: auto-bootstrap every new auth user at signup.
-- ---------------------------------------------------------------------
create or replace function public.whatsboard_on_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_business_name text;
  v_full_name text;
begin
  v_business_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'business_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'businessName'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'company_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'companyName'), '')
  );

  v_full_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'fullName'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'name'), '')
  );

  perform public.whatsboard_bootstrap_business_for_user(
    new.id,
    new.email,
    v_business_name,
    v_full_name
  );

  return new;
end;
$$;

drop trigger if exists trg_whatsboard_auth_user_bootstrap on auth.users;
create trigger trg_whatsboard_auth_user_bootstrap
after insert on auth.users
for each row
execute function public.whatsboard_on_auth_user_created();

-- ---------------------------------------------------------------------
-- Backfill existing users so old accounts also get complete linkage.
-- ---------------------------------------------------------------------
do $$
declare
  rec record;
begin
  for rec in
    select
      u.id,
      u.email,
      coalesce(
        nullif(btrim(u.raw_user_meta_data ->> 'business_name'), ''),
        nullif(btrim(u.raw_user_meta_data ->> 'businessName'), ''),
        nullif(btrim(u.raw_user_meta_data ->> 'company_name'), ''),
        nullif(btrim(u.raw_user_meta_data ->> 'companyName'), '')
      ) as business_name,
      coalesce(
        nullif(btrim(u.raw_user_meta_data ->> 'full_name'), ''),
        nullif(btrim(u.raw_user_meta_data ->> 'fullName'), ''),
        nullif(btrim(u.raw_user_meta_data ->> 'name'), '')
      ) as full_name
    from auth.users u
  loop
    perform public.whatsboard_bootstrap_business_for_user(
      rec.id,
      rec.email,
      rec.business_name,
      rec.full_name
    );
  end loop;
end;
$$;
-- ==============================================================
-- WhatsBoard Pricing + Plan Enforcement Hardening
-- Supports:
-- - Billing plan consistency on businesses
-- - Fast usage queries for monthly order and team counts
-- - Database-level guardrails for free-plan order cap
-- - Database-level guardrails for plan-based team member cap
-- ==============================================================

-- ----------------------------------------------------------------
-- Normalize existing business billing values before constraints.
-- ----------------------------------------------------------------
update public.businesses
set billing_plan = 'free'
where billing_plan is null
   or billing_plan not in ('free', 'starter', 'growth', 'business');

update public.businesses
set billing_status = 'inactive'
where billing_status is null
   or billing_status not in ('inactive', 'active', 'past_due', 'cancelled', 'trialing');

-- ----------------------------------------------------------------
-- Add plan/status check constraints safely (idempotent).
-- ----------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'businesses_billing_plan_check'
      and conrelid = 'public.businesses'::regclass
  ) then
    alter table public.businesses
      add constraint businesses_billing_plan_check
      check (billing_plan in ('free', 'starter', 'growth', 'business'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'businesses_billing_status_check'
      and conrelid = 'public.businesses'::regclass
  ) then
    alter table public.businesses
      add constraint businesses_billing_status_check
      check (billing_status in ('inactive', 'active', 'past_due', 'cancelled', 'trialing'));
  end if;
end $$;

-- ----------------------------------------------------------------
-- Indexes to keep monthly-limit and team-limit checks efficient.
-- ----------------------------------------------------------------
create index if not exists idx_orders_business_created_at
  on public.orders (business_id, created_at desc);

create index if not exists idx_business_members_business_created_at
  on public.business_members (business_id, created_at desc);

-- ----------------------------------------------------------------
-- Plan limit helper functions used by triggers.
-- ----------------------------------------------------------------
create or replace function public.whatsboard_team_member_limit_for_plan(plan_key text)
returns integer
language sql
immutable
as $$
  select case lower(coalesce(plan_key, 'free'))
    when 'business' then 5
    when 'growth' then 2
    when 'starter' then 1
    else 1
  end
$$;

create or replace function public.whatsboard_monthly_order_limit_for_plan(plan_key text)
returns integer
language sql
immutable
as $$
  select case lower(coalesce(plan_key, 'free'))
    when 'free' then 30
    else null
  end
$$;

-- ----------------------------------------------------------------
-- Enforce plan-based team cap at DB level.
-- ----------------------------------------------------------------
create or replace function public.whatsboard_enforce_team_limit()
returns trigger
language plpgsql
as $$
declare
  plan_key text;
  member_limit integer;
  existing_members integer;
begin
  if new.business_id is null then
    return new;
  end if;

  select b.billing_plan
  into plan_key
  from public.businesses b
  where b.id = new.business_id;

  member_limit := public.whatsboard_team_member_limit_for_plan(plan_key);

  select count(*)
  into existing_members
  from public.business_members bm
  where bm.business_id = new.business_id;

  if existing_members >= member_limit then
    raise exception
      'Team member limit reached for plan % (limit %)',
      coalesce(plan_key, 'free'),
      member_limit
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_whatsboard_enforce_team_limit on public.business_members;
create trigger trg_whatsboard_enforce_team_limit
before insert on public.business_members
for each row
execute function public.whatsboard_enforce_team_limit();

-- ----------------------------------------------------------------
-- Enforce monthly free-plan order cap at DB level.
-- ----------------------------------------------------------------
create or replace function public.whatsboard_enforce_order_limit()
returns trigger
language plpgsql
as $$
declare
  plan_key text;
  monthly_limit integer;
  month_start timestamptz;
  month_end timestamptz;
  monthly_order_count integer;
begin
  if new.business_id is null then
    return new;
  end if;

  select b.billing_plan
  into plan_key
  from public.businesses b
  where b.id = new.business_id;

  monthly_limit := public.whatsboard_monthly_order_limit_for_plan(plan_key);
  if monthly_limit is null then
    return new;
  end if;

  month_start := date_trunc('month', coalesce(new.created_at, now()));
  month_end := month_start + interval '1 month';

  select count(*)
  into monthly_order_count
  from public.orders o
  where o.business_id = new.business_id
    and o.created_at >= month_start
    and o.created_at < month_end;

  if monthly_order_count >= monthly_limit then
    raise exception
      'Monthly order limit reached for plan % (limit %)',
      coalesce(plan_key, 'free'),
      monthly_limit
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_whatsboard_enforce_order_limit on public.orders;
create trigger trg_whatsboard_enforce_order_limit
before insert on public.orders
for each row
execute function public.whatsboard_enforce_order_limit();
-- ============================================================
-- WhatsBoard Mobile Money Reconciliation
-- Supports:
-- - parsing and storing raw M-Pesa / Tigopesa / Airtel Money SMS data
-- - confidence-based matching metadata for order reconciliation
-- - unmatched/pending inbox and manual assignment workflow
-- ============================================================

alter table public.payments
  add column if not exists sender_name text,
  add column if not exists sender_phone text,
  add column if not exists provider text default 'unknown',
  add column if not exists raw_sms text,
  add column if not exists match_confidence numeric(5,2),
  add column if not exists reconciliation_status text default 'unmatched',
  add column if not exists suggested_order_id uuid references public.orders(id) on delete set null,
  add column if not exists matched_at timestamptz,
  add column if not exists parsed_timestamp timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'payments_provider_check'
      and conrelid = 'public.payments'::regclass
  ) then
    alter table public.payments
      add constraint payments_provider_check
      check (provider in ('mpesa', 'tigo', 'airtel', 'manual', 'unknown'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'payments_reconciliation_status_check'
      and conrelid = 'public.payments'::regclass
  ) then
    alter table public.payments
      add constraint payments_reconciliation_status_check
      check (reconciliation_status in ('matched', 'pending', 'unmatched'));
  end if;
end
$$;

update public.payments
set provider = coalesce(provider, 'manual')
where provider is null;

update public.payments
set reconciliation_status = case
  when order_id is not null then 'matched'
  else coalesce(reconciliation_status, 'unmatched')
end
where reconciliation_status is null;

update public.payments
set matched_at = coalesce(matched_at, paid_at, created_at)
where reconciliation_status = 'matched'
  and matched_at is null;

create index if not exists idx_payments_business_reconciliation_status
  on public.payments(business_id, reconciliation_status, created_at desc);

create index if not exists idx_payments_business_matched_at
  on public.payments(business_id, matched_at desc);

create index if not exists idx_payments_suggested_order_id
  on public.payments(suggested_order_id);


-- =====================================================================
-- APPENDED: 20260404_customer_retention_engine.sql
-- =====================================================================



-- =====================================================================
-- APPENDED: 20260404_customers_optional_columns_compat.sql
-- =====================================================================



-- =====================================================================
-- APPENDED: 20260404_legacy_schema_hardening.sql
-- =====================================================================

-- ============================================================
-- WhatsBoard Customer Retention Engine
-- Supports:
-- - richer customer CRM fields (WhatsApp number + source channel)
-- - reliable customer_id linkage on orders
-- - filter/sort performance for customer insights
-- ============================================================

alter table public.customers
  add column if not exists whatsapp_number text,
  add column if not exists source_channel text default 'Unknown';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'customers_source_channel_check'
      and conrelid = 'public.customers'::regclass
  ) then
    alter table public.customers
      add constraint customers_source_channel_check
      check (source_channel in ('WhatsApp', 'Instagram', 'Facebook', 'TikTok', 'Unknown'));
  end if;
end
$$;

create index if not exists idx_customers_business_source_channel
  on public.customers(business_id, source_channel);

alter table public.orders
  add column if not exists customer_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_customer_id_fkey'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_customer_id_fkey
      foreign key (customer_id)
      references public.customers(id)
      on delete set null;
  end if;
end
$$;

create index if not exists idx_orders_business_customer_id
  on public.orders(business_id, customer_id);
-- Ensure optional CRM columns exist for legacy + retention features.
-- Safe for live data (idempotent).

alter table public.customers
  add column if not exists whatsapp_number text,
  add column if not exists source_channel text default 'Unknown';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'customers_source_channel_check'
      and conrelid = 'public.customers'::regclass
  ) then
    alter table public.customers
      add constraint customers_source_channel_check
      check (source_channel in ('WhatsApp', 'Instagram', 'Facebook', 'TikTok', 'Unknown'));
  end if;
end
$$;

create index if not exists idx_customers_business_source_channel
  on public.customers (business_id, source_channel);

update public.customers
set whatsapp_number = coalesce(whatsapp_number, phone)
where whatsapp_number is null
  and phone is not null;
-- =====================================================================
-- WhatsBoard Legacy Schema Hardening
-- Supports:
-- - Safe compatibility for both legacy `business_*` and newer `workspace_*`
--   columns used across current code paths and migration scripts.
-- - Backward-compatible sync between legacy and modern field names.
-- - Idempotent column/index/trigger hardening without destructive drops.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Ensure enum types exist for compatibility columns.
-- ---------------------------------------------------------------------
do $$
begin
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

-- ---------------------------------------------------------------------
-- Customers compatibility columns used by both repository shapes.
-- ---------------------------------------------------------------------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customers
  add column if not exists business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade,
  add column if not exists legacy_id text,
  add column if not exists name text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists address text,
  add column if not exists location text,
  add column if not exists area text,
  add column if not exists notes text,
  add column if not exists status text default 'active',
  add column if not exists total_orders integer default 0,
  add column if not exists total_spent numeric(14,2) default 0,
  add column if not exists last_order_at timestamptz;

create index if not exists idx_customers_business_id
  on public.customers(business_id);
create index if not exists idx_customers_workspace_id
  on public.customers(workspace_id);
create unique index if not exists ux_customers_workspace_legacy_id
  on public.customers(workspace_id, legacy_id)
  where legacy_id is not null;

-- ---------------------------------------------------------------------
-- Orders compatibility columns used by both repository shapes.
-- ---------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders
  add column if not exists business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade,
  add column if not exists customer_id uuid references public.customers(id) on delete set null,
  add column if not exists order_number text,
  add column if not exists status public.order_status default 'new_order',
  add column if not exists stage public.order_stage default 'new_order',
  add column if not exists payment_status public.payment_status default 'unpaid',
  add column if not exists subtotal numeric(14,2) default 0,
  add column if not exists total numeric(14,2) default 0,
  add column if not exists amount numeric(14,2) default 0,
  add column if not exists currency text default 'TZS',
  add column if not exists notes text,
  add column if not exists product_name text,
  add column if not exists source text default 'WhatsApp',
  add column if not exists delivery_area text,
  add column if not exists area text,
  add column if not exists due_follow_up_at timestamptz,
  add column if not exists dispatch_eta timestamptz,
  add column if not exists payment_method text,
  add column if not exists payment_reference text,
  add column if not exists payment_date timestamptz;

create index if not exists idx_orders_business_id
  on public.orders(business_id);
create index if not exists idx_orders_workspace_id
  on public.orders(workspace_id);
create index if not exists idx_orders_workspace_customer_id
  on public.orders(workspace_id, customer_id);
create index if not exists idx_orders_business_customer_id
  on public.orders(business_id, customer_id);
create unique index if not exists ux_orders_workspace_order_number
  on public.orders(workspace_id, order_number)
  where workspace_id is not null and order_number is not null;

-- Ensure existing legacy text `stage` columns are converted safely to enum.
do $$
declare
  v_udt_name text;
begin
  select c.udt_name
  into v_udt_name
  from information_schema.columns c
  where c.table_schema = 'public'
    and c.table_name = 'orders'
    and c.column_name = 'stage';

  if v_udt_name is not null and v_udt_name <> 'order_stage' then
    alter table public.orders
      alter column stage
      type public.order_stage
      using (
        case lower(coalesce(stage::text, ''))
          when 'new_order' then 'new_order'::public.order_stage
          when 'waiting_payment' then 'waiting_payment'::public.order_stage
          when 'paid' then 'paid'::public.order_stage
          when 'packing' then 'packing'::public.order_stage
          when 'dispatched' then 'dispatched'::public.order_stage
          when 'delivered' then 'delivered'::public.order_stage
          when 'follow_up' then 'follow_up'::public.order_stage
          else 'new_order'::public.order_stage
        end
      );
  end if;
end
$$;

-- ---------------------------------------------------------------------
-- Follow-up compatibility columns used by both repository shapes.
-- ---------------------------------------------------------------------
create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.follow_ups
  add column if not exists business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade,
  add column if not exists legacy_id text,
  add column if not exists customer_id uuid references public.customers(id) on delete set null,
  add column if not exists order_id uuid references public.orders(id) on delete set null,
  add column if not exists title text,
  add column if not exists note text,
  add column if not exists notes text,
  add column if not exists due_at timestamptz,
  add column if not exists due_date timestamptz,
  add column if not exists status public.follow_up_status default 'upcoming',
  add column if not exists priority public.follow_up_priority default 'medium',
  add column if not exists completed boolean default false,
  add column if not exists completed_at timestamptz;

create index if not exists idx_follow_ups_business_id
  on public.follow_ups(business_id);
create index if not exists idx_follow_ups_workspace_id
  on public.follow_ups(workspace_id);
create index if not exists idx_follow_ups_business_due_at
  on public.follow_ups(business_id, due_at);
create index if not exists idx_follow_ups_workspace_due_date
  on public.follow_ups(workspace_id, due_date);
create unique index if not exists ux_follow_ups_workspace_legacy_id
  on public.follow_ups(workspace_id, legacy_id)
  where legacy_id is not null;

-- ---------------------------------------------------------------------
-- Payments compatibility columns used by both repository shapes.
-- ---------------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payments
  add column if not exists business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade,
  add column if not exists legacy_id text,
  add column if not exists order_id uuid references public.orders(id) on delete set null,
  add column if not exists customer_id uuid references public.customers(id) on delete set null,
  add column if not exists amount numeric(14,2) default 0,
  add column if not exists method text default 'M-Pesa',
  add column if not exists status public.payment_status default 'unpaid',
  add column if not exists reference text,
  add column if not exists paid_at timestamptz;

create index if not exists idx_payments_business_id
  on public.payments(business_id);
create index if not exists idx_payments_workspace_id
  on public.payments(workspace_id);
create unique index if not exists ux_payments_workspace_legacy_id
  on public.payments(workspace_id, legacy_id)
  where legacy_id is not null;

-- ---------------------------------------------------------------------
-- Helper to compute follow-up status by due date.
-- ---------------------------------------------------------------------
create or replace function public.whatsboard_follow_up_status_from_due_date(
  p_due timestamptz
)
returns public.follow_up_status
language plpgsql
stable
as $$
declare
  v_due_date date;
begin
  if p_due is null then
    return 'upcoming';
  end if;

  v_due_date := (p_due at time zone 'UTC')::date;

  if v_due_date < current_date then
    return 'overdue';
  elsif v_due_date = current_date then
    return 'today';
  else
    return 'upcoming';
  end if;
end;
$$;

-- ---------------------------------------------------------------------
-- Sync trigger: keep legacy and modern order fields aligned.
-- ---------------------------------------------------------------------
create or replace function public.whatsboard_sync_orders_compat()
returns trigger
language plpgsql
as $$
begin
  if new.stage is null and new.status is not null then
    begin
      new.stage := new.status::text::public.order_stage;
    exception
      when others then
        new.stage := 'new_order'::public.order_stage;
    end;
  end if;

  if new.status is null and new.stage is not null then
    begin
      new.status := new.stage::text::public.order_status;
    exception
      when others then
        new.status := 'new_order'::public.order_status;
    end;
  end if;

  if new.amount is null then
    if new.total is not null then
      new.amount := new.total;
    elsif new.subtotal is not null then
      new.amount := new.subtotal;
    end if;
  end if;

  if new.total is null and new.amount is not null then
    new.total := new.amount;
  end if;
  if new.subtotal is null and new.amount is not null then
    new.subtotal := new.amount;
  end if;

  if new.delivery_area is null and new.area is not null then
    new.delivery_area := new.area;
  end if;
  if new.area is null and new.delivery_area is not null then
    new.area := new.delivery_area;
  end if;

  if coalesce(new.notes, '') = '' and coalesce(new.product_name, '') <> '' then
    new.notes := new.product_name;
  end if;
  if coalesce(new.product_name, '') = '' and coalesce(new.notes, '') <> '' then
    new.product_name := new.notes;
  end if;

  if new.currency is null then
    new.currency := 'TZS';
  end if;

  if new.source is null then
    new.source := 'WhatsApp';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_whatsboard_sync_orders_compat on public.orders;
create trigger trg_whatsboard_sync_orders_compat
before insert or update on public.orders
for each row execute function public.whatsboard_sync_orders_compat();

-- ---------------------------------------------------------------------
-- Sync trigger: keep legacy and modern follow-up fields aligned.
-- ---------------------------------------------------------------------
create or replace function public.whatsboard_sync_follow_ups_compat()
returns trigger
language plpgsql
as $$
declare
  v_due timestamptz;
begin
  if new.due_at is null and new.due_date is not null then
    new.due_at := new.due_date;
  end if;
  if new.due_date is null and new.due_at is not null then
    new.due_date := new.due_at;
  end if;

  if coalesce(new.note, '') = '' and coalesce(new.notes, '') <> '' then
    new.note := new.notes;
  end if;
  if coalesce(new.notes, '') = '' and coalesce(new.note, '') <> '' then
    new.notes := new.note;
  end if;

  if coalesce(new.title, '') = '' then
    new.title := 'Customer follow-up';
  end if;

  if new.priority is null then
    new.priority := 'medium'::public.follow_up_priority;
  end if;

  if new.completed is true then
    new.status := 'completed'::public.follow_up_status;
    if new.completed_at is null then
      new.completed_at := now();
    end if;
  else
    if new.status = 'completed'::public.follow_up_status then
      new.completed := true;
      if new.completed_at is null then
        new.completed_at := now();
      end if;
    else
      new.completed := false;
      new.completed_at := null;
      v_due := coalesce(new.due_date, new.due_at);
      if new.status is null then
        new.status := public.whatsboard_follow_up_status_from_due_date(v_due);
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_whatsboard_sync_follow_ups_compat on public.follow_ups;
create trigger trg_whatsboard_sync_follow_ups_compat
before insert or update on public.follow_ups
for each row execute function public.whatsboard_sync_follow_ups_compat();

-- ---------------------------------------------------------------------
-- Sync trigger: keep legacy and modern customer location fields aligned.
-- ---------------------------------------------------------------------
create or replace function public.whatsboard_sync_customers_compat()
returns trigger
language plpgsql
as $$
begin
  if new.location is null and new.area is not null then
    new.location := new.area;
  end if;

  if new.area is null and new.location is not null then
    new.area := new.location;
  end if;

  if coalesce(new.name, '') = '' then
    new.name := 'Unknown customer';
  end if;

  if new.phone is null then
    new.phone := 'Not provided';
  end if;

  if new.status is null then
    new.status := 'active';
  end if;

  if new.total_orders is null then
    new.total_orders := 0;
  end if;

  if new.total_spent is null then
    new.total_spent := 0;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_whatsboard_sync_customers_compat on public.customers;
create trigger trg_whatsboard_sync_customers_compat
before insert or update on public.customers
for each row execute function public.whatsboard_sync_customers_compat();

-- ---------------------------------------------------------------------
-- Backfill nulls safely for existing rows.
-- ---------------------------------------------------------------------
update public.customers
set
  name = coalesce(nullif(name, ''), 'Unknown customer'),
  phone = coalesce(phone, 'Not provided'),
  location = coalesce(location, area, 'Not specified'),
  area = coalesce(area, location, 'Not specified'),
  status = coalesce(status, 'active'),
  total_orders = coalesce(total_orders, 0),
  total_spent = coalesce(total_spent, 0)
where
  name is null
  or phone is null
  or location is null
  or area is null
  or status is null
  or total_orders is null
  or total_spent is null;

update public.orders
set
  stage = coalesce(
    stage,
    status::text::public.order_stage,
    'new_order'::public.order_stage
  ),
  amount = coalesce(amount, total, subtotal, 0),
  total = coalesce(total, amount, subtotal, 0),
  subtotal = coalesce(subtotal, amount, total, 0),
  delivery_area = coalesce(delivery_area, area, 'Not specified'),
  area = coalesce(area, delivery_area, 'Not specified'),
  notes = coalesce(notes, product_name, 'No note'),
  product_name = coalesce(product_name, notes, 'Order item'),
  currency = coalesce(currency, 'TZS'),
  source = coalesce(source, 'WhatsApp')
where
  stage is null
  or amount is null
  or total is null
  or subtotal is null
  or delivery_area is null
  or area is null
  or notes is null
  or product_name is null
  or currency is null
  or source is null;

update public.follow_ups
set
  due_at = coalesce(due_at, due_date),
  due_date = coalesce(due_date, due_at),
  note = coalesce(note, notes, ''),
  notes = coalesce(notes, note, ''),
  title = coalesce(nullif(title, ''), 'Customer follow-up'),
  priority = coalesce(priority, 'medium'::public.follow_up_priority),
  status = case
    when coalesce(completed, false) = true then 'completed'::public.follow_up_status
    else coalesce(
      status,
      public.whatsboard_follow_up_status_from_due_date(coalesce(due_date, due_at))
    )
  end,
  completed = case
    when status = 'completed'::public.follow_up_status then true
    else coalesce(completed, false)
  end,
  completed_at = case
    when status = 'completed'::public.follow_up_status then coalesce(completed_at, now())
    else completed_at
  end
where
  due_at is null
  or due_date is null
  or note is null
  or notes is null
  or title is null
  or priority is null
  or status is null
  or completed is null;

-- ---------------------------------------------------------------------
-- NOTE: No destructive drops are executed in this migration.
-- ---------------------------------------------------------------------


-- =====================================================================
-- APPENDED: 20260404_order_receipts_and_referrals.sql
-- =====================================================================

-- Ensure legacy helper exists for policies that scope by current business.
create or replace function public.current_business_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select bm.business_id
  from public.business_members bm
  where bm.user_id = auth.uid()
  limit 1
$$;

grant execute on function public.current_business_id() to authenticated;

-- ============================================================
-- WhatsBoard receipts + referral acquisition
-- Supports:
-- - Branded public receipts (/receipt/[token])
-- - Receipt view tracking
-- - Referral attribution from receipt footer clicks
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Receipts: one tokenized share page per order (reusable).
-- ------------------------------------------------------------
create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  token text not null unique,
  shop_name text,
  shop_logo_url text,
  thank_you_message text,
  footer_mode text not null default 'whatsboard_link'
    check (footer_mode in ('whatsboard_link', 'powered_by_whatsboard', 'hidden', 'white_label')),
  snapshot jsonb not null default '{}'::jsonb,
  viewed_count integer not null default 0,
  last_viewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint receipts_order_unique unique (order_id)
);

alter table public.receipts
  add column if not exists business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists order_id uuid references public.orders(id) on delete cascade,
  add column if not exists token text,
  add column if not exists shop_name text,
  add column if not exists shop_logo_url text,
  add column if not exists thank_you_message text,
  add column if not exists footer_mode text default 'whatsboard_link',
  add column if not exists snapshot jsonb default '{}'::jsonb,
  add column if not exists viewed_count integer default 0,
  add column if not exists last_viewed_at timestamptz,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'receipts_footer_mode_check'
  ) then
    alter table public.receipts
      add constraint receipts_footer_mode_check
      check (footer_mode in ('whatsboard_link', 'powered_by_whatsboard', 'hidden', 'white_label'));
  end if;
end $$;

create unique index if not exists ux_receipts_token
  on public.receipts(token);
create unique index if not exists ux_receipts_order_id
  on public.receipts(order_id);
create index if not exists idx_receipts_business_id
  on public.receipts(business_id);
create index if not exists idx_receipts_created_at
  on public.receipts(created_at desc);

-- ------------------------------------------------------------
-- Receipt views: event-level opens for monthly reporting.
-- ------------------------------------------------------------
create table if not exists public.receipt_views (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references public.receipts(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  visitor_ip_hash text,
  created_at timestamptz not null default now()
);

alter table public.receipt_views
  add column if not exists receipt_id uuid references public.receipts(id) on delete cascade,
  add column if not exists business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists visitor_ip_hash text,
  add column if not exists created_at timestamptz default now();

create index if not exists idx_receipt_views_business_id
  on public.receipt_views(business_id);
create index if not exists idx_receipt_views_receipt_id
  on public.receipt_views(receipt_id);
create index if not exists idx_receipt_views_created_at
  on public.receipt_views(created_at desc);

-- ------------------------------------------------------------
-- Referral events: track receipt-driven acquisition clicks
-- and eventual signup conversion.
-- ------------------------------------------------------------
create table if not exists public.referral_events (
  id uuid primary key default gen_random_uuid(),
  source_receipt_id uuid not null references public.receipts(id) on delete cascade,
  visitor_ip_hash text,
  converted_to_seller_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  converted_at timestamptz
);

alter table public.referral_events
  add column if not exists source_receipt_id uuid references public.receipts(id) on delete cascade,
  add column if not exists visitor_ip_hash text,
  add column if not exists converted_to_seller_id uuid references auth.users(id) on delete set null,
  add column if not exists created_at timestamptz default now(),
  add column if not exists converted_at timestamptz;

create index if not exists idx_referral_events_receipt_id
  on public.referral_events(source_receipt_id);
create index if not exists idx_referral_events_created_at
  on public.referral_events(created_at desc);
create index if not exists idx_referral_events_converted_user
  on public.referral_events(converted_to_seller_id);

-- ------------------------------------------------------------
-- Updated_at trigger coverage.
-- ------------------------------------------------------------
drop trigger if exists trg_receipts_set_updated_at on public.receipts;
create trigger trg_receipts_set_updated_at
before update on public.receipts
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Row-level security policies:
-- - authenticated business members can manage receipts/referrals for
--   their own business.
-- - receipt_views insert is open for anon/authenticated viewers so the
--   public receipt page can track views.
-- ------------------------------------------------------------
alter table public.receipts enable row level security;
alter table public.receipt_views enable row level security;
alter table public.referral_events enable row level security;

drop policy if exists "Receipts: same business" on public.receipts;
create policy "Receipts: same business"
on public.receipts
for all
using (business_id = public.current_business_id())
with check (business_id = public.current_business_id());

drop policy if exists "Receipt views: same business read" on public.receipt_views;
create policy "Receipt views: same business read"
on public.receipt_views
for select
using (business_id = public.current_business_id());

drop policy if exists "Receipt views: public insert" on public.receipt_views;
create policy "Receipt views: public insert"
on public.receipt_views
for insert
with check (true);

drop policy if exists "Referral events: same business read" on public.referral_events;
create policy "Referral events: same business read"
on public.referral_events
for select
using (
  exists (
    select 1
    from public.receipts r
    where r.id = referral_events.source_receipt_id
      and r.business_id = public.current_business_id()
  )
);

drop policy if exists "Referral events: public insert" on public.referral_events;
create policy "Referral events: public insert"
on public.referral_events
for insert
with check (true);

drop policy if exists "Referral events: service/admin update" on public.referral_events;
create policy "Referral events: service/admin update"
on public.referral_events
for update
using (
  exists (
    select 1
    from public.receipts r
    where r.id = referral_events.source_receipt_id
      and r.business_id = public.current_business_id()
  )
)
with check (
  exists (
    select 1
    from public.receipts r
    where r.id = referral_events.source_receipt_id
      and r.business_id = public.current_business_id()
  )
);


-- =====================================================================
-- FINAL COMPAT PATCHES (role/admin + referral_events legacy interop)
-- =====================================================================

-- Ensure business member roles support owner/admin/member for current team flows.
do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'business_members_role_check'
      and conrelid = 'public.business_members'::regclass
  ) then
    alter table public.business_members
      drop constraint business_members_role_check;
  end if;

  alter table public.business_members
    add constraint business_members_role_check
    check (role in ('owner', 'admin', 'member'));
exception
  when duplicate_object then
    null;
end $$;

-- If referral_events already exists from older referral-program schema,
-- relax old NOT NULL requirements so receipt-attribution inserts work.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'referral_events'
      and column_name = 'referrer_business_id'
  ) then
    execute 'alter table public.referral_events alter column referrer_business_id drop not null';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'referral_events'
      and column_name = 'referral_code'
  ) then
    execute 'alter table public.referral_events alter column referral_code drop not null';
  end if;
end $$;

-- Ensure source_receipt_id is not forced NOT NULL in mixed legacy tables,
-- while still keeping FK integrity when provided.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'referral_events'
      and column_name = 'source_receipt_id'
  ) then
    execute 'alter table public.referral_events alter column source_receipt_id drop not null';
  end if;
end $$;
