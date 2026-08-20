-- PRE VENDA Samsung V7.1
-- Migração aditiva: não remove nem renomeia estruturas existentes.
create table if not exists public.budgets (
 id uuid primary key,
 payload jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.budget_catalog (
 id text primary key,
 name text not null,
 capacities jsonb not null default '[]'::jsonb,
 colors jsonb not null default '[]'::jsonb,
 final_prices jsonb not null default '{}'::jsonb,
 price_history jsonb not null default '{}'::jsonb,
 source text,
 updated_at timestamptz not null default now()
);
create table if not exists public.ecosystem_catalog (
 id text primary key,
 name text not null,
 category text,
 capacities jsonb not null default '[]'::jsonb,
 colors jsonb not null default '[]'::jsonb,
 final_prices jsonb not null default '{}'::jsonb,
 price_history jsonb not null default '{}'::jsonb,
 offers jsonb not null default '{}'::jsonb,
 source text,
 active boolean not null default true,
 updated_at timestamptz not null default now()
);
alter table public.ecosystem_catalog add column if not exists final_prices jsonb not null default '{}'::jsonb;
alter table public.ecosystem_catalog add column if not exists price_history jsonb not null default '{}'::jsonb;
alter table public.ecosystem_catalog add column if not exists source text;
create table if not exists public.release_versions (
 version text primary key,
 commit_sha text,
 channel text not null default 'stable',
 published_at timestamptz not null default now(),
 validation jsonb not null default '{}'::jsonb
);

alter table public.budgets enable row level security;
alter table public.budget_catalog enable row level security;
alter table public.ecosystem_catalog enable row level security;
alter table public.release_versions enable row level security;

grant select,insert,update,delete on public.budgets to anon;
grant select,insert,update,delete on public.budget_catalog to anon;
grant select,insert,update,delete on public.ecosystem_catalog to anon;
grant select on public.release_versions to anon;

drop policy if exists budgets_anon_select on public.budgets;
drop policy if exists budgets_anon_insert on public.budgets;
drop policy if exists budgets_anon_update on public.budgets;
drop policy if exists budgets_anon_delete on public.budgets;
create policy budgets_anon_select on public.budgets for select to anon using (true);
create policy budgets_anon_insert on public.budgets for insert to anon with check (true);
create policy budgets_anon_update on public.budgets for update to anon using (true) with check (true);
create policy budgets_anon_delete on public.budgets for delete to anon using (true);

drop policy if exists budget_catalog_anon_select on public.budget_catalog;
drop policy if exists budget_catalog_anon_insert on public.budget_catalog;
drop policy if exists budget_catalog_anon_update on public.budget_catalog;
drop policy if exists budget_catalog_anon_delete on public.budget_catalog;
create policy budget_catalog_anon_select on public.budget_catalog for select to anon using (true);
create policy budget_catalog_anon_insert on public.budget_catalog for insert to anon with check (true);
create policy budget_catalog_anon_update on public.budget_catalog for update to anon using (true) with check (true);
create policy budget_catalog_anon_delete on public.budget_catalog for delete to anon using (true);

drop policy if exists ecosystem_catalog_anon_select on public.ecosystem_catalog;
drop policy if exists ecosystem_catalog_anon_insert on public.ecosystem_catalog;
drop policy if exists ecosystem_catalog_anon_update on public.ecosystem_catalog;
drop policy if exists ecosystem_catalog_anon_delete on public.ecosystem_catalog;
create policy ecosystem_catalog_anon_select on public.ecosystem_catalog for select to anon using (true);
create policy ecosystem_catalog_anon_insert on public.ecosystem_catalog for insert to anon with check (true);
create policy ecosystem_catalog_anon_update on public.ecosystem_catalog for update to anon using (true) with check (true);
create policy ecosystem_catalog_anon_delete on public.ecosystem_catalog for delete to anon using (true);

drop policy if exists release_versions_anon_select on public.release_versions;
create policy release_versions_anon_select on public.release_versions for select to anon using (true);

-- pre_vendas permanece como fonte oficial da Pré-venda.
-- app_settings permanece disponível para compatibilidade da v7.0.2.
