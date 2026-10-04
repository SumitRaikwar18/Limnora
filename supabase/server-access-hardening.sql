-- Run once in Supabase SQL editor after configuring SUPABASE_SECRET_KEY.
-- No rows/photos are deleted. Browser writes go through Next.js server routes.
begin;
alter table public.water_bodies enable row level security;
alter table public.observations enable row level security;
alter table public.confirmations enable row level security;
revoke all on public.water_bodies, public.observations, public.confirmations from anon, authenticated;
grant select, insert, update, delete on public.water_bodies, public.observations, public.confirmations to service_role;
drop policy if exists "public can create observations" on public.observations;
drop policy if exists "public can read confirmations" on public.confirmations;
drop policy if exists "public can create confirmations" on public.confirmations;
drop policy if exists "public can upload observation photos" on storage.objects;
create index if not exists observations_body_observed_idx on public.observations(water_body_id, observed_at desc);
create index if not exists observations_photo_hash_idx on public.observations((ai_assessment->>'photo_hash'));
commit;
-- Storage public GET remains intentional for consented, stripped photos.
-- Do not expose original observer/reviewer hashes via direct anonymous table reads.
