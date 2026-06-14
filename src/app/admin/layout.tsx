import { AdminSidebar } from "@/components/admin-sidebar";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin();

  return (
    <main className="flex h-dvh overflow-hidden bg-[#e9efeb] text-[#294536]">
      <AdminSidebar email={admin.email} name={admin.name} />
      {children}
    </main>
  );
}
