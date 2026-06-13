import {
  BadgeCheck,
  BookOpen,
  GraduationCap,
  LockKeyhole,
  Mail,
  Save,
  UserRound,
} from "lucide-react";
import { redirect } from "next/navigation";

import { AuthenticatedHeader } from "@/components/authenticated-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { learningFields } from "@/schemas/profile";
import { saveProfile } from "./actions";

export const dynamic = "force-dynamic";

type ProfilePageProps = {
  searchParams: Promise<{ error?: string; saved?: string }>;
};

function metadataName(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const { error, saved } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("student_id, full_name, learning_field, student_email")
    .eq("user_id", user.id)
    .maybeSingle();

  const fullName =
    profile?.full_name ||
    metadataName(user.user_metadata.full_name) ||
    metadataName(user.user_metadata.name);
  const isProfileLocked = Boolean(profile);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f3e9] px-5 py-5 text-[#24352d] sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute -left-32 top-48 size-80 rounded-full bg-[#d9b5a5]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-16 size-96 rounded-full bg-[#b6cdbd]/25 blur-3xl" />

      <AuthenticatedHeader user={user} />

      <div className="relative mx-auto grid max-w-6xl gap-8 pb-20 pt-14 lg:grid-cols-[0.72fr_1.28fr] lg:pt-20">
        <aside className="lg:pr-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a35d46]">
            Tài khoản của bạn
          </p>
          <h1 className="mt-4 max-w-md font-serif text-4xl tracking-[-0.04em] text-[#20382d] sm:text-5xl">
            Hồ sơ học tập cá nhân.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-[#68766f]">
            Thông tin này giúp trợ lý MKS hỗ trợ bạn phù hợp hơn trong các cuộc
            trò chuyện và yêu cầu với nhà trường.
          </p>

          <div className="mt-9 space-y-3 text-xs leading-5 text-[#627169]">
            <p className="flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#e5eee6] text-[#3f745b]">
                <LockKeyhole className="size-3.5" />
              </span>
              Chỉ bạn mới có thể xem hồ sơ này sau khi khai báo.
            </p>
            <p className="flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#f3e6df] text-[#9b5b46]">
                <BadgeCheck className="size-3.5" />
              </span>
              Email đăng nhập được xác minh bởi nhà cung cấp tài khoản.
            </p>
          </div>
        </aside>

        <section className="rounded-[2rem] border border-white/80 bg-[#fffdfa]/90 p-4 shadow-[0_30px_80px_rgba(67,74,61,0.12)] backdrop-blur sm:p-6">
          <div className="rounded-[1.5rem] border border-[#e5e0d5] bg-[#fbfaf6] p-5 sm:p-8">
            <div className="flex items-start justify-between gap-5 border-b border-[#e7e2d7] pb-6">
              <div>
                <p className="font-serif text-2xl text-[#294536]">
                  Thông tin cá nhân
                </p>
                <p className="mt-1 text-xs leading-5 text-[#7a857f]">
                  {isProfileLocked
                    ? "Hồ sơ đã được lưu và hiện ở chế độ chỉ đọc."
                    : "Khai báo chính xác thông tin dùng trong hệ thống MKS."}
                </p>
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#e3ece4] text-[#356249]">
                <UserRound className="size-4.5" />
              </span>
            </div>

            {saved && (
              <p className="mt-6 rounded-2xl border border-[#bfd5c5] bg-[#eaf3eb] px-4 py-3 text-sm text-[#356249]">
                Hồ sơ của bạn đã được lưu.
              </p>
            )}
            {error && (
              <p className="mt-6 rounded-2xl border border-[#dfb8a9] bg-[#f8eae4] px-4 py-3 text-sm text-[#8b4935]">
                {error}
              </p>
            )}

            <p className="mt-6 rounded-2xl border border-[#e2c7b8] bg-[#f8eee8] px-4 py-3 text-sm leading-6 text-[#7f5141]">
              <strong className="font-semibold">Lưu ý:</strong>{" "}
              {isProfileLocked
                ? "Thông tin cá nhân chỉ được khai báo một lần và không thể thay đổi sau khi lưu."
                : "Bạn chỉ có thể bấm lưu một lần. Hãy kiểm tra kỹ vì thông tin cá nhân sẽ không thể thay đổi sau khi lưu."}
            </p>

            <form action={saveProfile} className="mt-7 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2 text-xs font-medium text-[#4b5e54]">
                  <span className="flex items-center gap-2">
                    <GraduationCap className="size-3.5 text-[#728078]" />
                    Mã học sinh
                  </span>
                  <input
                    className="h-11 w-full rounded-xl border border-[#dcd7cc] bg-white px-3.5 text-sm text-[#263d31] outline-none transition placeholder:text-[#a6ada9] focus:border-[#799483] focus:ring-3 focus:ring-[#799483]/15"
                    defaultValue={profile?.student_id ?? ""}
                    disabled={isProfileLocked}
                    maxLength={40}
                    minLength={3}
                    name="studentId"
                    placeholder="Ví dụ: MKS2026001"
                    required
                  />
                </label>

                <label className="space-y-2 text-xs font-medium text-[#4b5e54]">
                  <span className="flex items-center gap-2">
                    <UserRound className="size-3.5 text-[#728078]" />
                    Họ và tên
                  </span>
                  <input
                    className="h-11 w-full rounded-xl border border-[#dcd7cc] bg-white px-3.5 text-sm text-[#263d31] outline-none transition placeholder:text-[#a6ada9] focus:border-[#799483] focus:ring-3 focus:ring-[#799483]/15"
                    defaultValue={fullName}
                    disabled={isProfileLocked}
                    maxLength={120}
                    minLength={2}
                    name="fullName"
                    placeholder="Nguyễn Văn An"
                    required
                  />
                </label>
              </div>

              <label className="block space-y-2 text-xs font-medium text-[#4b5e54]">
                <span className="flex items-center gap-2">
                  <BookOpen className="size-3.5 text-[#728078]" />
                  Lĩnh vực học tập
                </span>
                <select
                  className="h-11 w-full appearance-none rounded-xl border border-[#dcd7cc] bg-white px-3.5 text-sm text-[#263d31] outline-none transition focus:border-[#799483] focus:ring-3 focus:ring-[#799483]/15"
                  defaultValue={profile?.learning_field ?? ""}
                  disabled={isProfileLocked}
                  name="learningField"
                  required
                >
                  <option disabled value="">
                    Chọn lĩnh vực học tập
                  </option>
                  {learningFields.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2 text-xs font-medium text-[#4b5e54]">
                <span className="flex items-center gap-2">
                  <Mail className="size-3.5 text-[#728078]" />
                  Email học sinh
                </span>
                <input
                  className="h-11 w-full rounded-xl border border-[#dcd7cc] bg-white px-3.5 text-sm text-[#263d31] outline-none transition placeholder:text-[#a6ada9] focus:border-[#799483] focus:ring-3 focus:ring-[#799483]/15"
                  defaultValue={profile?.student_email ?? user.email ?? ""}
                  disabled={isProfileLocked}
                  maxLength={254}
                  name="studentEmail"
                  placeholder="student@mks.edu.vn"
                  required
                  type="email"
                />
              </label>

              <div className="rounded-2xl border border-[#e6e1d7] bg-[#f5f2e9] px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8b948f]">
                  Email đăng nhập
                </p>
                <p className="mt-1 text-sm text-[#56675e]">{user.email}</p>
              </div>

              <div className="flex justify-end border-t border-[#e7e2d7] pt-6">
                <button
                  className="flex h-11 items-center gap-2 rounded-full bg-[#275641] px-6 text-sm font-medium text-white shadow-[0_10px_24px_rgba(39,86,65,0.18)] transition hover:bg-[#1f4635] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#52715f] disabled:cursor-not-allowed disabled:bg-[#a6afa9] disabled:shadow-none"
                  disabled={isProfileLocked}
                  type="submit"
                >
                  {isProfileLocked ? (
                    <LockKeyhole className="size-4" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  {isProfileLocked ? "Hồ sơ đã khóa" : "Lưu thông tin"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
