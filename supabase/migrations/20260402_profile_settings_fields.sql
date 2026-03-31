alter table public.profiles
  add column if not exists business_name text,
  add column if not exists phone text,
  add column if not exists whatsapp_number text,
  add column if not exists instagram_handle text,
  add column if not exists tiktok_handle text,
  add column if not exists default_currency text default 'TZS',
  add column if not exists default_area text,
  add column if not exists notes text,
  add column if not exists is_admin boolean not null default false;
