-- V7.3 additive migration: audit + commercial workflow, no auth dependency
create table if not exists public.audit_events (
  id uuid primary key,
  entity_type text not null,
  entity_id text,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb not null default '{}'::jsonb,
  release text not null default '7.3.0',
  created_at timestamptz not null default now()
);
create index if not exists audit_events_created_at_idx on public.audit_events(created_at desc);
create index if not exists audit_events_entity_idx on public.audit_events(entity_type, entity_id, created_at desc);

create table if not exists public.commercial_stages (
  entity_type text not null,
  entity_id text not null,
  stage text not null,
  notes text,
  updated_at timestamptz not null default now(),
  release text not null default '7.3.0',
  primary key (entity_type, entity_id)
);
create index if not exists commercial_stages_stage_idx on public.commercial_stages(stage, updated_at desc);

alter table public.audit_events enable row level security;
alter table public.commercial_stages enable row level security;
grant select, insert on public.audit_events to anon;
grant select, insert, update, delete on public.commercial_stages to anon;

drop policy if exists audit_events_anon_select on public.audit_events;
drop policy if exists audit_events_anon_insert on public.audit_events;
create policy audit_events_anon_select on public.audit_events for select to anon using (true);
create policy audit_events_anon_insert on public.audit_events for insert to anon with check (true);

drop policy if exists commercial_stages_anon_all on public.commercial_stages;
create policy commercial_stages_anon_all on public.commercial_stages for all to anon using (true) with check (true);
