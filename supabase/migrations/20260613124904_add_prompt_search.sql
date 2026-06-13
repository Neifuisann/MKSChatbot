alter table public.prompts
add column search_document tsvector
generated always as (
  to_tsvector(
    'simple'::regconfig,
    code || ' ' || category || ' ' || title || ' ' || purpose || ' ' || content
  )
) stored;

create index prompts_search_document_idx
on public.prompts
using gin (search_document);
