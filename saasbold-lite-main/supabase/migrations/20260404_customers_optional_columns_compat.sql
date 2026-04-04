-- Ensure optional CRM columns exist for legacy + retention features.
-- Safe for live data (idempotent).

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
  on public.customers (business_id, source_channel);

update public.customers
set whatsapp_number = coalesce(whatsapp_number, phone)
where whatsapp_number is null
  and phone is not null;
