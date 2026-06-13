alter table public.chat_sessions
add column is_starred boolean not null default false,
add column custom_title text
  check (
    custom_title is null
    or char_length(btrim(custom_title)) between 1 and 160
  );

create index chat_sessions_user_starred_updated_at_idx
on public.chat_sessions (user_id, is_starred desc, updated_at desc);
