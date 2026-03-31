alter table public.businesses
  add column if not exists billing_provider text,
  add column if not exists billing_plan text,
  add column if not exists billing_status text not null default 'inactive',
  add column if not exists billing_provider_reference text,
  add column if not exists billing_provider_session_reference text,
  add column if not exists billing_last_paid_at timestamptz,
  add column if not exists billing_current_period_starts_at timestamptz,
  add column if not exists billing_current_period_ends_at timestamptz;

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

alter table public.billing_transactions enable row level security;

create policy "Billing transactions scoped by business"
on public.billing_transactions for all
using (business_id in (select id from public.businesses where owner_id = auth.uid()))
with check (business_id in (select id from public.businesses where owner_id = auth.uid()));
