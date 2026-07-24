-- Create resources table for Second Brain feature
create table if not exists resources (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid, -- For now we use the mock user id
  title text not null,
  url text not null,
  description text,
  type text check (type in ('article', 'video', 'documentation', 'tool', 'repo', 'other')) default 'other',
  tags text[], 
  is_favorite boolean default false,
  status text check (status in ('to_read', 'reading', 'finished')) default 'to_read',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table resources enable row level security;

create policy "Enable all access for all users" on resources
    for all using (true) with check (true);
