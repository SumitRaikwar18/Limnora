create extension if not exists pgcrypto;

create table if not exists public.water_bodies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'pond',
  latitude double precision not null,
  longitude double precision not null,
  place_label text,
  created_at timestamptz not null default now()
);

create table if not exists public.observations (
  id uuid primary key default gen_random_uuid(),
  water_body_id uuid references public.water_bodies(id) on delete set null,
  latitude double precision not null,
  longitude double precision not null,
  category text not null,
  description text,
  water_color text,
  smell_level text,
  coverage_level text,
  photo_url text,
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  ai_assessment jsonb,
  verification_status text not null default 'community_review',
  confirmation_count integer not null default 0,
  privacy_precision text not null default 'public_water_body'
);

create table if not exists public.confirmations (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid not null references public.observations(id) on delete cascade,
  device_id text not null,
  created_at timestamptz not null default now(),
  unique(observation_id, device_id)
);

alter table public.water_bodies enable row level security;
alter table public.observations enable row level security;
alter table public.confirmations enable row level security;

drop policy if exists "public can read water bodies" on public.water_bodies;
create policy "public can read water bodies" on public.water_bodies for select to anon using (true);
drop policy if exists "public can read observations" on public.observations;
create policy "public can read observations" on public.observations for select to anon using (true);
drop policy if exists "public can create observations" on public.observations;
create policy "public can create observations" on public.observations for insert to anon with check (true);
drop policy if exists "public can read confirmations" on public.confirmations;
create policy "public can read confirmations" on public.confirmations for select to anon using (true);
drop policy if exists "public can create confirmations" on public.confirmations;
create policy "public can create confirmations" on public.confirmations for insert to anon with check (true);

-- No demo or invented water bodies are seeded.

insert into storage.buckets (id, name, public)
values ('observation-photos', 'observation-photos', true)
on conflict (id) do nothing;

drop policy if exists "public can upload observation photos" on storage.objects;
create policy "public can upload observation photos" on storage.objects for insert to anon with check (bucket_id = 'observation-photos');
drop policy if exists "public can read observation photos" on storage.objects;
create policy "public can read observation photos" on storage.objects for select to anon using (bucket_id = 'observation-photos');
