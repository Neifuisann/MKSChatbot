create table public.prompts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique
    check (code ~ '^P[0-9]{2,}$'),
  category text not null
    check (char_length(btrim(category)) between 2 and 120),
  title text not null
    check (char_length(btrim(title)) between 2 and 200),
  purpose text not null
    check (char_length(btrim(purpose)) between 2 and 500),
  content text not null
    check (char_length(btrim(content)) between 10 and 10000),
  tip text not null default ''
    check (char_length(tip) <= 1000),
  sort_order integer not null default 0
    check (sort_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index prompts_active_sort_order_idx
on public.prompts (is_active, sort_order, code);

create index prompts_category_idx
on public.prompts (category)
where is_active;

alter table public.prompts enable row level security;

create policy "Authenticated users can view active prompts"
on public.prompts
for select
to authenticated
using (is_active);

revoke all privileges on table public.prompts from anon;
revoke all privileges on table public.prompts from authenticated;
grant select on table public.prompts to authenticated;

create or replace function public.set_prompt_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_prompts_updated_at
before update on public.prompts
for each row
execute function public.set_prompt_updated_at();
