create table public.applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  title text not null,
  type text not null, -- 'internship', 'hackathon', 'ideathon', 'career_day', 'course'
  status text not null default 'pending', -- 'pending', 'approved', 'rejected'
  announcement_date timestamp with time zone,
  event_date timestamp with time zone, -- Onaylanırsa gerçekleşeceği tarih
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.applications enable row level security;

create policy "Enable read access for all users"
on public.applications for select
using (true);

create policy "Enable insert access for all users"
on public.applications for insert
with check (true);

create policy "Enable update access for all users"
on public.applications for update
using (true);

create policy "Enable delete access for all users"
on public.applications for delete
using (true);
