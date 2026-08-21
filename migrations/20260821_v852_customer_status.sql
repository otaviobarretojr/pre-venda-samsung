alter table public.pre_vendas add column if not exists status_venda text not null default 'Aguardando produto';
alter table public.pre_vendas add column if not exists status_updated_at timestamptz;
alter table public.pre_vendas add column if not exists cliente_avisado_at timestamptz;
alter table public.pre_vendas add column if not exists retirado_at timestamptz;
alter table public.pre_vendas drop constraint if exists pre_vendas_status_venda_check;
alter table public.pre_vendas add constraint pre_vendas_status_venda_check check (status_venda in ('Aguardando produto','Cliente avisado','Retirado'));
create index if not exists pre_vendas_status_venda_idx on public.pre_vendas(status_venda);
