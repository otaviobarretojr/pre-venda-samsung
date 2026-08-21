-- V7.2 additive migration: conflict prevention, recovery and sync observability
create table if not exists public.sync_tombstones (
  scope text not null,
  record_id text not null,
  deleted_at timestamptz not null default now(),
  release text,
  primary key (scope, record_id)
);
create table if not exists public.data_backups (
  id uuid primary key,
  release text not null,
  reason text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.sync_events (
  id uuid primary key,
  release text not null,
  event_type text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists sync_tombstones_deleted_at_idx on public.sync_tombstones(deleted_at desc);
create index if not exists data_backups_created_at_idx on public.data_backups(created_at desc);
create index if not exists sync_events_created_at_idx on public.sync_events(created_at desc);
alter table public.sync_tombstones enable row level security;
alter table public.data_backups enable row level security;
alter table public.sync_events enable row level security;
grant select, insert, update, delete on public.sync_tombstones to anon;
grant select, insert on public.data_backups to anon;
grant select, insert on public.sync_events to anon;
drop policy if exists sync_tombstones_anon_all on public.sync_tombstones;
create policy sync_tombstones_anon_all on public.sync_tombstones for all to anon using (true) with check (true);
drop policy if exists data_backups_anon_select on public.data_backups;
drop policy if exists data_backups_anon_insert on public.data_backups;
create policy data_backups_anon_select on public.data_backups for select to anon using (true);
create policy data_backups_anon_insert on public.data_backups for insert to anon with check (true);
drop policy if exists sync_events_anon_select on public.sync_events;
drop policy if exists sync_events_anon_insert on public.sync_events;
create policy sync_events_anon_select on public.sync_events for select to anon using (true);
create policy sync_events_anon_insert on public.sync_events for insert to anon with check (true);
