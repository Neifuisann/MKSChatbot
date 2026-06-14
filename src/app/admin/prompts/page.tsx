import { BookOpenText, Plus, Trash2 } from "lucide-react";

import { AdminNotice, AdminPageHeader, AdminStatCard, adminButtonClass, adminInputClass, adminPanelClass } from "@/components/admin-page";
import { listAdminPrompts, type AdminPrompt } from "@/lib/admin/store";
import { deletePrompt, savePrompt } from "../actions";

type PageProps = { searchParams: Promise<{ error?: string; saved?: string }> };

function PromptForm({ prompt }: { prompt?: AdminPrompt }) {
  return (
    <form action={savePrompt.bind(null, prompt?.id ?? null)} className="mt-5 grid gap-4">
      <div className="grid gap-4 sm:grid-cols-[120px_1fr_1fr]">
        <Field defaultValue={prompt?.code} label="Mã" name="code" />
        <Field defaultValue={prompt?.category} label="Danh mục" name="category" />
        <Field defaultValue={prompt?.title} label="Tiêu đề" name="title" />
      </div>
      <Field defaultValue={prompt?.purpose} label="Mục đích" name="purpose" />
      <label className="text-xs font-medium text-[#566b60]">Nội dung prompt<textarea className={`${adminInputClass} mt-2 min-h-36 py-3 leading-6`} defaultValue={prompt?.content} name="content" required /></label>
      <label className="text-xs font-medium text-[#566b60]">Mẹo sử dụng<textarea className={`${adminInputClass} mt-2 min-h-20 py-3`} defaultValue={prompt?.tip} name="tip" /></label>
      <div className="flex flex-wrap items-center gap-5">
        <Field defaultValue={prompt?.sortOrder ?? 0} label="Thứ tự" name="sortOrder" type="number" />
        <label className="mt-5 flex items-center gap-2 text-xs text-[#566b60]"><input defaultChecked={prompt?.isActive ?? true} name="isActive" type="checkbox" />Hiển thị trong thư viện</label>
      </div>
      <div className="flex justify-end gap-3 border-t border-[#d5dfd8] pt-4">
        {prompt && <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d9b4a6] px-4 text-sm text-[#994f3b] hover:bg-[#f7e9e3]" formAction={deletePrompt.bind(null, prompt.id)}><Trash2 className="size-4" /> Xóa</button>}
        <button className={adminButtonClass} type="submit">Lưu prompt</button>
      </div>
    </form>
  );
}

function Field({ defaultValue, label, name, type = "text" }: { defaultValue?: number | string; label: string; name: string; type?: string }) {
  return <label className="min-w-28 flex-1 text-xs font-medium text-[#566b60]">{label}<input className={`${adminInputClass} mt-2 h-11`} defaultValue={defaultValue} min={type === "number" ? 0 : undefined} name={name} required type={type} /></label>;
}

export default async function AdminPromptsPage({ searchParams }: PageProps) {
  const [prompts, messages] = await Promise.all([listAdminPrompts(), searchParams]);
  return (
    <section className="min-w-0 flex-1 overflow-y-auto px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl pb-20 pt-6">
        <AdminPageHeader description="Biên tập prompt nghiên cứu và kiểm soát nội dung nào đang hiển thị trong thư viện sinh viên." eyebrow="Nội dung hỗ trợ AI" title="Kho prompt." />
        <div className="mt-8 max-w-sm"><AdminStatCard icon={BookOpenText} label="Tổng prompt" value={prompts.length} /></div>
        <AdminNotice error={messages.error} success={messages.saved} />
        <details className={`${adminPanelClass} mt-8`}>
          <summary className="flex cursor-pointer list-none items-center gap-2 font-serif text-xl text-[#294536] [&::-webkit-details-marker]:hidden"><Plus className="size-4" /> Thêm prompt mới</summary>
          <PromptForm />
        </details>
        <div className="mt-5 flex flex-col gap-4">
          {prompts.map((prompt) => (
            <details className={adminPanelClass} key={prompt.id}>
              <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-xs text-[#a75942]">{prompt.code} · {prompt.category}</p><h2 className="mt-2 font-serif text-xl text-[#294536]">{prompt.title}</h2></div><span className={prompt.isActive ? "text-xs text-[#3f745b]" : "text-xs text-[#9b5b46]"}>{prompt.isActive ? "Đang hiển thị" : "Đã ẩn"}</span></div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#566b60]">{prompt.purpose}</p>
              </summary>
              <PromptForm prompt={prompt} />
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
