alter table public.chat_messages
drop constraint chat_messages_id_check;

alter table public.chat_messages
add constraint chat_messages_id_check
check (char_length(id) between 1 and 512);
