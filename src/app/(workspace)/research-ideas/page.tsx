import {
  BadgeCheck,
  Clock3,
  FlaskConical,
  Lightbulb,
  LockKeyhole,
  MessageSquareText,
  PencilLine,
} from "lucide-react";
import { redirect } from "next/navigation";

import { DeleteResearchIdeaForm } from "@/components/delete-research-idea-form";
import { ResearchIdeaFeedback } from "@/components/research-idea-feedback";
import { ResearchIdeaFields } from "@/components/research-idea-fields";
import { ResearchIdeaSubmitButton } from "@/components/research-idea-submit-button";
import { listResearchIdeas } from "@/lib/research-ideas/store";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  editResearchIdea,
  removeResearchIdea,
  submitResearchIdea,
} from "./actions";

export const dynamic = "force-dynamic";

type ResearchIdeasPageProps = {
  searchParams: Promise<{
    deleted?: string;
    error?: string;
    saved?: string;
    updated?: string;
  }>;
};

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function ResearchIdeasPage({
  searchParams,
}: ResearchIdeasPageProps) {
  const messages = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const ideas = await listResearchIdeas(user.id);
  const pendingCount = ideas.filter((idea) => idea.status === "pending").length;
  const limitReached = pendingCount >= 3;
  const successMessage = messages.saved
    ? "Ý tưởng đã được lưu cùng đánh giá AI sơ bộ."
    : messages.updated
      ? "Ý tưởng đã được cập nhật và đánh giá lại."
      : messages.deleted
        ? "Ý tưởng đã được xóa."
        : undefined;

  return (
    <section className="relative min-w-0 flex-1 overflow-y-auto bg-[#f7f5ef] px-5 py-5 text-[#24352d] sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute -left-32 top-48 size-80 rounded-full bg-[#d9b5a5]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-16 size-96 rounded-full bg-[#b6cdbd]/25 blur-3xl" />

      <div className="relative mx-auto max-w-6xl pb-20 pt-10 lg:pt-14">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a35d46]">
            Đăng ký ý tưởng ban đầu
          </p>
          <h1 className="mt-4 font-serif text-4xl tracking-[-0.04em] text-[#20382d] sm:text-5xl">
            Gửi ý tưởng nghiên cứu.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-[#68766f]">
            Điền thông tin cốt lõi để nhận đánh giá AI sơ bộ và lưu ý tưởng vào
            hệ thống. Ý tưởng đã được duyệt sẽ được khóa để bảo toàn nội dung.
          </p>
        </header>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#e4dfd5] bg-[#fbfaf6]/85 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#8b948f]">
              Đang chờ duyệt
            </p>
            <p className="mt-1 font-serif text-2xl text-[#294536]">
              {pendingCount}/3
            </p>
          </div>
          <div className="rounded-2xl border border-[#e4dfd5] bg-[#fbfaf6]/85 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#8b948f]">
              Đã duyệt
            </p>
            <p className="mt-1 font-serif text-2xl text-[#294536]">
              {ideas.length - pendingCount}
            </p>
          </div>
          <div className="rounded-2xl border border-[#e4dfd5] bg-[#fbfaf6]/85 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#8b948f]">
              Tổng ý tưởng
            </p>
            <p className="mt-1 font-serif text-2xl text-[#294536]">{ideas.length}</p>
          </div>
        </div>

        {successMessage && (
          <p className="mt-6 rounded-2xl border border-[#bfd5c5] bg-[#eaf3eb] px-4 py-3 text-sm text-[#356249]">
            {successMessage}
          </p>
        )}
        {messages.error && (
          <p className="mt-6 rounded-2xl border border-[#dfb8a9] bg-[#f8eae4] px-4 py-3 text-sm text-[#8b4935]">
            {messages.error}
          </p>
        )}

        <section className="mt-8 rounded-[2rem] border border-white/80 bg-[#fffdfa]/90 p-4 shadow-[0_30px_80px_rgba(67,74,61,0.1)] backdrop-blur sm:p-6">
          <div className="rounded-[1.5rem] border border-[#e5e0d5] bg-[#fbfaf6] p-5 sm:p-8">
            <div className="flex items-start justify-between gap-5 border-b border-[#e7e2d7] pb-6">
              <div>
                <p className="font-serif text-2xl text-[#294536]">Ý tưởng mới</p>
                <p className="mt-1 text-xs leading-5 text-[#7a857f]">
                  AI sẽ đánh giá sơ bộ trước khi ý tưởng được lưu.
                </p>
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#f3e6df] text-[#9b5b46]">
                <Lightbulb className="size-4.5" />
              </span>
            </div>

            {limitReached && (
              <p className="mt-6 rounded-2xl border border-[#e2c7b8] bg-[#f8eee8] px-4 py-3 text-sm leading-6 text-[#7f5141]">
                Bạn đã có 3 ý tưởng đang chờ duyệt. Hãy chỉnh sửa hoặc xóa một ý
                tưởng trước khi gửi thêm.
              </p>
            )}

            <form action={submitResearchIdea} className="mt-7">
              <ResearchIdeaFields disabled={limitReached} />
              <div className="mt-6 flex justify-end border-t border-[#e7e2d7] pt-6">
                <ResearchIdeaSubmitButton disabled={limitReached} mode="create" />
              </div>
            </form>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-serif text-3xl tracking-[-0.03em] text-[#20382d]">
                Ý tưởng của bạn
              </p>
              <p className="mt-1 text-sm text-[#7a857f]">
                Theo dõi đánh giá và hoàn thiện ý tưởng trước khi được duyệt.
              </p>
            </div>
          </div>

          {ideas.length === 0 ? (
            <div className="mt-6 rounded-[1.75rem] border border-dashed border-[#d7d1c7] bg-[#fbfaf6]/70 px-6 py-14 text-center">
              <FlaskConical className="mx-auto size-7 text-[#a47a67]" />
              <p className="mt-4 font-serif text-xl text-[#3c4c43]">
                Chưa có ý tưởng nghiên cứu
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7a857f]">
                Ý tưởng đầu tiên của bạn sẽ xuất hiện tại đây cùng phản hồi AI.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {ideas.map((idea) => {
                const isApproved = idea.status === "approved";
                return (
                  <article
                    className="rounded-[1.75rem] border border-[#e2ddd3] bg-[#fffdfa]/90 p-5 shadow-[0_18px_50px_rgba(67,74,61,0.07)] sm:p-7"
                    key={idea.id}
                  >
                    <div className="flex flex-col justify-between gap-4 border-b border-[#e8e3d9] pb-5 sm:flex-row sm:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={
                              isApproved
                                ? "flex items-center gap-1.5 rounded-full bg-[#dcebdd] px-3 py-1 text-[11px] font-medium text-[#376149]"
                                : "flex items-center gap-1.5 rounded-full bg-[#f2e8df] px-3 py-1 text-[11px] font-medium text-[#8b5c47]"
                            }
                          >
                            {isApproved ? (
                              <BadgeCheck className="size-3.5" />
                            ) : (
                              <Clock3 className="size-3.5" />
                            )}
                            {isApproved ? "Đã duyệt" : "Đang chờ duyệt"}
                          </span>
                          <span className="text-xs text-[#8b928e]">{idea.field}</span>
                        </div>
                        <h2 className="mt-3 font-serif text-2xl text-[#294536]">
                          {idea.title}
                        </h2>
                        <p className="mt-2 text-xs text-[#8b928e]">
                          Cập nhật {dateFormatter.format(new Date(idea.updatedAt))}
                        </p>
                      </div>
                      {isApproved && (
                        <span className="flex shrink-0 items-center gap-2 text-xs text-[#527060]">
                          <LockKeyhole className="size-3.5" />
                          Nội dung đã khóa
                        </span>
                      )}
                    </div>

                    <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[#536159]">
                      {idea.description}
                    </p>

                    <div className="mt-5">
                      <ResearchIdeaFeedback feedback={idea.aiFeedback} />
                    </div>

                    {idea.adminResponse && (
                      <section className="mt-5 rounded-2xl border border-[#e2c7b8] bg-[#f8eee8] p-4">
                        <p className="flex items-center gap-2 text-xs font-semibold text-[#8a604d]">
                          <MessageSquareText className="size-3.5" />
                          Phản hồi từ nhà trường
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#655950]">
                          {idea.adminResponse}
                        </p>
                      </section>
                    )}

                    {!isApproved && (
                      <details className="mt-5 rounded-2xl border border-[#e4dfd5] bg-[#fbfaf6]">
                        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium text-[#536159] [&::-webkit-details-marker]:hidden">
                          <PencilLine className="size-4" />
                          Chỉnh sửa ý tưởng
                        </summary>
                        <form
                          action={editResearchIdea.bind(null, idea.id)}
                          className="border-t border-[#e7e2d7] p-4"
                        >
                          <ResearchIdeaFields defaultValues={idea} />
                          <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-[#e7e2d7] pt-5">
                            <DeleteResearchIdeaForm
                              action={removeResearchIdea.bind(null, idea.id)}
                            />
                            <ResearchIdeaSubmitButton mode="edit" />
                          </div>
                        </form>
                      </details>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
