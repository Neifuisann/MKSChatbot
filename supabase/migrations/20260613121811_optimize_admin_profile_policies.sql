drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can update profiles" on public.profiles;
drop policy if exists "Admins can view profile audit logs"
on public.profile_admin_audit_logs;

create policy "Users can view permitted profiles"
on public.profiles
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "Admins can update profiles"
on public.profiles
for update
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can view profile audit logs"
on public.profile_admin_audit_logs
for select
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create index profile_admin_audit_logs_profile_user_id_idx
on public.profile_admin_audit_logs (profile_user_id);

create index profile_admin_audit_logs_changed_by_idx
on public.profile_admin_audit_logs (changed_by);
