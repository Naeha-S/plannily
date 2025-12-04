-- Create the itineraries table
create table itineraries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  destination text,
  data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table itineraries enable row level security;

-- Create policies
create policy "Users can view their own itineraries"
  on itineraries for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own itineraries"
  on itineraries for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own itineraries"
  on itineraries for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own itineraries"
  on itineraries for delete
  using ( auth.uid() = user_id );

-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  country_of_origin text,
  travel_preferences jsonb, -- e.g. { "pace": "relaxed", "interests": ["food", "history"] }
  visas text[], -- Array of country codes or names
  citizenships text[], -- Array of country codes or names
  currency text default 'USD',
  language text default 'en',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table profiles enable row level security;

-- Create policies for profiles
create policy "Users can view their own profile"
  on profiles for select
  using ( auth.uid() = id );

create policy "Users can update their own profile"
  on profiles for update
  using ( auth.uid() = id );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
