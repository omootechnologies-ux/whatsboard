-- =====================================================================
-- WhatsBoard Legacy Compatibility Migration
-- Supports:
-- - Legacy business-org model used by current production repository
-- - Team membership, catalog, and billing transaction tables
-- - Legacy-compatible columns on customers/orders/follow_ups
-- - Safe idempotent creation without destructive drops
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Shared updated_at trigger helper
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
-- Core business/org tables (legacy compatibility)
-- ---------------------------------------------------------------------
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  name text,
  phone text,
  brand_color text default '#0F5D46',
  currency text default 'TZS',
  billing_plan text default 'free',
  billing_status text default 'inactive',
  billing_provider text,
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
  add column if not exists brand_color text default '#0F5D46',
  add column if not exists currency text default 'TZS',
  add column if not exists billing_plan text default 'free',
  add column if not exists billing_status text default 'inactive',
  add column if not exists billing_provider text,
  add column if not exists billing_provider_reference text,
  add column if not exists billing_provider_session_reference text,
  add column if not exists billing_last_paid_at timestamptz,
  add column if not exists billing_current_period_starts_at timestamptz,
  add column if not exists billing_current_period_ends_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_businesses_owner_id on public.businesses(owner_id);

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

create index if not exists idx_profiles_business_id on public.profiles(business_id);

create table if not exists public.business_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint business_members_role_check check (role in ('owner', 'member', 'admin'))
);

alter table public.business_members
  add column if not exists business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists role text not null default 'member',
  add column if not exists invited_by uuid references auth.users(id) on delete set null,
  add column if not exists created_at timestamptz not null default now();

create unique index if not exists ux_business_members_user_id
  on public.business_members(user_id);
create unique index if not exists ux_business_members_business_user
  on public.business_members(business_id, user_id);
create index if not exists idx_business_members_business_id
  on public.business_members(business_id);

insert into public.business_members (business_id, user_id, role, invited_by)
select b.id, b.owner_id, 'owner', b.owner_id
from public.businesses b
where b.owner_id is not null
on conflict (user_id) do nothing;

-- ---------------------------------------------------------------------
-- Legacy-compatible columns on core commerce tables
-- ---------------------------------------------------------------------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customers
  add column if not exists business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists area text,
  add column if not exists notes text,
  add column if not exists status text default 'active';

create index if not exists idx_customers_business_id on public.customers(business_id);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders
  add column if not exists business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists product_name text,
  add column if not exists amount numeric(14,2) default 0,
  add column if not exists delivery_area text,
  add column if not exists area text,
  add column if not exists stage text default 'new_order',
  add column if not exists payment_status text default 'unpaid',
  add column if not exists payment_method text,
  add column if not exists payment_reference text,
  add column if not exists payment_date timestamptz;

create index if not exists idx_orders_business_id on public.orders(business_id);
create index if not exists idx_orders_business_stage on public.orders(business_id, stage);
create index if not exists idx_orders_business_payment_status
  on public.orders(business_id, payment_status);

create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.follow_ups
  add column if not exists business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists title text,
  add column if not exists priority text default 'medium',
  add column if not exists due_at timestamptz,
  add column if not exists note text,
  add column if not exists completed boolean default false,
  add column if not exists completed_at timestamptz;

create index if not exists idx_follow_ups_business_id on public.follow_ups(business_id);
create index if not exists idx_follow_ups_business_due_at on public.follow_ups(business_id, due_at);

-- ---------------------------------------------------------------------
-- Catalog + billing tables used by product/team/pricing extensions
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

create index if not exists idx_catalog_products_business_id
  on public.catalog_products(business_id);

create table if not exists public.billing_transactions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  amount numeric(12,2) not null default 0,
  currency text not null default 'TZS',
  status text not null default 'pending',
  provider text,
  provider_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.billing_transactions
  add column if not exists business_id uuid references public.businesses(id) on delete cascade,
  add column if not exists amount numeric(12,2) not null default 0,
  add column if not exists currency text not null default 'TZS',
  add column if not exists status text not null default 'pending',
  add column if not exists provider text,
  add column if not exists provider_reference text,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_billing_transactions_business_id
  on public.billing_transactions(business_id);
create index if not exists idx_billing_transactions_created_at
  on public.billing_transactions(created_at desc);

-- ---------------------------------------------------------------------
-- Updated_at triggers
-- ---------------------------------------------------------------------
drop trigger if exists trg_businesses_set_updated_at on public.businesses;
create trigger trg_businesses_set_updated_at
before update on public.businesses
for each row execute function public.set_updated_at();

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
before update on public.profiles
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
-- RLS helper and policies for legacy business-scoped access
-- ---------------------------------------------------------------------
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

alter table public.businesses enable row level security;
alter table public.profiles enable row level security;
alter table public.business_members enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.follow_ups enable row level security;
alter table public.catalog_products enable row level security;
alter table public.billing_transactions enable row level security;

drop policy if exists "Businesses: member read" on public.businesses;
create policy "Businesses: member read"
on public.businesses
for select
using (id = public.current_business_id());

drop policy if exists "Businesses: owner update" on public.businesses;
create policy "Businesses: owner update"
on public.businesses
for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "Profiles: self read" on public.profiles;
create policy "Profiles: self read"
on public.profiles
for select
using (id = auth.uid() or business_id = public.current_business_id());

drop policy if exists "Profiles: self write" on public.profiles;
create policy "Profiles: self write"
on public.profiles
for all
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Business members: same business read" on public.business_members;
create policy "Business members: same business read"
on public.business_members
for select
using (business_id = public.current_business_id());

drop policy if exists "Customers: same business" on public.customers;
create policy "Customers: same business"
on public.customers
for all
using (business_id = public.current_business_id())
with check (business_id = public.current_business_id());

drop policy if exists "Orders: same business" on public.orders;
create policy "Orders: same business"
on public.orders
for all
using (business_id = public.current_business_id())
with check (business_id = public.current_business_id());

drop policy if exists "Follow-ups: same business" on public.follow_ups;
create policy "Follow-ups: same business"
on public.follow_ups
for all
using (business_id = public.current_business_id())
with check (business_id = public.current_business_id());

drop policy if exists "Catalog products: same business" on public.catalog_products;
create policy "Catalog products: same business"
on public.catalog_products
for all
using (business_id = public.current_business_id())
with check (business_id = public.current_business_id());

drop policy if exists "Billing transactions: same business" on public.billing_transactions;
create policy "Billing transactions: same business"
on public.billing_transactions
for all
using (business_id = public.current_business_id())
with check (business_id = public.current_business_id());

-- ---------------------------------------------------------------------
-- No destructive drops are executed in this migration.
-- ---------------------------------------------------------------------
