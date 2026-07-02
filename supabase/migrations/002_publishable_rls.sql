-- Allow API routes using the publishable (anon) key when no secret key is configured.
-- Service role key bypasses RLS, so this mainly affects publishable-only setups.

drop policy if exists "registered_users_deny_all" on registered_users;
drop policy if exists "rate_limits_deny_all" on rate_limits;

create policy "registered_users_select_anon"
  on registered_users for select
  to anon, authenticated
  using (true);

create policy "registered_users_insert_anon"
  on registered_users for insert
  to anon, authenticated
  with check (true);

create policy "wall_signatures_insert_anon"
  on wall_signatures for insert
  to anon, authenticated
  with check (true);

create policy "rate_limits_all_anon"
  on rate_limits for all
  to anon, authenticated
  using (true)
  with check (true);
