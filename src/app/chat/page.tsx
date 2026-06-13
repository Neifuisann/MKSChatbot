import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

import { AuthenticatedHeader } from "@/components/authenticated-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name =
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name
      : user.email;

  return (
    <main className="min-h-screen bg-[#f7f3e9] px-5 py-5 text-[#24352d] sm:px-8 lg:px-12">
      <AuthenticatedHeader user={user} />

      <section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-3xl flex-col items-center justify-center py-16 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-[#e1ece2] text-[#356249]">
          <ShieldCheck className="size-5" />
        </span>
        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-[#a35d46]">
          Đăng nhập thành công
        </p>
        <h1 className="mt-4 font-serif text-4xl tracking-[-0.04em] text-[#20382d] sm:text-5xl">
          Xin chào, {name}.
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-6 text-[#68766f]">
          Tài khoản Google của bạn đã được kết nối an toàn. Giao diện trò
          chuyện và nguồn kiến thức nhà trường sẽ được xây dựng ở bước tiếp
          theo.
        </p>
        <Link
          href="/"
          className="mt-8 flex h-11 items-center gap-2 rounded-full bg-[#275641] px-5 text-sm font-medium text-white transition-colors hover:bg-[#1f4635]"
        >
          Về trang chủ
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </main>
  );
}
