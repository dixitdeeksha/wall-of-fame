-- Fix RLS for publishable-key (sb_publishable_...) access.
-- Run this in Supabase SQL Editor if admin upload or signing fails with policy errors.

-- Remove block-all policies from 001_initial.sql
drop policy if exists "registered_users_deny_all" on registered_users;
drop policy if exists "rate_limits_deny_all" on rate_limits;

-- Remove older allow policies (safe to re-run)
drop policy if exists "registered_users_select_anon" on registered_users;
drop policy if exists "registered_users_insert_anon" on registered_users;
drop policy if exists "wall_signatures_insert_anon" on wall_signatures;
drop policy if exists "rate_limits_all_anon" on rate_limits;

-- Allow policies for ALL roles (no "to anon" — works with publishable keys)
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

-- Grants required alongside RLS
grant usage on schema public to anon, authenticated;
grant select, insert on table public.registered_users to anon, authenticated;
grant select, insert on table public.wall_signatures to anon, authenticated;
grant select, insert, update on table public.rate_limits to anon, authenticated;
