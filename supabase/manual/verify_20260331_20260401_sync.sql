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

select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
  and column_name in (
    'business_name',
    'phone',
    'whatsapp_number',
    'instagram_handle',
    'tiktok_handle',
    'default_currency',
    'default_area',
    'notes',
    'is_admin'
  )
order by column_name;

select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'orders'
  and column_name in ('catalog_product_id')
order by column_name;

select tablename
from pg_tables
where schemaname = 'public'
  and tablename in ('billing_transactions', 'referral_events', 'catalog_products', 'business_members')
order by tablename;

select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('billing_transactions', 'referral_events', 'catalog_products', 'business_members')
order by tablename;

select tablename, policyname
from pg_policies
where schemaname = 'public'
  and tablename in (
    'business_members',
    'customers',
    'orders',
    'order_notes',
    'order_activity',
    'follow_ups',
    'billing_transactions',
    'referral_events',
    'catalog_products'
  )
order by tablename, policyname;

select indexname
from pg_indexes
where schemaname = 'public'
  and tablename in ('billing_transactions', 'referral_events', 'catalog_products', 'business_members')
order by indexname;
