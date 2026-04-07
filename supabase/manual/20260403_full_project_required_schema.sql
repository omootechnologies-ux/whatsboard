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
