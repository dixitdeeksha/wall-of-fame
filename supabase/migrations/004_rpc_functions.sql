-- RPC functions bypass RLS — required when using publishable keys (sb_publishable_...).
-- Run this in Supabase SQL Editor.

create or replace function public.bnb_get_registered_names()
returns setof text
language sql
security definer
set search_path = public
stable
as $$
  select ru.name from registered_users ru;
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
begin
  return query
  insert into wall_signatures (name)
  values (trim(p_name))
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
  select rl.last_request_at into last_ts
  from rate_limits rl
  where rl.ip = p_ip;

  if last_ts is not null
    and extract(epoch from (now_ts - last_ts)) < p_limit_seconds
  then
    return false;
  end if;

  insert into rate_limits (ip, last_request_at)
  values (p_ip, now_ts)
  on conflict (ip) do update
    set last_request_at = excluded.last_request_at;

  return true;
end;
$$;

grant execute on function public.bnb_get_registered_names() to anon, authenticated;
grant execute on function public.bnb_count_registered_users() to anon, authenticated;
grant execute on function public.bnb_insert_registered_users(text[]) to anon, authenticated;
grant execute on function public.bnb_count_signatures() to anon, authenticated;
grant execute on function public.bnb_get_signature_names() to anon, authenticated;
grant execute on function public.bnb_get_signatures() to anon, authenticated;
grant execute on function public.bnb_insert_signature(text) to anon, authenticated;
grant execute on function public.bnb_check_rate_limit(text, integer) to anon, authenticated;
