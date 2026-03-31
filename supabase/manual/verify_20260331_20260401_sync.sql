select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'businesses'
  and column_name in (
    'referral_code',
    'referral_credit_days',
    'referred_by_business_id',
    'billing_provider',
    'billing_plan',
    'billing_status',
    'billing_provider_reference',
    'billing_provider_session_reference',
    'billing_last_paid_at',
    'billing_current_period_starts_at',
    'billing_current_period_ends_at'
  )
order by column_name;

select tablename
from pg_tables
where schemaname = 'public'
  and tablename in ('billing_transactions', 'referral_events', 'catalog_products')
order by tablename;

select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('billing_transactions', 'referral_events', 'catalog_products')
order by tablename;

select tablename, policyname
from pg_policies
where schemaname = 'public'
  and tablename in ('billing_transactions', 'referral_events', 'catalog_products')
order by tablename, policyname;

select indexname
from pg_indexes
where schemaname = 'public'
  and tablename in ('billing_transactions', 'referral_events', 'catalog_products')
order by indexname;
