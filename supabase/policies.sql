create policy "Users can view own business"
on public.businesses for select
using (owner_id = auth.uid());

create policy "Users can manage own business"
on public.businesses for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Profiles scoped by owner"
on public.profiles for all
using (id = auth.uid())
with check (id = auth.uid());

create policy "Customers scoped by business"
on public.customers for all
using (business_id in (select id from public.businesses where owner_id = auth.uid()))
with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Orders scoped by business"
on public.orders for all
using (business_id in (select id from public.businesses where owner_id = auth.uid()))
with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Order notes scoped by business"
on public.order_notes for all
using (business_id in (select id from public.businesses where owner_id = auth.uid()))
with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Order activity scoped by business"
on public.order_activity for all
using (business_id in (select id from public.businesses where owner_id = auth.uid()))
with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Followups scoped by business"
on public.follow_ups for all
using (business_id in (select id from public.businesses where owner_id = auth.uid()))
with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Billing transactions scoped by business"
on public.billing_transactions for all
using (business_id in (select id from public.businesses where owner_id = auth.uid()))
with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

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
