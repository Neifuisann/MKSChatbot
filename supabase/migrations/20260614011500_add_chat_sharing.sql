alter table public.chat_sessions
add column share_token uuid unique,
add column shared_at timestamptz;

create index chat_sessions_share_token_idx
on public.chat_sessions (share_token)
where share_token is not null;
