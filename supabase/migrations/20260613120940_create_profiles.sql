create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  student_id text not null unique
    check (student_id ~ '^[A-Za-z0-9_-]{3,40}$'),
  full_name text not null
    check (char_length(btrim(full_name)) between 2 and 120),
  learning_field text not null
    check (
      learning_field in (
        'Khoa học tự nhiên',
        'Khoa học xã hội',
        'Công nghệ thông tin',
        'Kinh tế và quản lý',
        'Ngôn ngữ và văn hóa',
        'Nghệ thuật và thiết kế',
        'Khác'
      )
    ),
  student_email text not null unique
    check (char_length(student_email) <= 254),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

grant select, insert, update on table public.profiles to authenticated;

create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_profile_updated_at();
