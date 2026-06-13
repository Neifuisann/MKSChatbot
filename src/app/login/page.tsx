import Link from "next/link";
import { ArrowLeft, Check, LockKeyhole } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <main className="grid min-h-screen bg-[#f7f3e9] text-[#24352d] lg:grid-cols-[0.9fr_1.1fr]">
      <section className="flex min-h-screen flex-col px-5 py-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="MKS School home">
            <BrandMark />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-medium text-[#64736b] transition-colors hover:text-[#24352d]"
          >
            <ArrowLeft className="size-3.5" />
            Về trang chủ
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a35d46]">
            Cổng thông tin MKS
          </p>
          <h1 className="mt-4 font-serif text-4xl tracking-[-0.04em] text-[#20382d] sm:text-5xl">
            Chào mừng bạn quay lại.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#68766f]">
            Đăng nhập để tiếp tục trò chuyện, xem lịch hẹn và nhận hỗ trợ phù
            hợp với bạn.
          </p>

          {error && (
            <p className="mt-7 rounded-2xl border border-[#dfb8a9] bg-[#f8eae4] px-4 py-3 text-sm text-[#8b4935]">
              Không thể đăng nhập lúc này. Vui lòng thử lại.
            </p>
          )}

          <button
            type="button"
            className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-full border border-[#d7d1c5] bg-white text-sm font-medium text-[#2c3d34] shadow-[0_8px_24px_rgba(53,62,54,0.07)] transition-colors hover:bg-[#fbfaf6]"
          >
            <svg
              aria-hidden="true"
              className="size-4.5"
              viewBox="0 0 24 24"
            >
              <path
                fill="#4285F4"
                d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z"
              />
              <path
                fill="#34A853"
                d="M12 22c2.7 0 4.98-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"
              />
              <path
                fill="#FBBC05"
                d="M6.39 13.93A6 6 0 0 1 6.08 12c0-.67.11-1.32.31-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.55l3.35-2.62Z"
              />
              <path
                fill="#EA4335"
                d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.87-2.88A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z"
              />
            </svg>
            Tiếp tục với Google
          </button>

          <div className="my-7 flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-[#9a9f9b]">
            <span className="h-px flex-1 bg-[#ded9cd]" />
            Đăng nhập nhanh và an toàn
            <span className="h-px flex-1 bg-[#ded9cd]" />
          </div>

          <div className="space-y-3 rounded-3xl border border-[#e1dcd1] bg-[#fbf9f3] p-5 text-xs leading-5 text-[#637169]">
            <p className="flex gap-3">
              <Check className="mt-0.5 size-3.5 shrink-0 text-[#3f745b]" />
              Tài khoản Google chỉ dùng để xác minh danh tính.
            </p>
            <p className="flex gap-3">
              <LockKeyhole className="mt-0.5 size-3.5 shrink-0 text-[#3f745b]" />
              MKS không bao giờ xem hoặc lưu mật khẩu Google của bạn.
            </p>
          </div>

          <p className="mt-8 text-center text-xs leading-5 text-[#858f89]">
            Bằng việc tiếp tục, bạn đồng ý với điều khoản sử dụng và chính sách
            quyền riêng tư của MKS.
          </p>
        </div>
      </section>

      <aside className="relative hidden overflow-hidden bg-[#244638] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-32 -top-32 size-[30rem] rounded-full border border-white/10" />
        <div className="absolute -right-16 -top-16 size-[22rem] rounded-full border border-white/10" />
        <div className="absolute -bottom-48 -left-48 size-[34rem] rounded-full bg-[#d69478]/20 blur-3xl" />
        <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-[#afc4b7]">
          MKS School Assistant
        </p>
        <div className="relative max-w-xl">
          <blockquote className="font-serif text-4xl leading-tight tracking-[-0.035em] xl:text-5xl">
            “Giúp mỗi thành viên trong trường tìm thấy câu trả lời và sự hỗ trợ
            họ cần.”
          </blockquote>
          <div className="mt-10 flex items-center gap-3 border-t border-white/15 pt-6 text-sm text-[#b8c9bf]">
            <span className="size-2 rounded-full bg-[#8fbea2]" />
            Thông tin chính xác, có nguồn và luôn tôn trọng riêng tư.
          </div>
        </div>
      </aside>
    </main>
  );
}
