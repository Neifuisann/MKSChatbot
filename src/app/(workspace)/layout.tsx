import { redirect } from "next/navigation";

import { WorkspaceSidebar } from "@/components/workspace-sidebar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("student_id, full_name")
    .eq("user_id", user.id)
    .maybeSingle();

  const metadataName =
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata.name === "string"
        ? user.user_metadata.name
        : undefined;
  const avatarUrl =
    typeof user.user_metadata.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : typeof user.user_metadata.picture === "string"
        ? user.user_metadata.picture
        : undefined;

  return (
    <main className="flex h-dvh overflow-hidden bg-[#f7f5ef] text-[#2b332e]">
      <WorkspaceSidebar
        user={{
          avatarUrl,
          email: user.email,
          name: profile?.full_name || metadataName || user.email || "MKS Student",
          studentId: profile?.student_id,
        }}
      />
      {children}
    </main>
  );
}
