create policy "Admins can manage research ideas"
on public.research_ideas
for all
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can manage prompts"
on public.prompts
for all
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can manage makerspace resources"
on public.makerspace_resources
for all
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

grant insert, update, delete on table public.research_ideas to authenticated;
grant insert, update, delete on table public.prompts to authenticated;
grant insert, update, delete on table public.makerspace_resources to authenticated;
