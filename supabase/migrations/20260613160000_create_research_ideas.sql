create table public.research_ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null
    check (char_length(btrim(title)) between 5 and 200),
  description text not null
    check (char_length(btrim(description)) between 30 and 5000),
  field text not null
    check (char_length(btrim(field)) between 2 and 120),
  status text not null default 'pending'
    check (status in ('pending', 'approved')),
  ai_feedback jsonb not null
    check (jsonb_typeof(ai_feedback) = 'object'),
  ai_model text not null
    check (char_length(btrim(ai_model)) between 1 and 200),
  admin_response text
    check (admin_response is null or char_length(admin_response) <= 5000),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (status = 'approved' and approved_at is not null)
    or (status = 'pending' and approved_at is null)
  )
);

create index research_ideas_user_created_at_idx
on public.research_ideas (user_id, created_at desc);

create index research_ideas_pending_user_idx
on public.research_ideas (user_id)
where status = 'pending';

alter table public.research_ideas enable row level security;

create policy "Users can view permitted research ideas"
on public.research_ideas
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
);

revoke all privileges on table public.research_ideas from anon;
revoke all privileges on table public.research_ideas from authenticated;
grant select on table public.research_ideas to authenticated;

create or replace function private.enforce_research_idea_rules()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.status <> 'pending' or new.approved_at is not null then
      raise exception using
        errcode = 'P0001',
        message = 'RESEARCH_IDEA_MUST_START_PENDING';
    end if;

    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(new.user_id::text, 0)
    );

    if (
      select count(*)
      from public.research_ideas
      where user_id = new.user_id and status = 'pending'
    ) >= 3 then
      raise exception using
        errcode = 'P0001',
        message = 'RESEARCH_IDEA_LIMIT_REACHED';
    end if;
  end if;

  if tg_op = 'UPDATE' then
    if old.status = 'approved' then
      raise exception using
        errcode = 'P0001',
        message = 'APPROVED_RESEARCH_IDEA_IS_LOCKED';
    end if;

    if new.user_id <> old.user_id or new.created_at <> old.created_at then
      raise exception using
        errcode = 'P0001',
        message = 'RESEARCH_IDEA_OWNERSHIP_IS_IMMUTABLE';
    end if;

    if new.status = 'approved' then
      new.approved_at = coalesce(new.approved_at, now());
    else
      new.approved_at = null;
    end if;

    new.updated_at = now();
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_research_idea_rules() from public;

create trigger enforce_research_idea_rules
before insert or update on public.research_ideas
for each row
execute function private.enforce_research_idea_rules();
