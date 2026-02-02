-- Todos table for 1-3-5 Rule
create table public.todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  title text not null,
  completed boolean default false,
  type text not null check (type in ('big', 'medium', 'small')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.todos enable row level security;

-- Permissive policies for development
create policy "Allow all to view todos"
  on public.todos for select
  using (true);

create policy "Allow all to insert todos"
  on public.todos for insert
  with check (true);

create policy "Allow all to update todos"
  on public.todos for update
  using (true);

create policy "Allow all to delete todos"
  on public.todos for delete
  using (true);
