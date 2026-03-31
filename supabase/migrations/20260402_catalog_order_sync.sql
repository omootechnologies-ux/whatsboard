alter table public.orders
  add column if not exists catalog_product_id uuid references public.catalog_products(id) on delete set null;

create index if not exists orders_business_id_catalog_product_id_idx
  on public.orders (business_id, catalog_product_id);
