create unique index if not exists customers_business_phone_unique on public.customers (business_id, phone);
create index if not exists follow_ups_business_due_idx on public.follow_ups (business_id, due_at);
create index if not exists orders_business_stage_idx on public.orders (business_id, stage);
create index if not exists orders_business_payment_idx on public.orders (business_id, payment_status);
