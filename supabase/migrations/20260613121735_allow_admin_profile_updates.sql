create schema if not exists private;

create table public.profile_admin_audit_logs (
  id bigint generated always as identity primary key,
  profile_user_id uuid not null references auth.users(id) on delete cascade,
  changed_by uuid references auth.users(id) on delete set null,
  previous_data jsonb not null,
  updated_data jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.profile_admin_audit_logs enable row level security;

create policy "Admins can view profile audit logs"
on public.profile_admin_audit_logs
for select
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

revoke all privileges on table public.profile_admin_audit_logs from anon;
revoke all privileges on table public.profile_admin_audit_logs from authenticated;
grant select on table public.profile_admin_audit_logs to authenticated;

create policy "Admins can view all profiles"
on public.profiles
for select
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update profiles"
on public.profiles
for update
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

grant update on table public.profiles to authenticated;

create or replace function private.log_profile_admin_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profile_admin_audit_logs (
    profile_user_id,
    changed_by,
    previous_data,
    updated_data
  )
  values (
    old.user_id,
    (select auth.uid()),
    to_jsonb(old),
    to_jsonb(new)
  );

  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.log_profile_admin_update() from public;

create trigger log_profile_admin_update
before update on public.profiles
for each row
execute function private.log_profile_admin_update();
