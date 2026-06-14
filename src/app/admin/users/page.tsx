import { Trash2, UsersRound } from "lucide-react";

import { AdminNotice, AdminPageHeader, AdminStatCard, adminButtonClass, adminInputClass, adminPanelClass } from "@/components/admin-page";
import { listAdminUsers } from "@/lib/admin/store";
import { learningFields } from "@/schemas/profile";
import { deleteUser, updateUserProfile } from "../actions";

type PageProps = { searchParams: Promise<{ error?: string; saved?: string }> };

const formatter = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" });

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const [users, messages] = await Promise.all([listAdminUsers(), searchParams]);
  return (
    <section className="min-w-0 flex-1 overflow-y-auto px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl pb-20 pt-6">
        <AdminPageHeader description="Kiểm tra tài khoản đăng nhập, chỉnh sửa hồ sơ học tập đã khai báo và xóa tài khoản không còn sử dụng." eyebrow="Quản trị truy cập" title="Danh sách người dùng." />
        <div className="mt-8 max-w-sm"><AdminStatCard icon={UsersRound} label="Tổng tài khoản" value={users.length} /></div>
        <AdminNotice error={messages.error} success={messages.saved} />
        <div className="mt-8 flex flex-col gap-4">
          {users.map((user) => (
            <details className={adminPanelClass} key={user.id}>
              <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div><div className="flex flex-wrap items-center gap-2"><h2 className="font-serif text-xl text-[#294536]">{user.fullName || user.email}</h2><span className={user.role === "admin" ? "text-xs text-[#a35d46]" : "text-xs text-[#3f745b]"}>{user.role}</span></div><p className="mt-1 text-xs text-[#71847a]">{user.email} · Tham gia {formatter.format(new Date(user.createdAt))}</p></div>
                  <span className="text-xs text-[#71847a]">{user.lastSignInAt ? `Đăng nhập ${formatter.format(new Date(user.lastSignInAt))}` : "Chưa đăng nhập"}</span>
                </div>
              </summary>
              {user.fullName && user.studentId && user.studentEmail && user.learningField ? (
                <form action={updateUserProfile.bind(null, user.id)} className="mt-5 grid gap-4 border-t border-[#d5dfd8] pt-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field defaultValue={user.fullName} label="Họ và tên" name="fullName" />
                    <Field defaultValue={user.studentId} label="Mã học sinh" name="studentId" />
                    <Field defaultValue={user.studentEmail} label="Email học sinh" name="studentEmail" type="email" />
                    <label className="text-xs font-medium text-[#566b60]">Lĩnh vực học tập<select className={`${adminInputClass} mt-2 h-11`} defaultValue={user.learningField} name="learningField">{learningFields.map((field) => <option key={field}>{field}</option>)}</select></label>
                  </div>
                  <div className="flex justify-end gap-3 border-t border-[#d5dfd8] pt-4">
                    <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d9b4a6] px-4 text-sm text-[#994f3b] hover:bg-[#f7e9e3]" formAction={deleteUser.bind(null, user.id)}><Trash2 className="size-4" /> Xóa người dùng</button>
                    <button className={adminButtonClass} type="submit">Lưu hồ sơ</button>
                  </div>
                </form>
              ) : (
                <form action={deleteUser.bind(null, user.id)} className="mt-5 flex items-center justify-between gap-4 border-t border-[#d5dfd8] pt-5">
                  <p className="text-sm text-[#71847a]">Người dùng chưa khai báo hồ sơ học tập.</p>
                  <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d9b4a6] px-4 text-sm text-[#994f3b] hover:bg-[#f7e9e3]"><Trash2 className="size-4" /> Xóa người dùng</button>
                </form>
              )}
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Field({ defaultValue, label, name, type = "text" }: { defaultValue: string; label: string; name: string; type?: string }) {
  return <label className="text-xs font-medium text-[#566b60]">{label}<input className={`${adminInputClass} mt-2 h-11`} defaultValue={defaultValue} name={name} required type={type} /></label>;
}
