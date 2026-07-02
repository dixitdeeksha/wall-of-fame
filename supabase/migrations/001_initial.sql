-- Books & Brews Wall of Fame — initial schema

create extension if not exists "pgcrypto";

create table if not exists registered_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists wall_signatures (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  signed_at timestamptz not null default now()
);

create table if not exists rate_limits (
  ip text primary key,
  last_request_at timestamptz not null default now()
);

create index if not exists idx_registered_users_name_normalized
  on registered_users (lower(trim(name)));

create index if not exists idx_wall_signatures_signed_at
  on wall_signatures (signed_at asc);

alter table registered_users enable row level security;
alter table wall_signatures enable row level security;
alter table rate_limits enable row level security;

create policy "wall_signatures_select"
  on wall_signatures for select
  using (true);

create policy "registered_users_select"
  on registered_users for select
  using (true);

create policy "registered_users_insert"
  on registered_users for insert
  with check (true);

create policy "wall_signatures_insert"
  on wall_signatures for insert
  with check (true);

create policy "rate_limits_select"
  on rate_limits for select
  using (true);

create policy "rate_limits_insert"
  on rate_limits for insert
  with check (true);

create policy "rate_limits_update"
  on rate_limits for update
  using (true)
  with check (true);

grant usage on schema public to anon, authenticated;
grant select, insert on table public.registered_users to anon, authenticated;
grant select, insert on table public.wall_signatures to anon, authenticated;
grant select, insert, update on table public.rate_limits to anon, authenticated;

alter publication supabase_realtime add table wall_signatures;
