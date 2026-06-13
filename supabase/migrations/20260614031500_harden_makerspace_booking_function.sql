revoke execute on function public.create_makerspace_booking(
  uuid, uuid, timestamptz, timestamptz, integer, integer, text, text
) from anon, authenticated;

grant execute on function public.create_makerspace_booking(
  uuid, uuid, timestamptz, timestamptz, integer, integer, text, text
) to service_role;

create index makerspace_bookings_reviewed_by_idx
on public.makerspace_bookings (reviewed_by)
where reviewed_by is not null;
