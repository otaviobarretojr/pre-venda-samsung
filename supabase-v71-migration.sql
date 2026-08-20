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
 offers jsonb not null default '{}'::jsonb,
 active boolean not null default true,
 updated_at timestamptz not null default now()
);
create table if not exists public.release_versions (
 version text primary key,
 commit_sha text,
 channel text not null default 'stable',
 published_at timestamptz not null default now(),
 validation jsonb not null default '{}'::jsonb
);
-- pre_vendas permanece como fonte oficial da Pré-venda.
-- app_settings permanece disponível para compatibilidade da v7.0.2.
