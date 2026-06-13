drop policy if exists "Users can update their own profile" on public.profiles;

revoke update on table public.profiles from authenticated;

drop trigger if exists set_profiles_updated_at on public.profiles;
drop function if exists public.set_profile_updated_at();
