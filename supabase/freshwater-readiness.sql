-- Additive upgrade. Existing reports and photographs are preserved.
begin;
alter table public.water_bodies add column if not exists source_key text;
alter table public.water_bodies add column if not exists source_metadata jsonb not null default '{"source":"legacy","freshwater_status":"unknown"}'::jsonb;
alter table public.observations add column if not exists field_context jsonb;
alter table public.observations add column if not exists freshwater_attested boolean not null default false;
create unique index if not exists water_bodies_source_key_unique on public.water_bodies(source_key);
create index if not exists observations_body_observed_idx on public.observations(water_body_id,observed_at desc);
alter table public.water_bodies enable row level security;
alter table public.observations enable row level security;
alter table public.confirmations enable row level security;
revoke all on public.water_bodies,public.observations,public.confirmations from anon,authenticated;
grant select,insert,update,delete on public.water_bodies,public.observations,public.confirmations to service_role;
drop policy if exists "public can upload observation photos" on storage.objects;
drop policy if exists "public can create observations" on public.observations;
drop policy if exists "public can create confirmations" on public.confirmations;
drop policy if exists "public can read confirmations" on public.confirmations;
commit;
