-- ============================================================
-- WhatsBoard Mobile Money Reconciliation
-- Supports:
-- - parsing and storing raw M-Pesa / Tigopesa / Airtel Money SMS data
-- - confidence-based matching metadata for order reconciliation
-- - unmatched/pending inbox and manual assignment workflow
-- ============================================================

alter table public.payments
  add column if not exists sender_name text,
  add column if not exists sender_phone text,
  add column if not exists provider text default 'unknown',
  add column if not exists raw_sms text,
  add column if not exists match_confidence numeric(5,2),
  add column if not exists reconciliation_status text default 'unmatched',
  add column if not exists suggested_order_id uuid references public.orders(id) on delete set null,
  add column if not exists matched_at timestamptz,
  add column if not exists parsed_timestamp timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'payments_provider_check'
      and conrelid = 'public.payments'::regclass
  ) then
    alter table public.payments
      add constraint payments_provider_check
      check (provider in ('mpesa', 'tigo', 'airtel', 'manual', 'unknown'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'payments_reconciliation_status_check'
      and conrelid = 'public.payments'::regclass
  ) then
    alter table public.payments
      add constraint payments_reconciliation_status_check
      check (reconciliation_status in ('matched', 'pending', 'unmatched'));
  end if;
end
$$;

update public.payments
set provider = coalesce(provider, 'manual')
where provider is null;

update public.payments
set reconciliation_status = case
  when order_id is not null then 'matched'
  else coalesce(reconciliation_status, 'unmatched')
end
where reconciliation_status is null;

update public.payments
set matched_at = coalesce(matched_at, paid_at, created_at)
where reconciliation_status = 'matched'
  and matched_at is null;

create index if not exists idx_payments_business_reconciliation_status
  on public.payments(business_id, reconciliation_status, created_at desc);

create index if not exists idx_payments_business_matched_at
  on public.payments(business_id, matched_at desc);

create index if not exists idx_payments_suggested_order_id
  on public.payments(suggested_order_id);
