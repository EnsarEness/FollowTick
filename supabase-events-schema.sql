-- Events table for hackathons (standalone, no user dependency)
create table public.events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  name text not null,
  deadline timestamp with time zone not null,
  location text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (but make it permissive for now)
alter table public.events enable row level security;

-- Temporary permissive policies (allow all operations for development)
create policy "Allow all to view events"
  on public.events for select
  using (true);

create policy "Allow all to insert events"
  on public.events for insert
  with check (true);

create policy "Allow all to update events"
  on public.events for update
  using (true);

create policy "Allow all to delete events"
  on public.events for delete
  using (true);
