create table if not exists place_images (
  id uuid default gen_random_uuid() primary key,
  place_name text not null unique,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table place_images enable row level security;

create policy "Public read access"
  on place_images for select
  using ( true );

create policy "Authenticated insert access"
  on place_images for insert
  with check ( auth.role() = 'authenticated' or auth.role() = 'anon' );
