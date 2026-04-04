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
