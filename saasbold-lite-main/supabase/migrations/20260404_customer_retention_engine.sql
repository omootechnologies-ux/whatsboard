-- ============================================================
-- WhatsBoard Customer Retention Engine
-- Supports:
-- - richer customer CRM fields (WhatsApp number + source channel)
-- - reliable customer_id linkage on orders
-- - filter/sort performance for customer insights
-- ============================================================

alter table public.customers
  add column if not exists whatsapp_number text,
  add column if not exists source_channel text default 'Unknown';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'customers_source_channel_check'
      and conrelid = 'public.customers'::regclass
  ) then
    alter table public.customers
      add constraint customers_source_channel_check
      check (source_channel in ('WhatsApp', 'Instagram', 'Facebook', 'TikTok', 'Unknown'));
  end if;
end
$$;

create index if not exists idx_customers_business_source_channel
  on public.customers(business_id, source_channel);

alter table public.orders
  add column if not exists customer_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_customer_id_fkey'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_customer_id_fkey
      foreign key (customer_id)
      references public.customers(id)
      on delete set null;
  end if;
end
$$;

create index if not exists idx_orders_business_customer_id
  on public.orders(business_id, customer_id);
