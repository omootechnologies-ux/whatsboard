alter table public.businesses
  add column if not exists referral_code text unique,
  add column if not exists referral_credit_days integer not null default 0,
  add column if not exists referred_by_business_id uuid references public.businesses(id) on delete set null;

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

alter table public.referral_events enable row level security;
alter table public.catalog_products enable row level security;

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

create policy "Catalog products scoped by business"
on public.catalog_products for all
using (business_id in (select id from public.businesses where owner_id = auth.uid()))
with check (business_id in (select id from public.businesses where owner_id = auth.uid()));
