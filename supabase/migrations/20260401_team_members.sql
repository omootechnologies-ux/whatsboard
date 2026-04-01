create table if not exists public.business_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null default 'member',
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint business_members_role_check check (role in ('owner', 'member'))
);

create index if not exists business_members_business_id_idx on public.business_members (business_id);
create index if not exists business_members_user_id_idx on public.business_members (user_id);

insert into public.business_members (business_id, user_id, role, invited_by)
select id, owner_id, 'owner', owner_id
from public.businesses
on conflict (user_id) do nothing;

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
