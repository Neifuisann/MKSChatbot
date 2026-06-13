create table public.makerspace_resources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
    check (char_length(btrim(name)) between 2 and 120),
  category text not null
    check (category in ('space', 'equipment', 'tool', 'fabrication')),
  description text not null
    check (char_length(btrim(description)) between 10 and 500),
  location text not null
    check (char_length(btrim(location)) between 2 and 120),
  capacity integer not null default 1
    check (capacity between 1 and 100),
  max_people integer not null default 1
    check (max_people between 1 and 100),
  auto_approve boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.makerspace_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_id uuid not null references public.makerspace_resources(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  quantity integer not null default 1
    check (quantity between 1 and 100),
  attendee_count integer not null default 1
    check (attendee_count between 1 and 100),
  purpose text not null
    check (char_length(btrim(purpose)) between 10 and 1000),
  notes text
    check (notes is null or char_length(btrim(notes)) <= 1000),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'cancelled', 'completed')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index makerspace_resources_category_active_idx
on public.makerspace_resources (category, is_active, name);

create index makerspace_bookings_resource_schedule_idx
on public.makerspace_bookings (resource_id, starts_at, ends_at)
where status in ('pending', 'approved');

create index makerspace_bookings_user_created_at_idx
on public.makerspace_bookings (user_id, created_at desc);

alter table public.makerspace_resources enable row level security;
alter table public.makerspace_bookings enable row level security;

create policy "Authenticated users can view active makerspace resources"
on public.makerspace_resources
for select
to authenticated
using (
  is_active
  or ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "Users can view their own makerspace bookings"
on public.makerspace_bookings
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
);

revoke all privileges on table public.makerspace_resources from anon;
revoke all privileges on table public.makerspace_resources from authenticated;
grant select on table public.makerspace_resources to authenticated;

revoke all privileges on table public.makerspace_bookings from anon;
revoke all privileges on table public.makerspace_bookings from authenticated;
grant select on table public.makerspace_bookings to authenticated;

create or replace function private.set_makerspace_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_makerspace_updated_at() from public;

create trigger set_makerspace_resources_updated_at
before update on public.makerspace_resources
for each row execute function private.set_makerspace_updated_at();

create trigger set_makerspace_bookings_updated_at
before update on public.makerspace_bookings
for each row execute function private.set_makerspace_updated_at();

create or replace function public.create_makerspace_booking(
  p_user_id uuid,
  p_resource_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_quantity integer,
  p_attendee_count integer,
  p_purpose text,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  available_capacity integer;
  booking_id uuid;
  booked_quantity integer;
  resource_record public.makerspace_resources%rowtype;
begin
  select *
  into resource_record
  from public.makerspace_resources
  where id = p_resource_id and is_active
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'MAKERSPACE_RESOURCE_NOT_FOUND';
  end if;

  if p_starts_at < now() or p_ends_at <= p_starts_at then
    raise exception using errcode = 'P0001', message = 'MAKERSPACE_INVALID_TIME';
  end if;

  if p_ends_at - p_starts_at > interval '8 hours' then
    raise exception using errcode = 'P0001', message = 'MAKERSPACE_DURATION_TOO_LONG';
  end if;

  if p_quantity < 1 or p_quantity > resource_record.capacity
    or p_attendee_count < 1 or p_attendee_count > resource_record.max_people then
    raise exception using errcode = 'P0001', message = 'MAKERSPACE_CAPACITY_EXCEEDED';
  end if;

  select coalesce(sum(quantity), 0)
  into booked_quantity
  from public.makerspace_bookings
  where resource_id = p_resource_id
    and status in ('pending', 'approved')
    and starts_at < p_ends_at
    and ends_at > p_starts_at;

  available_capacity := resource_record.capacity - booked_quantity;
  if p_quantity > available_capacity then
    raise exception using errcode = 'P0001', message = 'MAKERSPACE_SLOT_UNAVAILABLE';
  end if;

  insert into public.makerspace_bookings (
    user_id,
    resource_id,
    starts_at,
    ends_at,
    quantity,
    attendee_count,
    purpose,
    notes,
    status,
    reviewed_at
  )
  values (
    p_user_id,
    p_resource_id,
    p_starts_at,
    p_ends_at,
    p_quantity,
    p_attendee_count,
    btrim(p_purpose),
    nullif(btrim(p_notes), ''),
    case when resource_record.auto_approve then 'approved' else 'pending' end,
    case when resource_record.auto_approve then now() else null end
  )
  returning id into booking_id;

  return booking_id;
end;
$$;

revoke all on function public.create_makerspace_booking(
  uuid, uuid, timestamptz, timestamptz, integer, integer, text, text
) from public;
grant execute on function public.create_makerspace_booking(
  uuid, uuid, timestamptz, timestamptz, integer, integer, text, text
) to service_role;

insert into public.makerspace_resources
  (name, category, description, location, capacity, max_people, auto_approve)
values
  ('Phòng họp dự án', 'space', 'Không gian họp nhóm có màn hình trình chiếu và bảng viết.', 'Makerspace · Tầng 2', 1, 12, true),
  ('Phòng sáng tạo mở', 'space', 'Không gian làm việc linh hoạt cho workshop và hoạt động nhóm.', 'Makerspace · Tầng 2', 1, 30, false),
  ('Bộ Arduino Uno', 'equipment', 'Bộ vi điều khiển, dây nối và cảm biến cơ bản cho thử nghiệm.', 'Quầy thiết bị', 8, 8, true),
  ('Kính thực tế ảo', 'equipment', 'Kính VR phục vụ nghiên cứu trải nghiệm và mô phỏng.', 'Quầy thiết bị', 3, 3, false),
  ('Bộ dụng cụ điện tử', 'tool', 'Bộ kìm, tua vít, đồng hồ đo và dụng cụ lắp ráp điện tử.', 'Tủ dụng cụ A', 6, 6, true),
  ('Bộ dụng cụ cơ khí', 'tool', 'Bộ dụng cụ cầm tay cho lắp ráp và hoàn thiện mô hình.', 'Tủ dụng cụ B', 4, 4, true),
  ('Máy in 3D Prusa', 'fabrication', 'Máy in FDM cho mô hình PLA/PETG; cần nộp tệp sau khi được duyệt.', 'Xưởng gia công', 2, 4, false),
  ('Máy khắc laser', 'fabrication', 'Máy khắc và cắt laser cho vật liệu được Makerspace phê duyệt.', 'Xưởng gia công', 1, 3, false);
