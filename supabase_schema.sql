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
