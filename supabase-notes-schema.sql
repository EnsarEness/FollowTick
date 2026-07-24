-- Create notes table for Brain Dump feature
create table if not exists notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid, -- For now we use the mock user id
  content text not null,
  is_pinned boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies (optional but good practice, keeping it open for now as per previous pattern)
alter table notes enable row level security;

create policy "Enable all access for all users" on notes
    for all using (true) with check (true);
