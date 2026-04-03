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
  add column if not exists stage text default 'new_order',
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
    new.stage := new.status::text;
  end if;

  if new.status is null and new.stage is not null then
    begin
      new.status := new.stage::public.order_status;
    exception
      when others then
        new.status := 'new_order';
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
    new.priority := 'medium';
  end if;

  if new.completed is true then
    new.status := 'completed';
    if new.completed_at is null then
      new.completed_at := now();
    end if;
  else
    if new.status = 'completed' then
      new.completed := true;
      if new.completed_at is null then
        new.completed_at := now();
      end if;
    else
      new.completed := false;
      new.completed_at := null;
      v_due := coalesce(new.due_date, new.due_at);
      if new.status is null then
        new.status := public.whatsboard_follow_up_status_from_due_date(v_due)::text;
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
  stage = coalesce(stage, status::text, 'new_order'),
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
  priority = coalesce(priority, 'medium'),
  status = case
    when coalesce(completed, false) = true then 'completed'
    else coalesce(status, public.whatsboard_follow_up_status_from_due_date(coalesce(due_date, due_at))::text)
  end,
  completed = case
    when status = 'completed' then true
    else coalesce(completed, false)
  end,
  completed_at = case
    when status = 'completed' then coalesce(completed_at, now())
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
