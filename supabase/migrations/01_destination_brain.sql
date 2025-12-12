-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Destinations Table
create table public.destinations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  country text not null,
  region text,
  type text, -- Beach, City, Nature, Luxury, etc.
  tags text[], -- nightlife, romantic, etc.
  best_months text[], -- Jan, Feb, etc.
  description text,
  image_url text
);

-- 2. Experiences Table
create table public.experiences (
  id uuid primary key default uuid_generate_v4(),
  destination_id uuid references public.destinations(id) on delete cascade,
  name text not null,
  type text, -- Skydiving, Food Tour, etc.
  difficulty text, -- Easy, Moderate, Hard
  cost_range text, -- $, $$, $$$
  tags text[]
);

-- 3. Personas Table (Optional)
create table public.personas (
  id uuid primary key default uuid_generate_v4(),
  title text not null, -- Solo Girl, Family, etc.
  description text,
  recommended_tags text[]
);

-- RLS Policies (Read Access for All)
alter table public.destinations enable row level security;
create policy "Public read destinations" on public.destinations for select using (true);

alter table public.experiences enable row level security;
create policy "Public read experiences" on public.experiences for select using (true);
