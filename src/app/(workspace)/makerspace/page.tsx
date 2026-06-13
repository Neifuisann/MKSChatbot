import {
  Box,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Printer,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";

import { MakerspaceBookingForm } from "@/components/makerspace-booking-form";
import {
  listMakerspaceResources,
  listUserMakerspaceBookings,
} from "@/lib/makerspace/store";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MakerspaceBookingStatus } from "@/schemas/makerspace-booking";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const statusLabels: Record<MakerspaceBookingStatus, string> = {
  approved: "Đã xác nhận",
  cancelled: "Đã hủy",
  completed: "Đã hoàn thành",
  pending: "Chờ duyệt",
};

const statusClasses: Record<MakerspaceBookingStatus, string> = {
  approved: "bg-[#dcebdd] text-[#376149]",
  cancelled: "bg-[#f0e5e1] text-[#895343]",
  completed: "bg-[#e4ebe7] text-[#52675b]",
  pending: "bg-[#f2e8df] text-[#8b5c47]",
};

export default async function MakerspacePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [resources, bookings] = await Promise.all([
    listMakerspaceResources(),
    listUserMakerspaceBookings(user.id),
  ]);
  const pendingCount = bookings.filter((booking) => booking.status === "pending").length;
  const approvedCount = bookings.filter((booking) => booking.status === "approved").length;

  return (
    <section className="relative min-w-0 flex-1 overflow-y-auto bg-[#f7f5ef] px-5 py-5 text-[#24352d] sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute -left-32 top-48 size-80 rounded-full bg-[#d9b5a5]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-16 size-96 rounded-full bg-[#b6cdbd]/25 blur-3xl" />

      <div className="relative mx-auto max-w-6xl pb-20 pt-10 lg:pt-14">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a35d46]">
            Makerspace booking
          </p>
          <h1 className="mt-4 font-serif text-4xl tracking-[-0.04em] text-[#20382d] sm:text-5xl">
            Đặt lịch cho ý tưởng tiếp theo.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-[#68766f]">
            Chọn không gian, thiết bị hoặc dịch vụ gia công; kiểm tra lịch trống
            và gửi một phiếu đăng ký để Makerspace chuẩn bị hỗ trợ.
          </p>
        </header>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <SummaryCard icon={Box} label="Tài nguyên khả dụng" value={resources.length} />
          <SummaryCard icon={Clock3} label="Đang chờ duyệt" value={pendingCount} />
          <SummaryCard icon={CheckCircle2} label="Lịch đã xác nhận" value={approvedCount} />
        </div>

        <section className="mt-8">
          <MakerspaceBookingForm resources={resources} />
        </section>

        <section className="mt-12">
          <div>
            <h2 className="font-serif text-3xl tracking-[-0.03em] text-[#20382d]">
              Phiếu đăng ký của bạn
            </h2>
            <p className="mt-1 text-sm text-[#7a857f]">
              Theo dõi lịch đã xác nhận và các yêu cầu đang chờ Makerspace duyệt.
            </p>
          </div>

          {bookings.length === 0 ? (
            <div className="mt-6 rounded-[1.75rem] border border-dashed border-[#d7d1c7] bg-[#fbfaf6]/70 px-6 py-14 text-center">
              <CalendarDays className="mx-auto size-7 text-[#a47a67]" />
              <p className="mt-4 font-serif text-xl text-[#3c4c43]">Chưa có lịch đặt</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7a857f]">
                Phiếu đầu tiên sẽ xuất hiện tại đây sau khi bạn kiểm tra lịch và gửi đăng ký.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {bookings.map((booking) => (
                <article
                  className="rounded-[1.5rem] border border-[#e2ddd3] bg-[#fffdfa]/90 p-5 shadow-[0_14px_40px_rgba(67,74,61,0.06)]"
                  key={booking.id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-xl text-[#294536]">{booking.resourceName}</h3>
                      <p className="mt-2 flex items-center gap-2 text-xs text-[#78847d]">
                        <CalendarDays className="size-3.5" />
                        {dateFormatter.format(new Date(booking.startsAt))}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium ${statusClasses[booking.status]}`}
                    >
                      {statusLabels[booking.status]}
                    </span>
                  </div>
                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#59675f]">
                    {booking.purpose}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-[#e8e3d9] pt-4 text-xs text-[#7a857f]">
                    <span className="flex items-center gap-1.5">
                      <Clock3 className="size-3.5" />
                      đến {dateFormatter.format(new Date(booking.endsAt))}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="size-3.5" />
                      {booking.attendeeCount} người · {booking.quantity} đơn vị
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Printer;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#e4dfd5] bg-[#fbfaf6]/85 px-4 py-3">
      <span className="grid size-9 place-items-center rounded-xl bg-[#eee9df] text-[#6b796f]">
        <Icon className="size-4" />
      </span>
      <span>
        <span className="block text-[11px] uppercase tracking-[0.12em] text-[#8b948f]">
          {label}
        </span>
        <span className="mt-0.5 block font-serif text-2xl text-[#294536]">{value}</span>
      </span>
    </div>
  );
}
