-- PRE VENDA v4.5.0 — configuração Supabase para modo online sem login
-- ATENÇÃO: este modelo permite acesso anônimo via publishable key.
-- O PIN do app é proteção de interface e NÃO substitui autenticação no banco.

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.pre_vendas enable row level security;
alter table public.app_settings enable row level security;

drop policy if exists "pre_vendas_anon_select" on public.pre_vendas;
drop policy if exists "pre_vendas_anon_insert" on public.pre_vendas;
drop policy if exists "pre_vendas_anon_update" on public.pre_vendas;
drop policy if exists "pre_vendas_anon_delete" on public.pre_vendas;
drop policy if exists "app_settings_anon_select" on public.app_settings;
drop policy if exists "app_settings_anon_insert" on public.app_settings;
drop policy if exists "app_settings_anon_update" on public.app_settings;
drop policy if exists "app_settings_anon_delete" on public.app_settings;

create policy "pre_vendas_anon_select" on public.pre_vendas for select to anon using (true);
create policy "pre_vendas_anon_insert" on public.pre_vendas for insert to anon with check (true);
create policy "pre_vendas_anon_update" on public.pre_vendas for update to anon using (true) with check (true);
create policy "pre_vendas_anon_delete" on public.pre_vendas for delete to anon using (true);

create policy "app_settings_anon_select" on public.app_settings for select to anon using (true);
create policy "app_settings_anon_insert" on public.app_settings for insert to anon with check (true);
create policy "app_settings_anon_update" on public.app_settings for update to anon using (true) with check (true);
create policy "app_settings_anon_delete" on public.app_settings for delete to anon using (true);

grant select, insert, update, delete on public.pre_vendas to anon;
grant select, insert, update, delete on public.app_settings to anon;

insert into public.app_settings (key, value)
values
  ('consultants', '[{"id":"c1","name":"Cristina Simão","active":true},{"id":"c2","name":"Randerson Bastos","active":true},{"id":"c3","name":"Shelda Sofia","active":true},{"id":"c4","name":"Davi Amâncio","active":true},{"id":"c5","name":"Aline Morais","active":true},{"id":"c6","name":"Ricardo Pinto","active":true},{"id":"c7","name":"Luiza Sousa","active":true}]'::jsonb),
  ('catalog', '[{"id":"p1","name":"Galaxy Z Flip 8","capacities":["256GB","512GB"],"colors":["Rosa","Preto","Branco"]},{"id":"p2","name":"Galaxy Z Fold 8","capacities":["256GB","512GB"],"colors":["Lavanda","Preto","Branco"]},{"id":"p3","name":"Galaxy Z Fold 8 Ultra","capacities":["512GB"],"colors":["Roxo","Preto","Branco"]}]'::jsonb)
on conflict (key) do nothing;
