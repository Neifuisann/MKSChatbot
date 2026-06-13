create table public.chat_sessions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Cuộc trò chuyện mới'
    check (char_length(btrim(title)) between 1 and 160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.chat_messages (
  id text not null
    check (char_length(id) between 1 and 160),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) <= 100000),
  parts jsonb not null default '[]'::jsonb
    check (jsonb_typeof(parts) = 'array'),
  turn_index integer not null check (turn_index >= 0),
  created_at timestamptz not null default now(),
  primary key (session_id, id)
);

create index chat_sessions_user_updated_at_idx
on public.chat_sessions (user_id, updated_at desc);

create index chat_messages_session_turn_idx
on public.chat_messages (session_id, turn_index, created_at);

alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

create policy "Users can view their own chat sessions"
on public.chat_sessions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can view their own chat messages"
on public.chat_messages
for select
to authenticated
using ((select auth.uid()) = user_id);

revoke all privileges on table public.chat_sessions from anon;
revoke all privileges on table public.chat_messages from anon;
revoke all privileges on table public.chat_sessions from authenticated;
revoke all privileges on table public.chat_messages from authenticated;

grant select on table public.chat_sessions to authenticated;
grant select on table public.chat_messages to authenticated;
