create extension if not exists pgcrypto;

create type order_stage as enum (
  'new_order',
  'waiting_payment',
  'paid',
  'packing',
  'dispatched',
  'delivered',
  'follow_up'
);

create type payment_status as enum ('unpaid', 'partial', 'paid', 'cod');
create type customer_status as enum ('active', 'inactive');

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  brand_color text default '#22c55e',
  currency text default 'TZS',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  phone text not null,
  area text,
  notes text,
  status customer_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  product_name text not null,
  amount numeric(12,2) not null default 0,
  delivery_area text,
  stage order_stage not null default 'new_order',
  payment_status payment_status not null default 'unpaid',
  payment_method text,
  payment_reference text,
  payment_date timestamptz,
  assigned_staff text,
  notes text,
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_notes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

create table public.order_activity (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  action text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  due_at timestamptz,
  note text,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.businesses enable row level security;
alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_notes enable row level security;
alter table public.order_activity enable row level security;
alter table public.follow_ups enable row level security;
