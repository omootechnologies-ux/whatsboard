create extension if not exists pgcrypto;

alter table public.businesses
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
  add column if not exists billing_current_period_ends_at timestamptz;

alter table public.profiles
  add column if not exists business_name text,
  add column if not exists phone text,
  add column if not exists whatsapp_number text,
  add column if not exists instagram_handle text,
  add column if not exists tiktok_handle text,
  add column if not exists default_currency text default 'TZS',
  add column if not exists default_area text,
  add column if not exists notes text,
  add column if not exists is_admin boolean not null default false;

alter table public.orders
  add column if not exists catalog_product_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'businesses_referral_code_key'
  ) then
    alter table public.businesses
      add constraint businesses_referral_code_key unique (referral_code);
  end if;
end $$;

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

do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'orders'
      and constraint_name = 'orders_catalog_product_id_fkey'
  ) then
    alter table public.orders
      add constraint orders_catalog_product_id_fkey
      foreign key (catalog_product_id) references public.catalog_products(id) on delete set null;
  end if;
end $$;

create table if not exists public.business_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null default 'member',
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint business_members_role_check check (role in ('owner', 'member'))
);

create index if not exists billing_transactions_business_id_created_at_idx
  on public.billing_transactions (business_id, created_at desc);

create index if not exists referral_events_referrer_business_id_created_at_idx
  on public.referral_events (referrer_business_id, created_at desc);

create index if not exists referral_events_referred_business_id_created_at_idx
  on public.referral_events (referred_business_id, created_at desc);

create index if not exists catalog_products_business_id_created_at_idx
  on public.catalog_products (business_id, created_at desc);

create index if not exists business_members_business_id_idx
  on public.business_members (business_id);

create index if not exists business_members_user_id_idx
  on public.business_members (user_id);

insert into public.business_members (business_id, user_id, role, invited_by)
select id, owner_id, 'owner', owner_id
from public.businesses
on conflict (user_id) do nothing;

alter table public.billing_transactions enable row level security;
alter table public.referral_events enable row level security;
alter table public.catalog_products enable row level security;
alter table public.business_members enable row level security;

drop policy if exists "Users can view own business" on public.businesses;
create policy "Users can view own business"
on public.businesses for select
using (
  owner_id = auth.uid()
  or id in (select business_id from public.business_members where user_id = auth.uid())
);

drop policy if exists "Users can manage own business" on public.businesses;
create policy "Users can manage own business"
on public.businesses for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "Profiles scoped by owner" on public.profiles;
drop policy if exists "Users can view own or teammate profiles" on public.profiles;
drop policy if exists "Users can manage own profile" on public.profiles;

create policy "Users can view own or teammate profiles"
on public.profiles for select
using (
  id = auth.uid()
  or business_id in (select business_id from public.business_members where user_id = auth.uid())
);

create policy "Users can manage own profile"
on public.profiles for all
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Business members can view memberships" on public.business_members;
create policy "Business members can view memberships"
on public.business_members for select
using (user_id = auth.uid());

drop policy if exists "Customers scoped by business" on public.customers;
create policy "Customers scoped by business"
on public.customers for all
using (business_id in (select business_id from public.business_members where user_id = auth.uid()))
with check (business_id in (select business_id from public.business_members where user_id = auth.uid()));

drop policy if exists "Orders scoped by business" on public.orders;
create policy "Orders scoped by business"
on public.orders for all
using (business_id in (select business_id from public.business_members where user_id = auth.uid()))
with check (business_id in (select business_id from public.business_members where user_id = auth.uid()));

drop policy if exists "Order notes scoped by business" on public.order_notes;
create policy "Order notes scoped by business"
on public.order_notes for all
using (business_id in (select business_id from public.business_members where user_id = auth.uid()))
with check (business_id in (select business_id from public.business_members where user_id = auth.uid()));

drop policy if exists "Order activity scoped by business" on public.order_activity;
create policy "Order activity scoped by business"
on public.order_activity for all
using (business_id in (select business_id from public.business_members where user_id = auth.uid()))
with check (business_id in (select business_id from public.business_members where user_id = auth.uid()));

drop policy if exists "Followups scoped by business" on public.follow_ups;
create policy "Followups scoped by business"
on public.follow_ups for all
using (business_id in (select business_id from public.business_members where user_id = auth.uid()))
with check (business_id in (select business_id from public.business_members where user_id = auth.uid()));

drop policy if exists "Billing transactions scoped by business" on public.billing_transactions;
create policy "Billing transactions scoped by business"
on public.billing_transactions for all
using (business_id in (select business_id from public.business_members where user_id = auth.uid()))
with check (business_id in (select business_id from public.business_members where user_id = auth.uid()));

drop policy if exists "Referral events scoped by business" on public.referral_events;
create policy "Referral events scoped by business"
on public.referral_events for all
using (
  referrer_business_id in (select business_id from public.business_members where user_id = auth.uid())
  or referred_business_id in (select business_id from public.business_members where user_id = auth.uid())
)
with check (
  referrer_business_id in (select business_id from public.business_members where user_id = auth.uid())
  or referred_business_id in (select business_id from public.business_members where user_id = auth.uid())
);

drop policy if exists "Catalog products scoped by business" on public.catalog_products;
create policy "Catalog products scoped by business"
on public.catalog_products for all
using (business_id in (select business_id from public.business_members where user_id = auth.uid()))
with check (business_id in (select business_id from public.business_members where user_id = auth.uid()));
