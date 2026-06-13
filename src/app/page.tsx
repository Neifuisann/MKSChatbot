import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  CalendarCheck,
  Check,
  MessageCircleQuestion,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const supportCards = [
  {
    icon: BookOpenText,
    title: "Thông tin học tập",
    description:
      "Tìm chính sách, lịch học và hướng dẫn từ nguồn tài liệu chính thức.",
  },
  {
    icon: CalendarCheck,
    title: "Đặt lịch nhanh",
    description:
      "Kiểm tra thời gian trống và đặt lịch với đúng phòng ban cần hỗ trợ.",
  },
  {
    icon: MessageCircleQuestion,
    title: "Hỏi đáp rõ ràng",
    description:
      "Nhận câu trả lời ngắn gọn, có trích dẫn và hướng xử lý tiếp theo.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f3e9] text-[#24352d]">
      <SiteHeader />

      <section className="relative mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-7xl items-center gap-14 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:px-12 lg:pb-28 lg:pt-16">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#d8d4c9] bg-white/60 px-3.5 py-2 text-xs font-medium text-[#4e6258]">
            <Sparkles className="size-3.5 text-[#bd684b]" />
            Trợ lý học đường đáng tin cậy
          </div>
          <h1 className="max-w-3xl font-serif text-5xl leading-[1.04] tracking-[-0.045em] text-[#20382d] sm:text-6xl lg:text-[5.15rem]">
            Mỗi câu hỏi ở trường, một câu trả lời rõ ràng.
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-[#607068] sm:text-lg">
            MKS giúp học sinh và phụ huynh tìm đúng thông tin, đặt lịch hỗ trợ
            và kết nối với nhà trường nhanh hơn.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className={cn(
                buttonVariants(),
                "h-12 rounded-full bg-[#275641] px-6 text-sm text-white shadow-[0_10px_30px_rgba(39,86,65,0.18)] hover:bg-[#1f4635]",
              )}
            >
              Bắt đầu trò chuyện
              <ArrowRight className="ml-1 size-4" />
            </Link>
            <Link
              href="#how-it-works"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "h-12 rounded-full px-6 text-sm text-[#344a3f] hover:bg-[#ebe7dc]",
              )}
            >
              Khám phá cách hoạt động
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs text-[#66766e]">
            {["Nguồn chính thức", "Bảo mật thông tin", "Hỗ trợ 24/7"].map(
              (item) => (
                <span className="flex items-center gap-1.5" key={item}>
                  <Check className="size-3.5 text-[#3e735c]" />
                  {item}
                </span>
              ),
            )}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:mr-0">
          <div className="absolute -left-24 -top-24 size-72 rounded-full bg-[#dfb6a4]/30 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 size-72 rounded-full bg-[#a9c4b2]/35 blur-3xl" />
          <div className="relative rounded-[2rem] border border-white/70 bg-[#fffdfa]/85 p-4 shadow-[0_30px_80px_rgba(67,74,61,0.14)] backdrop-blur">
            <div className="rounded-[1.5rem] border border-[#e5e0d5] bg-[#fbfaf6] p-5 sm:p-7">
              <div className="flex items-center justify-between border-b border-[#e7e2d7] pb-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8c978f]">
                    MKS Assistant
                  </p>
                  <p className="mt-1 font-serif text-xl text-[#294536]">
                    Xin chào, mình có thể giúp gì?
                  </p>
                </div>
                <span className="size-2.5 rounded-full bg-[#5b9474] shadow-[0_0_0_5px_rgba(91,148,116,0.12)]" />
              </div>
              <div className="space-y-4 py-6">
                <div className="ml-auto max-w-[86%] rounded-2xl rounded-br-md bg-[#e6eee7] px-4 py-3 text-sm leading-6 text-[#355343]">
                  Học phí học kỳ mới được đóng trước ngày nào?
                </div>
                <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-[#e8e3d9] bg-white px-4 py-3.5 text-sm leading-6 text-[#4c5c54]">
                  Mình sẽ kiểm tra thông báo học phí chính thức và gửi bạn thời
                  hạn kèm nguồn tham khảo.
                  <div className="mt-3 flex items-center gap-2 border-t border-[#eeeae2] pt-3 text-xs font-medium text-[#3f6c56]">
                    <ShieldCheck className="size-3.5" />
                    Câu trả lời có kiểm chứng
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-full border border-[#ddd8cc] bg-white px-4 py-3 text-sm text-[#9a9f9b]">
                Hỏi MKS bất cứ điều gì...
                <span className="grid size-8 place-items-center rounded-full bg-[#275641] text-white">
                  <ArrowRight className="size-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="support" className="bg-[#fffdfa] px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a35d46]">
            Một nơi để bắt đầu
          </p>
          <div className="mt-4 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <h2 className="max-w-xl font-serif text-4xl tracking-[-0.035em] text-[#233b30] sm:text-5xl">
              Hỗ trợ đúng lúc, từ đúng nguồn.
            </h2>
            <p className="max-w-md text-sm leading-6 text-[#66746d]">
              Trợ lý chỉ sử dụng tài liệu được nhà trường phê duyệt và luôn
              hướng bạn đến con người khi cần thêm hỗ trợ.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {supportCards.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-3xl border border-[#e6e1d7] bg-[#f8f5ec] p-7 transition-transform duration-300 hover:-translate-y-1"
              >
                <span className="grid size-11 place-items-center rounded-2xl bg-[#e5eee6] text-[#326047]">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-7 font-serif text-2xl text-[#294235]">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#68766f]">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="border-y border-[#dce4dc] bg-[#e9f0e9] px-5 py-20 sm:px-8 lg:px-12"
      >
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#587364]">
              Đơn giản và minh bạch
            </p>
            <h2 className="mt-4 font-serif text-4xl tracking-[-0.035em] text-[#233b30] sm:text-5xl">
              Hỏi. Kiểm chứng. Hành động.
            </h2>
          </div>
          <Link
            href="/login"
            className={cn(
              buttonVariants(),
              "h-12 rounded-full bg-[#275641] px-6 text-white hover:bg-[#1f4635]",
            )}
          >
            Đăng nhập với Google
            <ArrowRight className="ml-1 size-4" />
          </Link>
        </div>
      </section>

      <footer id="trust" className="bg-[#20382d] px-5 py-8 text-[#dbe5dd] sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-xs sm:flex-row sm:items-center">
          <p>© 2026 MKS School. Trợ lý học đường có trách nhiệm.</p>
          <div className="flex gap-5 text-[#aebdb4]">
            <span>Quyền riêng tư</span>
            <span>Điều khoản sử dụng</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
