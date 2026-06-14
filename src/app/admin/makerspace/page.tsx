import { Boxes, Plus, Trash2 } from "lucide-react";

import {
  AdminNotice,
  AdminPageHeader,
  AdminStatCard,
  adminButtonClass,
  adminInputClass,
  adminPanelClass,
} from "@/components/admin-page";
import { listAdminResources, type AdminResource } from "@/lib/admin/store";
import { makerspaceResourceCategories } from "@/schemas/makerspace-booking";
import { deleteResource, saveResource } from "../actions";

type PageProps = { searchParams: Promise<{ error?: string; saved?: string }> };

function ResourceForm({ resource }: { resource?: AdminResource }) {
  return (
    <form action={saveResource.bind(null, resource?.id ?? null)} className="mt-5 grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field defaultValue={resource?.name} label="Tên tài nguyên" name="name" />
        <label className="text-xs font-medium text-[#566b60]">
          Loại tài nguyên
          <select className={`${adminInputClass} mt-2 h-11`} defaultValue={resource?.category} name="category">
            {makerspaceResourceCategories.map((category) => <option key={category}>{category}</option>)}
          </select>
        </label>
        <Field defaultValue={resource?.location} label="Vị trí" name="location" />
        <div className="grid grid-cols-2 gap-3">
          <Field defaultValue={resource?.capacity ?? 1} label="Số lượng" name="capacity" type="number" />
          <Field defaultValue={resource?.maxPeople ?? 1} label="Số người tối đa" name="maxPeople" type="number" />
        </div>
      </div>
      <label className="text-xs font-medium text-[#566b60]">
        Mô tả
        <textarea className={`${adminInputClass} mt-2 min-h-24 py-3`} defaultValue={resource?.description} name="description" required />
      </label>
      <div className="flex flex-wrap gap-5 text-xs text-[#566b60]">
        <Check defaultChecked={resource?.isActive ?? true} label="Đang hoạt động" name="isActive" />
        <Check defaultChecked={resource?.autoApprove ?? false} label="Tự động duyệt lịch" name="autoApprove" />
      </div>
      <div className="flex justify-end gap-3 border-t border-[#d5dfd8] pt-4">
        {resource && (
          <button
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d9b4a6] px-4 text-sm text-[#994f3b] hover:bg-[#f7e9e3]"
            formAction={deleteResource.bind(null, resource.id)}
          >
            <Trash2 className="size-4" /> Xóa
          </button>
        )}
        <button className={adminButtonClass} type="submit">Lưu tài nguyên</button>
      </div>
    </form>
  );
}

function Field({ defaultValue, label, name, type = "text" }: { defaultValue?: number | string; label: string; name: string; type?: string }) {
  return <label className="text-xs font-medium text-[#566b60]">{label}<input className={`${adminInputClass} mt-2 h-11`} defaultValue={defaultValue} min={type === "number" ? 1 : undefined} name={name} required type={type} /></label>;
}

function Check({ defaultChecked, label, name }: { defaultChecked: boolean; label: string; name: string }) {
  return <label className="flex items-center gap-2"><input defaultChecked={defaultChecked} name={name} type="checkbox" />{label}</label>;
}

export default async function AdminMakerspacePage({ searchParams }: PageProps) {
  const [resources, messages] = await Promise.all([listAdminResources(), searchParams]);
  return (
    <section className="min-w-0 flex-1 overflow-y-auto px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl pb-20 pt-6">
        <AdminPageHeader description="Thêm, chỉnh sửa, tắt hoạt động hoặc xóa các không gian và thiết bị mà sinh viên có thể đặt lịch." eyebrow="Vận hành Makerspace" title="Tài nguyên Makerspace." />
        <div className="mt-8 max-w-sm"><AdminStatCard icon={Boxes} label="Tổng tài nguyên" value={resources.length} /></div>
        <AdminNotice error={messages.error} success={messages.saved} />
        <details className={`${adminPanelClass} mt-8`}>
          <summary className="flex cursor-pointer list-none items-center gap-2 font-serif text-xl text-[#294536] [&::-webkit-details-marker]:hidden"><Plus className="size-4" /> Thêm tài nguyên mới</summary>
          <ResourceForm />
        </details>
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {resources.map((resource) => (
            <details className={adminPanelClass} key={resource.id}>
              <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <div className="flex items-start justify-between gap-4">
                  <div><h2 className="font-serif text-xl text-[#294536]">{resource.name}</h2><p className="mt-1 text-xs text-[#71847a]">{resource.category} · {resource.location}</p></div>
                  <span className={resource.isActive ? "text-xs text-[#3f745b]" : "text-xs text-[#9b5b46]"}>{resource.isActive ? "Hoạt động" : "Đã tắt"}</span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#566b60]">{resource.description}</p>
              </summary>
              <ResourceForm resource={resource} />
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
