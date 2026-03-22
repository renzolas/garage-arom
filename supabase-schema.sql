-- Run this in your Supabase SQL Editor
-- Table: vehicles
create table vehicles (
  id uuid default gen_random_uuid() primary key,
  plate text not null,
  brand text not null,
  model text not null,
  year integer,
  owner_name text not null,
  owner_phone text,
  created_at timestamp with time zone default now()
);

-- Table: service_notes (historical records per vehicle)
create table service_notes (
  id uuid default gen_random_uuid() primary key,
  vehicle_id uuid references vehicles(id) on delete cascade,
  date date not null default current_date,
  description text not null,
  cost numeric(10,2),
  mechanic text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (open for MVP - one user)
alter table vehicles enable row level security;
alter table service_notes enable row level security;

create policy "Allow all" on vehicles for all using (true) with check (true);
create policy "Allow all" on service_notes for all using (true) with check (true);
