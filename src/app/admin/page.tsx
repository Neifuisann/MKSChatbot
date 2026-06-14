import { BookOpenText, Boxes, FlaskConical, UsersRound } from "lucide-react";
import Link from "next/link";

import {
  AdminPageHeader,
  AdminStatCard,
  adminPanelClass,
} from "@/components/admin-page";
import { getAdminDashboardCounts } from "@/lib/admin/store";

const sections = [
  {
    description: "Đọc, phản hồi và duyệt các đề xuất nghiên cứu của sinh viên.",
    href: "/admin/research-ideas",
    label: "Ý tưởng nghiên cứu",
  },
  {
    description: "Quản lý không gian, thiết bị, công cụ và năng lực phục vụ.",
    href: "/admin/makerspace",
    label: "Thiết bị Makerspace",
  },
  {
    description: "Biên tập nội dung, thứ tự và trạng thái hiển thị của prompt.",
    href: "/admin/prompts",
    label: "Kho prompt",
  },
  {
    description: "Xem tài khoản, chỉnh sửa hồ sơ học tập và xóa người dùng.",
    href: "/admin/users",
    label: "Người dùng",
  },
] as const;

export default async function AdminDashboardPage() {
  const counts = await getAdminDashboardCounts();

  return (
    <section className="min-w-0 flex-1 overflow-y-auto bg-[#e9efeb] px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl pb-20 pt-6">
        <AdminPageHeader
          description="Theo dõi và cập nhật các nội dung vận hành chính của MKS Assistant từ một nơi."
          eyebrow="Trung tâm vận hành"
          title="Tổng quan quản lý."
        />

        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard icon={UsersRound} label="Người dùng" value={counts.users} />
          <AdminStatCard icon={FlaskConical} label="Ý tưởng" value={counts.researchIdeas} />
          <AdminStatCard icon={Boxes} label="Tài nguyên hoạt động" value={counts.activeResources} />
          <AdminStatCard icon={BookOpenText} label="Prompt" value={counts.prompts} />
        </div>

        <section className="mt-10 grid gap-4 lg:grid-cols-2">
          {sections.map((section) => (
            <Link
              className={`${adminPanelClass} group transition hover:-translate-y-0.5 hover:border-[#b8c9be] hover:bg-[#f3f7f4]`}
              href={section.href}
              key={section.href}
            >
              <h2 className="font-serif text-2xl text-[#294536]">{section.label}</h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-[#667a70]">
                {section.description}
              </p>
              <span className="mt-6 block text-xs font-medium text-[#a75942]">
                Mở khu vực quản lý →
              </span>
            </Link>
          ))}
        </section>
      </div>
    </section>
  );
}
