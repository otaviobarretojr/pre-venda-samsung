create table if not exists public.manual_stock (
  product_key text primary key,
  product_name text not null,
  quantity integer not null default 0 check (quantity >= 0),
  updated_at timestamptz not null default now()
);
create index if not exists manual_stock_updated_at_idx on public.manual_stock(updated_at desc);
alter table public.manual_stock enable row level security;
drop policy if exists manual_stock_select on public.manual_stock;
drop policy if exists manual_stock_insert on public.manual_stock;
drop policy if exists manual_stock_update on public.manual_stock;
drop policy if exists manual_stock_delete on public.manual_stock;
create policy manual_stock_select on public.manual_stock for select to anon, authenticated using (true);
create policy manual_stock_insert on public.manual_stock for insert to anon, authenticated with check (true);
create policy manual_stock_update on public.manual_stock for update to anon, authenticated using (true) with check (true);
create policy manual_stock_delete on public.manual_stock for delete to anon, authenticated using (true);
