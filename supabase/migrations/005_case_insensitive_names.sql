-- Case-insensitive names patch (run in Supabase SQL Editor if already set up)

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

grant execute on function public.bnb_find_registered_user(text) to anon, authenticated, service_role;
grant execute on function public.bnb_is_name_signed(text) to anon, authenticated, service_role;

notify pgrst, 'reload schema';
