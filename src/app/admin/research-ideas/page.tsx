import { CheckCircle2, Clock3, FlaskConical, Trash2 } from "lucide-react";

import {
  AdminNotice,
  AdminPageHeader,
  AdminStatCard,
  adminButtonClass,
  adminInputClass,
  adminPanelClass,
} from "@/components/admin-page";
import { listAdminResearchIdeas } from "@/lib/admin/store";
import { deleteResearchIdeaAsAdmin, reviewResearchIdea } from "../actions";

type PageProps = {
  searchParams: Promise<{ error?: string; saved?: string }>;
};

const formatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function AdminResearchIdeasPage({ searchParams }: PageProps) {
  const [ideas, messages] = await Promise.all([
    listAdminResearchIdeas(),
    searchParams,
  ]);
  const pending = ideas.filter((idea) => idea.status === "pending").length;

  return (
    <section className="min-w-0 flex-1 overflow-y-auto px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl pb-20 pt-6">
        <AdminPageHeader
          description="Xem nội dung sinh viên gửi, để lại phản hồi chính thức và duyệt những ý tưởng sẵn sàng triển khai."
          eyebrow="Nghiên cứu sinh viên"
          title="Ý tưởng nghiên cứu."
        />
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <AdminStatCard icon={FlaskConical} label="Tổng ý tưởng" value={ideas.length} />
          <AdminStatCard icon={Clock3} label="Chờ duyệt" value={pending} />
          <AdminStatCard icon={CheckCircle2} label="Đã duyệt" value={ideas.length - pending} />
        </div>
        <AdminNotice error={messages.error} success={messages.saved} />

        <div className="mt-8 flex flex-col gap-4">
          {ideas.map((idea) => (
            <article className={adminPanelClass} key={idea.id}>
              <div className="flex flex-col justify-between gap-4 border-b border-[#d5dfd8] pb-5 sm:flex-row">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#71847a]">
                    <span className={idea.status === "approved" ? "text-[#3f745b]" : "text-[#a35d46]"}>
                      {idea.status === "approved" ? "Đã duyệt" : "Chờ duyệt"}
                    </span>
                    <span>·</span>
                    <span>{idea.field}</span>
                    <span>·</span>
                    <span>{formatter.format(new Date(idea.createdAt))}</span>
                  </div>
                  <h2 className="mt-2 font-serif text-2xl text-[#294536]">{idea.title}</h2>
                  <p className="mt-2 text-xs text-[#71847a]">
                    {idea.ownerName} · {idea.ownerEmail}
                  </p>
                </div>
                <form action={deleteResearchIdeaAsAdmin.bind(null, idea.id)}>
                  <button
                    className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#d9b4a6] px-3 text-xs text-[#994f3b] transition hover:bg-[#f7e9e3]"
                    type="submit"
                  >
                    <Trash2 className="size-3.5" />
                    Xóa
                  </button>
                </form>
              </div>
              <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[#566b60]">
                {idea.description}
              </p>
              <form
                action={reviewResearchIdea.bind(null, idea.id)}
                className="mt-5 grid gap-4 border-t border-[#d5dfd8] pt-5 lg:grid-cols-[1fr_180px_auto]"
              >
                <label className="text-xs font-medium text-[#566b60]">
                  Phản hồi cho sinh viên
                  <textarea
                    className={`${adminInputClass} mt-2 min-h-24 py-3 leading-6`}
                    defaultValue={idea.adminResponse ?? ""}
                    disabled={idea.status === "approved"}
                    maxLength={5000}
                    name="adminResponse"
                    placeholder="Nhận xét, yêu cầu bổ sung hoặc hướng phát triển..."
                  />
                </label>
                <label className="text-xs font-medium text-[#566b60]">
                  Trạng thái
                  <select
                    className={`${adminInputClass} mt-2 h-11`}
                    defaultValue={idea.status}
                    disabled={idea.status === "approved"}
                    name="status"
                  >
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Duyệt ý tưởng</option>
                  </select>
                </label>
                <button className={`${adminButtonClass} self-end`} disabled={idea.status === "approved"} type="submit">
                  Lưu đánh giá
                </button>
              </form>
            </article>
          ))}
          {ideas.length === 0 && (
            <div className={`${adminPanelClass} py-16 text-center text-sm text-[#71847a]`}>
              Chưa có ý tưởng nghiên cứu nào.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
