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
