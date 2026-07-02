-- ============================================================
-- Books & Brews Wall of Fame — FULL SUPABASE SETUP
-- Copy this ENTIRE file into Supabase → SQL Editor → Run
-- Project: https://supabase.com/dashboard/project/zxqkloreluzimwaiyuqp
-- ============================================================

-- 1) Tables
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

-- Case-insensitive unique names (Khushi = khushi = KHUSHI)
alter table wall_signatures drop constraint if exists wall_signatures_name_key;

delete from registered_users a
using registered_users b
where a.id > b.id
  and lower(trim(a.name)) = lower(trim(b.name));

delete from wall_signatures a
using wall_signatures b
where a.id > b.id
  and lower(trim(a.name)) = lower(trim(b.name));

create unique index if not exists idx_registered_users_name_ci
  on registered_users (lower(trim(name)));

create unique index if not exists idx_wall_signatures_name_ci
  on wall_signatures (lower(trim(name)));

alter table registered_users enable row level security;
alter table wall_signatures enable row level security;
alter table rate_limits enable row level security;

-- Realtime read for wall (anon can SELECT signatures for live updates)
drop policy if exists "wall_signatures_select" on wall_signatures;
create policy "wall_signatures_select"
  on wall_signatures for select
  using (true);

-- 2) Realtime (ignore error if already added)
do $$
begin
  alter publication supabase_realtime add table wall_signatures;
exception when duplicate_object then
  null;
end $$;

-- 3) Remove old blocking policies
drop policy if exists "registered_users_deny_all" on registered_users;
drop policy if exists "rate_limits_deny_all" on rate_limits;

-- 4) RPC functions (bypass RLS for publishable key)
create or replace function public.bnb_get_registered_names()
returns setof text
language sql
security definer
set search_path = public
stable
as $$
  select ru.name from registered_users ru;
$$;

create or replace function public.bnb_find_registered_user(p_name text)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select ru.name
  from registered_users ru
  where lower(trim(ru.name)) = lower(trim(p_name))
  limit 1;
$$;

create or replace function public.bnb_is_name_signed(p_name text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from wall_signatures ws
    where lower(trim(ws.name)) = lower(trim(p_name))
  );
$$;

create or replace function public.bnb_count_registered_users()
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::integer from registered_users;
$$;

create or replace function public.bnb_insert_registered_users(p_names text[])
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n text;
  added integer := 0;
begin
  foreach n in array p_names loop
    if trim(n) = '' then
      continue;
    end if;
    if exists (
      select 1 from registered_users ru
      where lower(trim(ru.name)) = lower(trim(n))
    ) then
      continue;
    end if;
    insert into registered_users (name) values (trim(n));
    added := added + 1;
  end loop;
  return added;
end;
$$;

create or replace function public.bnb_count_signatures()
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::integer from wall_signatures;
$$;

create or replace function public.bnb_get_signature_names()
returns setof text
language sql
security definer
set search_path = public
stable
as $$
  select ws.name from wall_signatures ws;
$$;

create or replace function public.bnb_get_signatures()
returns table(id uuid, name text, signed_at timestamptz)
language sql
security definer
set search_path = public
stable
as $$
  select ws.id, ws.name, ws.signed_at
  from wall_signatures ws
  order by ws.signed_at asc;
$$;

create or replace function public.bnb_insert_signature(p_name text)
returns table(id uuid, name text, signed_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  canonical text;
begin
  select ru.name into canonical
  from registered_users ru
  where lower(trim(ru.name)) = lower(trim(p_name))
  limit 1;

  if canonical is null then
    return;
  end if;

  if exists (
    select 1 from wall_signatures ws
    where lower(trim(ws.name)) = lower(trim(canonical))
  ) then
    return;
  end if;

  return query
  insert into wall_signatures (name)
  values (canonical)
  returning wall_signatures.id, wall_signatures.name, wall_signatures.signed_at;
end;
$$;

create or replace function public.bnb_check_rate_limit(
  p_ip text,
  p_limit_seconds integer default 5
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  last_ts timestamptz;
  now_ts timestamptz := now();
begin
  select rl.last_request_at into last_ts from rate_limits rl where rl.ip = p_ip;
  if last_ts is not null and extract(epoch from (now_ts - last_ts)) < p_limit_seconds then
    return false;
  end if;
  insert into rate_limits (ip, last_request_at) values (p_ip, now_ts)
  on conflict (ip) do update set last_request_at = excluded.last_request_at;
  return true;
end;
$$;

create or replace function public.bnb_get_registered_users()
returns table(id uuid, name text, created_at timestamptz)
language sql
security definer
set search_path = public
stable
as $$
  select ru.id, ru.name, ru.created_at
  from registered_users ru
  order by ru.created_at asc;
$$;

create or replace function public.bnb_delete_registered_user(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  user_name text;
begin
  select ru.name into user_name
  from registered_users ru
  where ru.id = p_id;

  if user_name is null then
    return false;
  end if;

  delete from wall_signatures ws
  where lower(trim(ws.name)) = lower(trim(user_name));

  delete from registered_users ru
  where ru.id = p_id;

  return true;
end;
$$;

create or replace function public.bnb_delete_signature(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from wall_signatures ws where ws.id = p_id;
  return found;
end;
$$;

-- 5) Permissions
grant usage on schema public to anon, authenticated, service_role;
grant execute on function public.bnb_get_registered_names() to anon, authenticated, service_role;
grant execute on function public.bnb_find_registered_user(text) to anon, authenticated, service_role;
grant execute on function public.bnb_is_name_signed(text) to anon, authenticated, service_role;
grant execute on function public.bnb_count_registered_users() to anon, authenticated, service_role;
grant execute on function public.bnb_insert_registered_users(text[]) to anon, authenticated, service_role;
grant execute on function public.bnb_count_signatures() to anon, authenticated, service_role;
grant execute on function public.bnb_get_signature_names() to anon, authenticated, service_role;
grant execute on function public.bnb_get_signatures() to anon, authenticated, service_role;
grant execute on function public.bnb_insert_signature(text) to anon, authenticated, service_role;
grant execute on function public.bnb_check_rate_limit(text, integer) to anon, authenticated, service_role;
grant execute on function public.bnb_get_registered_users() to anon, authenticated, service_role;
grant execute on function public.bnb_delete_registered_user(uuid) to anon, authenticated, service_role;
grant execute on function public.bnb_delete_signature(uuid) to anon, authenticated, service_role;

-- 6) Reload API schema cache
notify pgrst, 'reload schema';

-- 7) Verify (should return 13)
select count(*) as function_count
from pg_proc p
join pg_namespace n on p.pronamespace = n.oid
where n.nspname = 'public' and p.proname like 'bnb_%';
