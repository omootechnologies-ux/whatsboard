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

create index if not exists billing_transactions_business_id_created_at_idx
  on public.billing_transactions (business_id, created_at desc);

create index if not exists referral_events_referrer_business_id_created_at_idx
  on public.referral_events (referrer_business_id, created_at desc);

create index if not exists referral_events_referred_business_id_created_at_idx
  on public.referral_events (referred_business_id, created_at desc);

create index if not exists catalog_products_business_id_created_at_idx
  on public.catalog_products (business_id, created_at desc);

alter table public.billing_transactions enable row level security;
alter table public.referral_events enable row level security;
alter table public.catalog_products enable row level security;

drop policy if exists "Billing transactions scoped by business" on public.billing_transactions;
create policy "Billing transactions scoped by business"
on public.billing_transactions for all
using (business_id in (select id from public.businesses where owner_id = auth.uid()))
with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

drop policy if exists "Referral events scoped by business" on public.referral_events;
create policy "Referral events scoped by business"
on public.referral_events for all
using (
  referrer_business_id in (select id from public.businesses where owner_id = auth.uid())
  or referred_business_id in (select id from public.businesses where owner_id = auth.uid())
)
with check (
  referrer_business_id in (select id from public.businesses where owner_id = auth.uid())
  or referred_business_id in (select id from public.businesses where owner_id = auth.uid())
);

drop policy if exists "Catalog products scoped by business" on public.catalog_products;
create policy "Catalog products scoped by business"
on public.catalog_products for all
using (business_id in (select id from public.businesses where owner_id = auth.uid()))
with check (business_id in (select id from public.businesses where owner_id = auth.uid()));
